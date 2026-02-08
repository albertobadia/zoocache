use std::time::{SystemTime, UNIX_EPOCH};

pub(crate) fn now_secs() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

pub(crate) fn now_nanos() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos() as u64
}

pub(crate) fn to_runtime_err<E: std::fmt::Display>(e: E) -> pyo3::PyErr {
    pyo3::PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(e.to_string())
}

pub(crate) fn to_conn_err<E: std::fmt::Display>(e: E) -> pyo3::PyErr {
    pyo3::PyErr::new::<pyo3::exceptions::PyConnectionError, _>(e.to_string())
}
