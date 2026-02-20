use crate::utils::now_secs;
use crate::utils::to_conn_err;
use pyo3::prelude::*;
use r2d2::Pool;
use redis::{Client, Commands};
use std::collections::HashMap;
use std::sync::Arc;

use super::{CacheEntry, Storage};

pub(crate) struct RedisStorage {
    pool: Pool<Client>,
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
        let pool = Pool::builder()
            .build(client)
            .map_err(|e| redis::RedisError::from(std::io::Error::other(e)))?;

        Ok(Self {
            pool,
            prefix: prefix.unwrap_or("zoocache").to_string(),
            lru_update_interval,
        })
    }

    fn full_key(&self, key: &str) -> String {
        format!("{}:{}", self.prefix, key)
    }

    fn lru_key(&self) -> String {
        format!("{}:_lru", self.prefix)
    }
}

impl Storage for RedisStorage {
    fn get(&self, key: &str) -> super::StorageResult {
        let mut conn = match self.pool.get() {
            Ok(c) => c,
            Err(_) => return super::StorageResult::NotFound,
        };

        let now = now_secs() as f64;
        let script = redis::Script::new(GET_AND_TOUCH_SCRIPT);
        let (data, pttl): (Vec<u8>, i64) = match script
            .key(self.full_key(key))
            .key(self.lru_key())
            .arg(now)
            .arg(key)
            .arg(self.lru_update_interval)
            .invoke(&mut conn)
        {
            Ok(res) => res,
            Err(_) => return super::StorageResult::NotFound,
        };

        if data.is_empty() {
            return super::StorageResult::NotFound;
        }

        let result = Python::attach(|py| CacheEntry::deserialize(py, &data).ok().map(Arc::new));
        match result {
            Some(entry) => {
                let expires_at = if pttl > 0 {
                    Some(now_secs() + (pttl as u64 / 1000))
                } else {
                    None
                };
                super::StorageResult::Hit(entry, expires_at)
            }
            None => {
                let _: () = redis::pipe()
                    .del(self.full_key(key))
                    .zrem(self.lru_key(), key)
                    .query(&mut conn)
                    .unwrap_or_default();
                super::StorageResult::NotFound
            }
        }
    }

    fn set(&self, key: String, entry: Arc<CacheEntry>, ttl: Option<u64>) -> PyResult<()> {
        let mut conn = self.pool.get().map_err(to_conn_err)?;

        if let Some(data) = Python::attach(|py| entry.serialize(py).ok()) {
            let full_key = self.full_key(&key);
            let mut pipe = redis::pipe();

            match ttl {
                Some(t) => pipe.set_ex(&full_key, data, t),
                None => pipe.set(&full_key, data),
            };
            pipe.zadd(self.lru_key(), &key, now_secs() as f64);
            let _: () = pipe.query(&mut conn).map_err(to_conn_err)?;
        }
        Ok(())
    }

    fn set_raw(&self, key: String, data: Vec<u8>, ttl: Option<u64>) -> PyResult<()> {
        let mut conn = self.pool.get().map_err(to_conn_err)?;
        let full_key = self.full_key(&key);
        let mut pipe = redis::pipe();

        match ttl {
            Some(t) => pipe.set_ex(&full_key, data, t),
            None => pipe.set(&full_key, data),
        };
        pipe.zadd(self.lru_key(), &key, now_secs() as f64);
        let _: () = pipe.query(&mut conn).map_err(to_conn_err)?;
        Ok(())
    }

    fn touch_batch(&self, updates: Vec<(String, Option<u64>)>) -> PyResult<()> {
        let mut conn = self.pool.get().map_err(to_conn_err)?;
        let now = now_secs() as f64;
        let mut pipe = redis::pipe();

        for (key, ttl) in updates {
            if let Some(t) = ttl {
                pipe.expire(self.full_key(&key), t as i64);
            }
            pipe.zadd(self.lru_key(), &key, now);
        }
        let _: () = pipe.query(&mut conn).map_err(to_conn_err)?;
        Ok(())
    }

    fn remove(&self, key: &str) -> PyResult<()> {
        let mut conn = self.pool.get().map_err(to_conn_err)?;
        let _: () = redis::pipe()
            .del(self.full_key(key))
            .zrem(self.lru_key(), key)
            .query(&mut conn)
            .map_err(to_conn_err)?;
        Ok(())
    }

    fn clear(&self) -> PyResult<()> {
        let mut conn = self.pool.get().map_err(to_conn_err)?;
        let pattern = format!("{}:*", self.prefix);
        let mut cursor: u64 = 0;

        loop {
            let res: Result<(u64, Vec<String>), _> = redis::cmd("SCAN")
                .arg(cursor)
                .arg("MATCH")
                .arg(&pattern)
                .arg("COUNT")
                .arg(500)
                .query(&mut conn);

            match res {
                Ok((next_cursor, keys)) => {
                    if !keys.is_empty() {
                        let _: redis::RedisResult<()> =
                            redis::cmd("UNLINK").arg(&keys).query(&mut conn);
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

    fn len(&self) -> usize {
        let Ok(mut conn) = self.pool.get() else {
            return 0;
        };
        let count: redis::RedisResult<usize> = conn.zcard(self.lru_key());
        count.unwrap_or(0)
    }

    fn evict_lru(&self, count: usize) -> PyResult<Vec<String>> {
        let mut conn = self.pool.get().map_err(to_conn_err)?;

        let items: Vec<(String, f64)> = conn
            .zpopmin(self.lru_key(), count as isize)
            .unwrap_or_default();

        let to_evict: Vec<String> = items.into_iter().map(|(k, _)| k).collect();

        if !to_evict.is_empty() {
            let full_keys: Vec<String> = to_evict.iter().map(|k| self.full_key(k)).collect();
            let _: () = redis::pipe()
                .del(&full_keys)
                .query(&mut conn)
                .map_err(to_conn_err)?;
        }

        Ok(to_evict)
    }

    fn flush_metrics(&self, metrics: HashMap<String, f64>) -> PyResult<()> {
        let mut conn = self.pool.get().map_err(to_conn_err)?;
        let mut pipe = redis::pipe();

        for (key, value) in metrics {
            let redis_key = format!("{}:metrics:{}", self.prefix, key);
            pipe.cmd("INCRBYFLOAT").arg(redis_key).arg(value);
        }

        let _: () = pipe.query(&mut conn).map_err(to_conn_err)?;
        Ok(())
    }
}
