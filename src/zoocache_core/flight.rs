use crate::utils::FastDashMap as DashMap;
use std::sync::Arc;
use std::sync::atomic::{AtomicU8, Ordering};
use std::time::Instant;
use tokio::sync::Notify;

#[derive(Clone, Copy, PartialEq, Eq)]
#[repr(u8)]
pub(crate) enum FlightStatus {
    Pending = 0,
    Done = 1,
    Error = 2,
}

impl FlightStatus {
    fn from_u8(val: u8) -> Self {
        match val {
            1 => FlightStatus::Done,
            2 => FlightStatus::Error,
            _ => FlightStatus::Pending,
        }
    }
}

pub(crate) struct Flight {
    pub state: AtomicU8,
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
            state: AtomicU8::new(FlightStatus::Pending as u8),
            notify: Notify::new(),
            created_at: Instant::now(),
        })
    });
    (Arc::clone(flight.value()), is_leader)
}

pub(crate) fn complete_flight(flights: &DashMap<String, Arc<Flight>>, key: &str, is_error: bool) {
    if let Some((_, flight)) = flights.remove(key) {
        let status = if is_error {
            FlightStatus::Error as u8
        } else {
            FlightStatus::Done as u8
        };
        flight.state.store(status, Ordering::Release);
        flight.notify.notify_waiters();
    }
}

pub(crate) async fn wait_for_flight(flight: &Arc<Flight>, timeout_secs: u64) -> FlightStatus {
    let timeout = std::time::Duration::from_secs(timeout_secs);
    let wait_fut = flight.notify.notified();

    let state = FlightStatus::from_u8(flight.state.load(Ordering::Acquire));
    if state != FlightStatus::Pending {
        return state;
    }

    match tokio::time::timeout(timeout, wait_fut).await {
        Ok(_) => FlightStatus::from_u8(flight.state.load(Ordering::Acquire)),
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

        let should_remove = FlightStatus::from_u8(flight.state.load(Ordering::Relaxed))
            == FlightStatus::Pending
            && flight.created_at.elapsed() > timeout;

        if should_remove && let Some((_, rm_flight)) = flights.remove(&key) {
            if FlightStatus::from_u8(rm_flight.state.load(Ordering::Acquire))
                == FlightStatus::Pending
            {
                rm_flight
                    .state
                    .store(FlightStatus::Error as u8, Ordering::Release);
                rm_flight.notify.notify_waiters();
                removed += 1;
            }
        }
    }

    removed
}
