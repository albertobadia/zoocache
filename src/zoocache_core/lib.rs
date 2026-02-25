mod bridge;
mod bus;
mod core;
mod flight;
mod storage;
mod trie;
mod utils;
mod worker;

use once_cell::sync::Lazy;

pub(crate) static RUNTIME: Lazy<tokio::runtime::Runtime> = Lazy::new(|| {
    tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .expect("Failed to create Tokio runtime")
});

pyo3::create_exception!(zoocache, InvalidTag, pyo3::exceptions::PyException);
pyo3::create_exception!(zoocache, StorageIsFull, pyo3::exceptions::PyException);
