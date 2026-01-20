use pyo3::prelude::*;
use redis::{Client, Commands};
use std::sync::Arc;
use r2d2::Pool;

use super::{CacheEntry, Storage};

fn now_secs() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

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

        let result = Python::attach(|py| {
            CacheEntry::deserialize(py, &data).ok().map(Arc::new)
        });

        if result.is_some() {
            let _: redis::RedisResult<()> = conn.zadd(self.lru_key(), key, now_secs() as f64);
        }

        result
    }

    fn set(&self, key: String, entry: Arc<CacheEntry>, ttl: Option<u64>) {
        let Ok(mut conn) = self.pool.get() else {
            return;
        };

        let data = Python::attach(|py| entry.serialize(py).ok());

        if let Some(data) = data {
            let full_key = self.full_key(&key);
            match ttl {
                Some(t) => {
                    let _: redis::RedisResult<()> = conn.set_ex(full_key, data, t);
                }
                None => {
                    let _: redis::RedisResult<()> = conn.set(full_key, data);
                }
            }
            let _: redis::RedisResult<()> = conn.zadd(self.lru_key(), &key, now_secs() as f64);
        }
    }

    fn touch(&self, key: &str, ttl: u64) {
        if let Ok(mut conn) = self.pool.get() {
            let _: redis::RedisResult<()> = conn.expire(self.full_key(key), ttl as i64);
            let _: redis::RedisResult<()> = conn.zadd(self.lru_key(), key, now_secs() as f64);
        }
    }

    fn remove(&self, key: &str) {
        if let Ok(mut conn) = self.pool.get() {
            let _: redis::RedisResult<()> = conn.del(self.full_key(key));
            let _: redis::RedisResult<()> = conn.zrem(self.lru_key(), key);
        }
    }

    fn clear(&self) {
        let Ok(mut conn) = self.pool.get() else {
            return;
        };
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
                        let _: redis::RedisResult<()> = conn.del(keys);
                    }
                    cursor = next_cursor;
                    if cursor == 0 {
                        break;
                    }
                }
                Err(_) => break,
            }
        }
    }

    fn len(&self) -> usize {
        let Ok(mut conn) = self.pool.get() else {
            return 0;
        };
        let count: redis::RedisResult<usize> = conn.zcard(self.lru_key());
        count.unwrap_or(0)
    }

    fn evict_lru(&self, count: usize) -> Vec<String> {
        let Ok(mut conn) = self.pool.get() else {
            return vec![];
        };

        let keys: redis::RedisResult<Vec<String>> = conn.zpopmin(self.lru_key(), count as isize);
        let keys = match keys {
            Ok(k) => k,
            Err(_) => return vec![],
        };

        let to_evict: Vec<String> = keys.into_iter()
            .step_by(2)
            .collect();

        for key in &to_evict {
            let _: redis::RedisResult<()> = conn.del(self.full_key(key));
        }

        to_evict
    }
}

