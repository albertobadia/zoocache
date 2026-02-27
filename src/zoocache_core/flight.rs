use crate::utils::FastDashMap as DashMap;
use pyo3::prelude::*;
use pyo3::types::PyAny;
use std::sync::{Arc, Mutex};
use std::time::Instant;
use tokio::sync::Notify;

#[derive(Default, Clone, Copy, PartialEq, Eq)]
pub(crate) enum FlightStatus {
    #[default]
    Pending,
    Done,
    Error,
}

pub(crate) struct Flight {
    pub state: Mutex<(FlightStatus, Option<Py<PyAny>>)>,
    pub notify: Notify,
    pub created_at: Instant,
}

#[inline]
pub(crate) fn try_enter_flight(
    flights: &DashMap<String, Arc<Flight>>,
    key: &str,
) -> (Arc<Flight>, bool) {
    if let Some(flight) = flights.get(key) {
        return (Arc::clone(flight.value()), false);
    }

    let mut is_leader = false;
    let flight = flights.entry(key.to_string()).or_insert_with(|| {
        is_leader = true;
        Arc::new(Flight {
            state: Mutex::new((FlightStatus::Pending, None)),
            notify: Notify::new(),
            created_at: Instant::now(),
        })
    });
    (Arc::clone(flight.value()), is_leader)
}

pub(crate) fn complete_flight(
    flights: &DashMap<String, Arc<Flight>>,
    key: &str,
    is_error: bool,
    value: Option<Py<PyAny>>,
) {
    if let Some((_, flight)) = flights.remove(key) {
        let mut state = flight.state.lock().unwrap_or_else(|e| e.into_inner());
        state.0 = if is_error {
            FlightStatus::Error
        } else {
            FlightStatus::Done
        };
        state.1 = value;
        flight.notify.notify_waiters();
    }
}

pub(crate) async fn wait_for_flight(flight: &Arc<Flight>, timeout_secs: u64) -> FlightStatus {
    let timeout = std::time::Duration::from_secs(timeout_secs);

    let wait_fut = flight.notify.notified();

    {
        let state = flight.state.lock().unwrap_or_else(|e| e.into_inner());
        if state.0 != FlightStatus::Pending {
            return state.0;
        }
    }

    match tokio::time::timeout(timeout, wait_fut).await {
        Ok(_) => {
            let state = flight.state.lock().unwrap_or_else(|e| e.into_inner());
            state.0
        }
        Err(_) => FlightStatus::Error,
    }
}

pub(crate) fn cleanup_stale_flights(
    flights: &DashMap<String, Arc<Flight>>,
    timeout_secs: u64,
) -> usize {
    let timeout = std::time::Duration::from_secs(timeout_secs);
    let mut removed = 0;

    for entry in flights.iter() {
        let key = entry.key().clone();
        let flight = entry.value();

        let should_remove = {
            let state = flight.state.lock().unwrap_or_else(|e| e.into_inner());
            state.0 == FlightStatus::Pending && flight.created_at.elapsed() > timeout
        };

        if should_remove && let Some((_, flight)) = flights.remove(&key) {
            let mut state = flight.state.lock().unwrap_or_else(|e| e.into_inner());
            state.0 = FlightStatus::Error;
            flight.notify.notify_waiters();
            removed += 1;
        }
    }

    removed
}
