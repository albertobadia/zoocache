use dashmap::DashMap;
use pyo3::prelude::*;
use pyo3::types::PyAny;
use std::sync::{Arc, Condvar, Mutex};

#[derive(Default, Clone, Copy, PartialEq, Eq)]
pub(crate) enum FlightStatus {
    #[default]
    Pending,
    Done,
    Error,
}

pub(crate) struct Flight {
    pub state: Mutex<(FlightStatus, Option<Py<PyAny>>)>,
    pub condvar: Condvar,
    pub py_future: Mutex<Option<Py<PyAny>>>,
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
            condvar: Condvar::new(),
            py_future: Mutex::new(None),
        })
    });
    (Arc::clone(flight.value()), is_leader)
}

pub(crate) fn complete_flight(
    flights: &DashMap<String, Arc<Flight>>,
    key: &str,
    is_error: bool,
    value: Option<Py<PyAny>>,
) -> Option<Py<PyAny>> {
    if let Some((_, flight)) = flights.remove(key) {
        let mut state = flight.state.lock().unwrap_or_else(|e| e.into_inner());
        state.0 = if is_error {
            FlightStatus::Error
        } else {
            FlightStatus::Done
        };
        state.1 = value;
        flight.condvar.notify_all();

        return flight
            .py_future
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .take();
    }
    None
}

pub(crate) fn wait_for_flight(flight: &Flight, timeout_secs: u64) -> FlightStatus {
    let mut state = match flight.state.lock() {
        Ok(s) => s,
        Err(_e) => return FlightStatus::Error, // Poisoned
    };

    let timeout = std::time::Duration::from_secs(timeout_secs);
    let start = std::time::Instant::now();

    while state.0 == FlightStatus::Pending {
        let elapsed = start.elapsed();
        if elapsed >= timeout {
            return FlightStatus::Error;
        }

        let wait_res = flight.condvar.wait_timeout(state, timeout - elapsed);

        match wait_res {
            Ok((new_state, result)) => {
                state = new_state;
                if result.timed_out() {
                    return FlightStatus::Error;
                }
            }
            Err(_) => return FlightStatus::Error, // Poisoned
        }
    }
    state.0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_flight_lifecycle() {
        let flights: DashMap<String, Arc<Flight>> = DashMap::new();

        let (flight1, is_leader1) = try_enter_flight(&flights, "key1");
        assert!(is_leader1);

        let (flight2, is_leader2) = try_enter_flight(&flights, "key1");
        assert!(!is_leader2);
        assert!(Arc::ptr_eq(&flight1, &flight2));

        complete_flight(&flights, "key1", false, None);
        assert!(flights.get("key1").is_none());
    }
}
