use crate::utils::now_secs;
use crate::utils::to_conn_err;
use async_trait::async_trait;
use pyo3::prelude::*;
use redis::aio::MultiplexedConnection;
use redis::{AsyncCommands, Client};
use std::sync::Arc;
use tokio::sync::RwLock;

use super::{CacheEntry, Storage, StorageResult};

pub(crate) struct RedisStorage {
    client: Client,
    connection: Arc<RwLock<Option<MultiplexedConnection>>>,
    prefix: String,
    lru_update_interval: u64,
}

const GET_AND_TOUCH_SCRIPT: &str = r#"
    local val = redis.call('GET', KEYS[1])
    local pttl = redis.call('PTTL', KEYS[1])
    if val then
        local current_score = redis.call('ZSCORE', KEYS[2], ARGV[2])
        if not current_score or (tonumber(ARGV[1]) - tonumber(current_score) >= tonumber(ARGV[3])) then
            redis.call('ZADD', KEYS[2], ARGV[1], ARGV[2])
        end
    end
    return {val, pttl}
"#;

impl RedisStorage {
    pub fn new(
        url: &str,
        prefix: Option<&str>,
        lru_update_interval: u64,
    ) -> Result<Self, redis::RedisError> {
        let client = Client::open(url)?;
        Ok(Self {
            client,
            connection: Arc::new(RwLock::new(None)),
            prefix: prefix.unwrap_or("zoocache").to_string(),
            lru_update_interval,
        })
    }

    async fn get_conn(&self) -> Result<MultiplexedConnection, redis::RedisError> {
        let mut conn_guard = self.connection.write().await;
        if let Some(conn) = &*conn_guard {
            return Ok(conn.clone());
        }

        let conn = self.client.get_multiplexed_async_connection().await?;
        *conn_guard = Some(conn.clone());
        Ok(conn)
    }

    fn full_key(&self, key: &str) -> String {
        format!("{}:{}", self.prefix, key)
    }

    fn lru_key(&self) -> String {
        format!("{}:_lru", self.prefix)
    }

    async fn clear_conn(&self) {
        let mut conn_guard = self.connection.write().await;
        *conn_guard = None;
    }
}

#[async_trait]
impl Storage for RedisStorage {
    async fn get(&self, key: &str) -> StorageResult {
        let mut conn = match self.get_conn().await {
            Ok(c) => c,
            Err(_) => return StorageResult::NotFound,
        };

        let now = now_secs() as f64;
        let script = redis::Script::new(GET_AND_TOUCH_SCRIPT);
        let res: Result<(Vec<u8>, i64), _> = script
            .key(self.full_key(key))
            .key(self.lru_key())
            .arg(now)
            .arg(key)
            .arg(self.lru_update_interval)
            .invoke_async(&mut conn)
            .await;

        if res.is_err() {
            self.clear_conn().await;
        }

        let (data, pttl) = match res {
            Ok(r) => r,
            Err(_) => return StorageResult::NotFound,
        };

        let expires_at = if pttl > 0 {
            Some(now_secs() + (pttl as u64 / 1000))
        } else {
            None
        };

        match Python::attach(|py| CacheEntry::deserialize(py, &data).ok().map(Arc::new)) {
            Some(entry) => StorageResult::Hit(entry, expires_at, Some(data)),
            None => {
                let _: () = redis::pipe()
                    .del(self.full_key(key))
                    .zrem(self.lru_key(), key)
                    .query_async(&mut conn)
                    .await
                    .unwrap_or_default();
                StorageResult::NotFound
            }
        }
    }

    async fn set(&self, key: String, entry: Arc<CacheEntry>, ttl: Option<u64>) -> PyResult<()> {
        let mut conn = self.get_conn().await.map_err(to_conn_err)?;

        if let Some(data) = Python::attach(|py| entry.serialize(py).ok()) {
            let full_key = self.full_key(&key);
            let mut pipe = redis::pipe();

            match ttl {
                Some(t) => pipe.set_ex(&full_key, data, t),
                None => pipe.set(&full_key, data),
            };
            pipe.zadd(self.lru_key(), &key, now_secs() as f64);
            let res: Result<(), redis::RedisError> = pipe.query_async(&mut conn).await;
            if res.is_err() {
                self.clear_conn().await;
            }
            res.map_err(to_conn_err)?;
        }
        Ok(())
    }

    async fn set_raw(&self, key: String, data: Vec<u8>, ttl: Option<u64>) -> PyResult<()> {
        let mut conn = self.get_conn().await.map_err(to_conn_err)?;
        let full_key = self.full_key(&key);
        let mut pipe = redis::pipe();

        match ttl {
            Some(t) => pipe.set_ex(&full_key, data, t),
            None => pipe.set(&full_key, data),
        };
        pipe.zadd(self.lru_key(), &key, now_secs() as f64);
        let res: Result<(), redis::RedisError> = pipe.query_async(&mut conn).await;
        if res.is_err() {
            self.clear_conn().await;
        }
        res.map_err(to_conn_err)?;
        Ok(())
    }

    async fn touch_batch(&self, updates: Vec<(String, Option<u64>)>) -> PyResult<()> {
        let mut conn = self.get_conn().await.map_err(to_conn_err)?;
        let now = now_secs() as f64;
        let mut pipe = redis::pipe();

        for (key, ttl) in updates {
            if let Some(t) = ttl {
                pipe.expire(self.full_key(&key), t as i64);
            }
            pipe.zadd(self.lru_key(), &key, now);
        }
        let res: Result<(), redis::RedisError> = pipe.query_async(&mut conn).await;
        if res.is_err() {
            self.clear_conn().await;
        }
        res.map_err(to_conn_err)?;
        Ok(())
    }

    async fn remove(&self, key: &str) -> PyResult<()> {
        let mut conn = self.get_conn().await.map_err(to_conn_err)?;
        let res: Result<(), redis::RedisError> = redis::pipe()
            .del(self.full_key(key))
            .zrem(self.lru_key(), key)
            .query_async(&mut conn)
            .await;
        if res.is_err() {
            self.clear_conn().await;
        }
        res.map_err(to_conn_err)?;
        Ok(())
    }

    async fn clear(&self) -> PyResult<()> {
        let mut conn = self.get_conn().await.map_err(to_conn_err)?;
        let pattern = format!("{}:*", self.prefix);
        let mut cursor: u64 = 0;

        loop {
            let res: Result<(u64, Vec<String>), _> = redis::cmd("SCAN")
                .arg(cursor)
                .arg("MATCH")
                .arg(&pattern)
                .arg("COUNT")
                .arg(500)
                .query_async(&mut conn)
                .await;

            match res {
                Ok((next_cursor, keys)) => {
                    if !keys.is_empty() {
                        let _: redis::RedisResult<()> =
                            redis::cmd("UNLINK").arg(&keys).query_async(&mut conn).await;
                    }
                    cursor = next_cursor;
                    if cursor == 0 {
                        break;
                    }
                }
                Err(_) => break,
            }
        }
        Ok(())
    }

    async fn len(&self) -> usize {
        let mut conn = match self.get_conn().await {
            Ok(c) => c,
            Err(_) => return 0,
        };
        let count: redis::RedisResult<usize> =
            redis::AsyncCommands::zcard(&mut conn, self.lru_key()).await;
        if count.is_err() {
            self.clear_conn().await;
        }
        count.unwrap_or(0)
    }

    async fn evict_lru(&self, count: usize) -> PyResult<Vec<String>> {
        let mut conn = self.get_conn().await.map_err(to_conn_err)?;

        let items: Vec<(String, f64)> = conn
            .zpopmin(self.lru_key(), count as isize)
            .await
            .unwrap_or_default();

        let to_evict: Vec<String> = items.into_iter().map(|(k, _)| k).collect();

        if !to_evict.is_empty() {
            let full_keys: Vec<String> = to_evict.iter().map(|k| self.full_key(k)).collect();
            let _: () = redis::pipe()
                .del(&full_keys)
                .query_async(&mut conn)
                .await
                .map_err(to_conn_err)?;
        }

        Ok(to_evict)
    }

    async fn scan_keys(&self, prefix: &str) -> Vec<(String, Option<u64>)> {
        let mut results = Vec::new();
        let mut conn = match self.get_conn().await {
            Ok(c) => c,
            Err(_) => return results,
        };

        let pattern = format!("{}:{}*", self.prefix, prefix);
        let mut cursor: u64 = 0;

        loop {
            let res: Result<(u64, Vec<String>), _> = redis::cmd("SCAN")
                .arg(cursor)
                .arg("MATCH")
                .arg(&pattern)
                .arg("COUNT")
                .arg(500)
                .query_async(&mut conn)
                .await;

            match res {
                Ok((next_cursor, keys)) => {
                    if !keys.is_empty() {
                        let mut pipe = redis::pipe();
                        for k in &keys {
                            pipe.cmd("PTTL").arg(k);
                        }

                        if let Ok(pttls) = pipe.query_async::<Vec<i64>>(&mut conn).await {
                            for (full_key, pttl) in keys.into_iter().zip(pttls.into_iter()) {
                                if pttl == -2 {
                                    continue;
                                }

                                let original_key = full_key
                                    .strip_prefix(&format!("{}:", self.prefix))
                                    .unwrap_or(&full_key)
                                    .to_string();

                                let expires_at = if pttl > 0 {
                                    Some(now_secs() + (pttl as u64 / 1000))
                                } else {
                                    None
                                };

                                results.push((original_key, expires_at));
                            }
                        }
                    }
                    cursor = next_cursor;
                    if cursor == 0 {
                        break;
                    }
                }
                Err(_) => break,
            }
        }

        results
    }
}
