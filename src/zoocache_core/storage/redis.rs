use crate::utils::now_secs;
use crate::utils::to_conn_err;
use pyo3::prelude::*;
use r2d2::Pool;
use redis::{Client, Commands};
use std::sync::Arc;

use super::{CacheEntry, Storage};

pub(crate) struct RedisStorage {
    pool: Pool<Client>,
    prefix: String,
}

impl RedisStorage {
    pub fn new(url: &str, prefix: Option<&str>) -> Result<Self, redis::RedisError> {
        let client = Client::open(url)?;
        let pool = Pool::builder()
            .build(client)
            .map_err(|e| redis::RedisError::from(std::io::Error::other(e)))?;

        Ok(Self {
            pool,
            prefix: prefix.unwrap_or("zoocache").to_string(),
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
        let data: Vec<u8> = match conn.get(self.full_key(key)) {
            Ok(d) => d,
            Err(_) => return super::StorageResult::NotFound,
        };

        let result = Python::attach(|py| CacheEntry::deserialize(py, &data).ok().map(Arc::new));

        match result {
            Some(entry) => {
                let _: redis::RedisResult<()> = conn.zadd(self.lru_key(), key, now_secs() as f64);
                super::StorageResult::Hit(entry)
            }
            None => super::StorageResult::NotFound,
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
}
