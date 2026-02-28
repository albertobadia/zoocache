use crate::core::Core;
use crate::flight::{FlightStatus, complete_flight, try_enter_flight, wait_for_flight};
use crate::worker::WorkerMsg;
use crate::{RUNTIME, utils};
use pyo3::prelude::*;
use std::sync::Arc;

impl Core {
    pub(crate) fn bridge_get_sync<'py>(
        &self,
        py: Python<'py>,
        key: &str,
    ) -> PyResult<Option<Py<PyAny>>> {
        let status = self.storage.try_get_sync(py, key);
        let (entry, expires_at, raw_data) = match status {
            Some(crate::storage::StorageResult::Hit(e, exp, raw)) => (e, exp, raw),
            Some(crate::storage::StorageResult::Expired) => {
                if let Err(e) = self.storage.try_remove_sync(key) {
                    log::warn!("Failed to remove expired key '{}': {}", key, e);
                }
                if let Some(state) = &self.tti_state
                    && let Err(e) = state.tx.try_send(WorkerMsg::Delete(key.to_string()))
                {
                    log::warn!("Failed to send Delete for expired key '{}': {}", key, e);
                }
                return Ok(None);
            }
            Some(crate::storage::StorageResult::NotFound) => return Ok(None),
            Some(crate::storage::StorageResult::Error) => return Ok(None),
            None => return Ok(None),
        };

        let current_global_version = self.trie.get_global_version();
        if entry.trie_version == current_global_version {
            if self.storage.needs_tti_worker() && self.storage.check_and_update_touch_gate() {
                self.tti_touch(key, self.default_ttl);
            }
            return Ok(Some(entry.value.clone_ref(py)));
        }

        let valid =
            crate::trie::validate_dependencies(&self.trie, &entry.dependencies, utils::now_secs());
        if !valid {
            if let Err(e) = self.storage.try_remove_sync(key) {
                log::warn!("Failed to remove invalid key '{}': {}", key, e);
            }
            if let Some(state) = &self.tti_state
                && let Err(e) = state.tx.try_send(WorkerMsg::Delete(key.to_string()))
            {
                log::warn!("Failed to send Delete for invalid key '{}': {}", key, e);
            }
            return Ok(None);
        }

        if entry.trie_version < current_global_version {
            if let Some(state) = &self.tti_state {
                if let Some(raw) = raw_data {
                    if let Ok(data) = crate::storage::CacheEntry::update_trie_version_raw(
                        &raw,
                        current_global_version,
                    ) && let Err(e) = state.tx.try_send(WorkerMsg::Update(
                        key.to_string(),
                        data,
                        expires_at.map(|e| e.saturating_sub(utils::now_secs())),
                    )) {
                        log::warn!("Failed to send Update for key '{}': {}", key, e);
                    }
                } else {
                    let updated_entry = Arc::new(crate::storage::CacheEntry {
                        value: entry.value.clone_ref(py),
                        dependencies: Arc::clone(&entry.dependencies),
                        trie_version: current_global_version,
                    });
                    if let Err(e) = state.tx.try_send(WorkerMsg::UpdateEntry(
                        key.to_string(),
                        updated_entry,
                        expires_at.map(|e| e.saturating_sub(utils::now_secs())),
                    )) {
                        log::warn!("Failed to send UpdateEntry for key '{}': {}", key, e);
                    }
                }
            }
        } else {
            self.tti_touch(key, self.default_ttl);
        }

        Ok(Some(entry.value.clone_ref(py)))
    }

    pub(crate) fn bridge_get_or_entry_sync<'py>(
        &self,
        py: Python<'py>,
        key: &str,
    ) -> PyResult<(Option<Py<PyAny>>, bool, bool)> {
        match self.bridge_get_sync(py, key)? {
            Some(val) => Ok((Some(val), false, true)),
            None => Ok((None, false, false)),
        }
    }

    pub(crate) fn bridge_get_or_entry<'py>(
        &self,
        py: Python<'py>,
        key: &str,
    ) -> PyResult<(Option<Py<PyAny>>, bool, bool)> {
        let res = self.bridge_get_or_entry_sync(py, key);
        if res.as_ref().is_ok_and(|r| r.2) {
            return res;
        }

        let storage = Arc::clone(&self.storage);
        let flights = self.flights.clone();
        let trie = self.trie.clone();
        let flight_timeout = self.flight_timeout;
        let default_ttl = self.default_ttl;
        let tti_state = self.tti_state.clone();
        let key_owned = key.to_string();

        py.detach(|| {
            RUNTIME.block_on(async move {
                let (flight, is_leader) = try_enter_flight(&flights, &key_owned);
                if !is_leader {
                    let status = wait_for_flight(&flight, flight_timeout).await;
                    return match status {
                        crate::flight::FlightStatus::Done => {
                            let val = Python::attach(|inner_py| {
                                if let Ok(Some(cached_val)) =
                                    self.bridge_get_sync(inner_py, &key_owned)
                                {
                                    Some(cached_val)
                                } else {
                                    None
                                }
                            });
                            Ok((val, false, true))
                        }
                        crate::flight::FlightStatus::Error => {
                            Err(PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(
                                "Thundering herd leader failed",
                            ))
                        }
                        _ => Ok((None, false, false)),
                    };
                }

                let status = storage.get(&key_owned).await;
                let (entry, expires_at, raw_data) = match status {
                    crate::storage::StorageResult::Hit(e, exp, raw) => (e, exp, raw),
                    crate::storage::StorageResult::Expired => {
                        if let Some(state) = &tti_state
                            && let Err(e) = state.tx.try_send(WorkerMsg::Delete(key_owned.clone()))
                        {
                            log::warn!(
                                "Failed to send Delete for expired key '{}': {}",
                                key_owned,
                                e
                            );
                        }
                        return Ok((None, true, false));
                    }
                    crate::storage::StorageResult::NotFound => {
                        return Ok((None, true, false));
                    }
                    crate::storage::StorageResult::Error => {
                        return Ok((None, true, false));
                    }
                };

                let current_global_version = trie.get_global_version();
                let now = utils::now_secs();
                if entry.trie_version == current_global_version {
                    if let Some(state) = &tti_state {
                        state.touch(&key_owned, default_ttl);
                    }
                    let res_val = Python::attach(|py| {
                        let val = entry.value.clone_ref(py);
                        complete_flight(&flights, &key_owned, false);
                        val
                    });
                    return Ok((Some(res_val), false, true));
                }

                let valid = crate::trie::validate_dependencies(&trie, &entry.dependencies, now);
                if !valid {
                    if let Err(e) = storage.remove(&key_owned).await {
                        log::warn!("Failed to remove invalid key '{}': {}", key_owned, e);
                    }
                    return Ok((None, true, false));
                }

                if entry.trie_version < current_global_version {
                    if let Some(state) = &tti_state {
                        if let Some(raw) = raw_data {
                            if let Ok(data) = crate::storage::CacheEntry::update_trie_version_raw(
                                &raw,
                                current_global_version,
                            ) && let Err(e) = state.tx.try_send(WorkerMsg::Update(
                                key_owned.clone(),
                                data,
                                expires_at.map(|e| e.saturating_sub(now)),
                            )) {
                                log::warn!("Failed to send Update for key '{}': {}", key_owned, e);
                            }
                        } else {
                            let updated_entry = Arc::new(crate::storage::CacheEntry {
                                value: Python::attach(|py| entry.value.clone_ref(py)),
                                dependencies: Arc::clone(&entry.dependencies),
                                trie_version: current_global_version,
                            });
                            if let Err(e) = state.tx.try_send(WorkerMsg::UpdateEntry(
                                key_owned.clone(),
                                updated_entry,
                                expires_at.map(|e| e.saturating_sub(now)),
                            )) {
                                log::warn!(
                                    "Failed to send UpdateEntry for key '{}': {}",
                                    key_owned,
                                    e
                                );
                            }
                        }
                    }
                } else if let Some(state) = &tti_state {
                    state.touch(&key_owned, default_ttl);
                }

                let res_val = Python::attach(|py| {
                    let val = entry.value.clone_ref(py);
                    complete_flight(&flights, &key_owned, false);
                    val
                });
                Ok((Some(res_val), false, true))
            })
        })
    }

    pub(crate) fn bridge_get_or_entry_async<'py>(
        &self,
        py: Python<'py>,
        key: &str,
    ) -> PyResult<Bound<'py, PyAny>> {
        let storage = Arc::clone(&self.storage);
        let flights = self.flights.clone();
        let trie = self.trie.clone();
        let _flight_timeout = self.flight_timeout;
        let default_ttl = self.default_ttl;
        let tti_state = self.tti_state.clone();
        let key_owned = key.to_string();

        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            let (flight, is_leader) = try_enter_flight(&flights, &key_owned);
            if !is_leader {
                let status = wait_for_flight(&flight, _flight_timeout).await;
                return match status {
                    FlightStatus::Done => {
                        let val = Python::attach(|inner_py| {
                            if let Some(crate::storage::StorageResult::Hit(e, _, _)) =
                                storage.try_get_sync(inner_py, &key_owned)
                            {
                                Some(e.value.clone_ref(inner_py))
                            } else {
                                None
                            }
                        });
                        Ok((val, false, true))
                    }
                    FlightStatus::Error => Err(PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(
                        "Thundering herd leader failed",
                    )),
                    _ => Ok((None, false, false)),
                };
            }

            let status = storage.get(&key_owned).await;
            let (entry, expires_at, raw_data) = match status {
                crate::storage::StorageResult::Hit(e, exp, raw) => (e, exp, raw),
                crate::storage::StorageResult::Expired => {
                    if let Some(state) = &tti_state
                        && let Err(e) = state.tx.try_send(WorkerMsg::Delete(key_owned.clone()))
                    {
                        log::warn!("Failed to send Delete for key '{}': {}", key_owned, e);
                    }
                    return Ok((None, true, false));
                }
                crate::storage::StorageResult::NotFound => {
                    return Ok((None, true, false));
                }
                crate::storage::StorageResult::Error => {
                    return Ok((None, true, false));
                }
            };

            let current_global_version = trie.get_global_version();
            let now = utils::now_secs();
            if entry.trie_version == current_global_version {
                if let Some(state) = &tti_state {
                    state.touch(&key_owned, default_ttl);
                }
                let res_val = Python::attach(|py| {
                    let val = entry.value.clone_ref(py);
                    complete_flight(&flights, &key_owned, false);
                    val
                });
                return Ok((Some(res_val), false, true));
            }

            let valid = crate::trie::validate_dependencies(&trie, &entry.dependencies, now);
            if !valid {
                if let Err(e) = storage.remove(&key_owned).await {
                    log::warn!("Failed to remove invalid key '{}': {}", key_owned, e);
                }
                return Ok((None, true, false));
            }

            if entry.trie_version < current_global_version {
                if let Some(state) = &tti_state {
                    if let Some(raw) = raw_data {
                        if let Ok(data) = crate::storage::CacheEntry::update_trie_version_raw(
                            &raw,
                            current_global_version,
                        ) && let Err(e) = state.tx.try_send(WorkerMsg::Update(
                            key_owned.clone(),
                            data,
                            expires_at.map(|e| e.saturating_sub(now)),
                        )) {
                            log::warn!("Failed to send Update for key '{}': {}", key_owned, e);
                        }
                    } else {
                        let updated_entry = Arc::new(crate::storage::CacheEntry {
                            value: Python::attach(|py| entry.value.clone_ref(py)),
                            dependencies: Arc::clone(&entry.dependencies),
                            trie_version: current_global_version,
                        });
                        if let Err(e) = state.tx.try_send(WorkerMsg::UpdateEntry(
                            key_owned.clone(),
                            updated_entry,
                            expires_at.map(|e| e.saturating_sub(now)),
                        )) {
                            log::warn!("Failed to send UpdateEntry for key '{}': {}", key_owned, e);
                        }
                    }
                }
            } else if let Some(state) = &tti_state {
                state.touch(&key_owned, default_ttl);
            }

            let res_val = Python::attach(|py| {
                let val = entry.value.clone_ref(py);
                complete_flight(&flights, &key_owned, false);
                val
            });
            Ok((Some(res_val), false, true))
        })
    }

    pub(crate) fn bridge_get<'py>(
        &self,
        py: Python<'py>,
        key: &str,
    ) -> PyResult<Option<Py<PyAny>>> {
        let res = self.bridge_get_sync(py, key);
        if self.storage.is_sync_storage() || res.as_ref().is_ok_and(|v| v.is_some()) {
            return res;
        }

        let storage = Arc::clone(&self.storage);
        let trie = self.trie.clone();
        let default_ttl = self.default_ttl;
        let tti_state = self.tti_state.clone();
        let key_owned = key.to_string();

        py.detach(|| {
            RUNTIME.block_on(async move {
                let status = storage.get(&key_owned).await;
                let (entry, expires_at, raw_data) = match status {
                    crate::storage::StorageResult::Hit(e, exp, raw) => (e, exp, raw),
                    crate::storage::StorageResult::Expired => {
                        if let Some(state) = &tti_state
                            && let Err(e) = state.tx.try_send(WorkerMsg::Delete(key_owned.clone()))
                        {
                            log::warn!("Failed to send Delete for key '{}': {}", key_owned, e);
                        }
                        return Ok(None);
                    }
                    crate::storage::StorageResult::NotFound => return Ok(None),
                    crate::storage::StorageResult::Error => return Ok(None),
                };

                let current_global_version = trie.get_global_version();
                let now = utils::now_secs();
                if entry.trie_version == current_global_version {
                    if let Some(state) = &tti_state {
                        state.touch(&key_owned, default_ttl);
                    }
                    return Ok(Some(Python::attach(|py| entry.value.clone_ref(py))));
                }

                let valid = crate::trie::validate_dependencies(&trie, &entry.dependencies, now);
                if !valid {
                    if let Err(e) = storage.remove(&key_owned).await {
                        log::warn!("Failed to remove invalid key '{}': {}", key_owned, e);
                    }
                    return Ok(None);
                }

                if entry.trie_version < current_global_version {
                    if let Some(state) = &tti_state {
                        if let Some(raw) = raw_data {
                            if let Ok(data) = crate::storage::CacheEntry::update_trie_version_raw(
                                &raw,
                                current_global_version,
                            ) && let Err(e) = state.tx.try_send(WorkerMsg::Update(
                                key_owned.clone(),
                                data,
                                expires_at.map(|e| e.saturating_sub(now)),
                            )) {
                                log::warn!("Failed to send Update for key '{}': {}", key_owned, e);
                            }
                        } else {
                            let updated_entry = Arc::new(crate::storage::CacheEntry {
                                value: Python::attach(|py| entry.value.clone_ref(py)),
                                dependencies: Arc::clone(&entry.dependencies),
                                trie_version: current_global_version,
                            });
                            if let Err(e) = state.tx.try_send(WorkerMsg::UpdateEntry(
                                key_owned.clone(),
                                updated_entry,
                                expires_at.map(|e| e.saturating_sub(now)),
                            )) {
                                log::warn!(
                                    "Failed to send UpdateEntry for key '{}': {}",
                                    key_owned,
                                    e
                                );
                            }
                        }
                    }
                } else if let Some(state) = &tti_state {
                    state.touch(&key_owned, default_ttl);
                }

                Ok(Some(Python::attach(|py| entry.value.clone_ref(py))))
            })
        })
    }

    pub(crate) fn bridge_get_async<'py>(
        &self,
        py: Python<'py>,
        key: &str,
    ) -> PyResult<Bound<'py, PyAny>> {
        let storage = Arc::clone(&self.storage);
        let trie = self.trie.clone();
        let default_ttl = self.default_ttl;
        let tti_state = self.tti_state.clone();
        let key_owned = key.to_string();

        pyo3_async_runtimes::tokio::future_into_py(py, async move {
            let status = storage.get(&key_owned).await;
            let (entry, expires_at, raw_data) = match status {
                crate::storage::StorageResult::Hit(e, exp, raw) => (e, exp, raw),
                crate::storage::StorageResult::Expired => {
                    if let Some(state) = &tti_state
                        && let Err(e) = state.tx.try_send(WorkerMsg::Delete(key_owned.clone()))
                    {
                        log::warn!("Failed to send Delete for key '{}': {}", key_owned, e);
                    }
                    return Ok(None);
                }
                crate::storage::StorageResult::NotFound => return Ok(None),
                crate::storage::StorageResult::Error => return Ok(None),
            };

            let current_global_version = trie.get_global_version();
            let now = utils::now_secs();
            if entry.trie_version == current_global_version {
                if let Some(state) = &tti_state {
                    state.touch(&key_owned, default_ttl);
                }
                return Ok(Some(Python::attach(|py| entry.value.clone_ref(py))));
            }

            let valid = crate::trie::validate_dependencies(&trie, &entry.dependencies, now);
            if !valid {
                if let Err(e) = storage.remove(&key_owned).await {
                    log::warn!("Failed to remove invalid key '{}': {}", key_owned, e);
                }
                return Ok(None);
            }

            if entry.trie_version < current_global_version {
                if let Some(state) = &tti_state {
                    if let Some(raw) = raw_data {
                        if let Ok(data) = crate::storage::CacheEntry::update_trie_version_raw(
                            &raw,
                            current_global_version,
                        ) && let Err(e) = state.tx.try_send(WorkerMsg::Update(
                            key_owned.clone(),
                            data,
                            expires_at.map(|e| e.saturating_sub(now)),
                        )) {
                            log::warn!("Failed to send Update for key '{}': {}", key_owned, e);
                        }
                    } else {
                        let updated_entry = Arc::new(crate::storage::CacheEntry {
                            value: Python::attach(|py| entry.value.clone_ref(py)),
                            dependencies: Arc::clone(&entry.dependencies),
                            trie_version: current_global_version,
                        });
                        if let Err(e) = state.tx.try_send(WorkerMsg::UpdateEntry(
                            key_owned.clone(),
                            updated_entry,
                            expires_at.map(|e| e.saturating_sub(now)),
                        )) {
                            log::warn!("Failed to send UpdateEntry for key '{}': {}", key_owned, e);
                        }
                    }
                }
            } else if let Some(state) = &tti_state {
                state.touch(&key_owned, default_ttl);
            }

            Ok(Some(Python::attach(|py| entry.value.clone_ref(py))))
        })
    }
}
