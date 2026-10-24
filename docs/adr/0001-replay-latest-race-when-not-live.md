# Only replay finished races; never show live data

## Status

Accepted

## Context

With no Live Session the app showed "No live session" and parked every driver in the Pit Lane, which is an empty screen most of the year. OpenF1 also rejects requests for past sessions from unauthenticated clients while any session is live, so live data is not available to this app either.

## Decision

- The app only replays finished sessions. It no longer polls or shows live data.
- Replay the most recent finished Race at the loaded circuit (matched on `circuit_short_name`). Sprints are excluded.
- Playback is automatic, real-time (1x), starts at the session's `date_start` and loops. There are no controls.
- If any session, at any circuit, is live, nothing is replayed and the app shows an empty state ("Replay unavailable", no drivers).
- Any failure fetching sessions or the opening location window shows the same empty state.
- If the newest race has no location data, fall back to the next-newest race.
- Location data is fetched in 60-second windows (`date>=` / `date<`) with the next window prefetched, because a full race of location samples is too large to load at once.

## Consequences

- The `F1DataSource` port gains a time window on `getLocations`.
- Sessions for every circuit are fetched so a live session elsewhere is detected.
- The empty state says "Replay unavailable" because it covers both a live session and API failures.
- Live polling (`useLocations`) is removed.
- Dead code is enforced by `knip` as part of `pnpm lint`.
- Cars keep their last known location across chunk boundaries instead of dropping to the pit lane.
- Replay is tied to a single circuit config (COTA) until a circuit registry exists.
