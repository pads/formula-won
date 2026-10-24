# Replay the latest race when there is no Live Session

## Status

Accepted

## Context

With no Live Session the app showed "No live session" and parked every driver in the Pit Lane, which is an empty screen most of the year.

## Decision

- When no session is live, replay the most recent finished Race at the loaded circuit (matched on `circuit_short_name`). Sprints are excluded.
- Playback is automatic, real-time (1x), starts at the session's `date_start` and loops. There are no controls.
- If the newest race has no location data, fall back to the next-newest race.
- Location data is fetched in 60-second windows (`date>=` / `date<`) with the next window prefetched, because a full race of location samples is too large to load at once.
- Live always takes priority over replay.

## Consequences

- The `F1DataSource` port gains a time window on `getLocations` and a `sessionName` filter on `getSessions`.
- Replay is tied to a single circuit config (COTA) until a circuit registry exists.
- OpenF1 restricts access to past sessions to authenticated users while another session is live, so replay can fail during live sessions elsewhere on the calendar.
