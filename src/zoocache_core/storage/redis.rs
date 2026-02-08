use crate::utils::now_secs;
use pyo3::prelude::*;
use r2d2::Pool;
use redis::{Client, Commands};
use std::sync::Arc;
use crate::utils::to_conn_err;

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
    fn get(&self, key: &str) -> Option<Arc<CacheEntry>> {
        let mut conn = self.pool.get().ok()?;
        let data: Vec<u8> = conn.get(self.full_key(key)).ok()?;

        let result = Python::attach(|py| CacheEntry::deserialize(py, &data).ok().map(Arc::new));

        if result.is_some() {
            let _: redis::RedisResult<()> = conn.zadd(self.lru_key(), key, now_secs() as f64);
        }

        result
    }

    fn set(&self, key: String, entry: Arc<CacheEntry>, ttl: Option<u64>) -> PyResult<()> {
        let mut conn = self.pool.get().map_err(to_conn_err)?;

        if let Some(data) = Python::attach(|py| entry.serialize(py).ok()) {
            let full_key = self.full_key(&key);
            let _: redis::RedisResult<()> = match ttl {
                Some(t) => conn.set_ex(full_key, data, t),
                None => conn.set(full_key, data),
            };
            let _: redis::RedisResult<()> = conn.zadd(self.lru_key(), &key, now_secs() as f64);
        }
        Ok(())
    }

    fn touch_batch(&self, updates: Vec<(String, Option<u64>)>) -> PyResult<()> {
        let mut conn = self.pool.get().map_err(to_conn_err)?;
        let now = now_secs() as f64;
        for (key, ttl) in updates {
            if let Some(t) = ttl {
                let _: redis::RedisResult<()> = conn.expire(self.full_key(&key), t as i64);
            }
            let _: redis::RedisResult<()> = conn.zadd(self.lru_key(), &key, now);
        }
        Ok(())
    }

    fn remove(&self, key: &str) -> PyResult<()> {
        let mut conn = self.pool.get().map_err(to_conn_err)?;
        let _: redis::RedisResult<()> = conn.del(self.full_key(key));
        let _: redis::RedisResult<()> = conn.zrem(self.lru_key(), key);
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

        let keys: Vec<String> = conn
            .zpopmin(self.lru_key(), count as isize)
            .unwrap_or_default();
        let to_evict: Vec<String> = keys.into_iter().step_by(2).collect();

        if !to_evict.is_empty() {
            let full_keys: Vec<String> = to_evict.iter().map(|k| self.full_key(k)).collect();
            let _: redis::RedisResult<()> = conn.del(&full_keys);
        }

        Ok(to_evict)
    }
}

