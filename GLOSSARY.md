# Formula Won

A real-time visualization of Formula 1 race weekends, showing driver locations on track during sessions.

## Language

### Venue & Track

**Circuit**:
The complete racing venue, including track, pit lane, and facilities. Named entities like "Circuit of the Americas" or "Silverstone".
_Avoid_: Track (when referring to the venue as a whole)

**Track**:
The racing surface where cars circulate during a session. Excludes the pit lane.
_Avoid_: Circuit (when referring to only the racing line)

**Pit Lane**:
The service lane parallel to the track where cars stop for service or remain stationary when not running.
_Avoid_: Pits, pit road

### Sessions

**Session**:
A timed period of on-track activity. Types include Practice, Qualifying, Sprint, and Race.
_Avoid_: Event, run

**Live Session**:
A session currently in progress, where start time ≤ now < end time (end is exclusive).
_Avoid_: Active session, current session

**Replay Session**:
A finished Race at the loaded circuit that is played back in real time from lights out, looping at the end. It is the only thing the app shows, and it is never shown while a Live Session exists. Always the most recent year with location data; Sprints are never replayed.
_Avoid_: Historical session, recording

### Drivers & Position

**Driver**:
A competitor participating in a session, identified by their race number.
_Avoid_: Racer, pilot, competitor

**Location**:
The physical X/Y coordinates of a car on the circuit at a point in time.
_Avoid_: Position (when referring to physical placement)

**Standing**:
A driver's classification in the session (P1, P2, P3, etc.).
_Avoid_: Position (when referring to race order), place, rank

### Driver States

**On Track**:
A driver actively circulating on the track during a session.
_Avoid_: Running, out

**In Pits**:
A driver stationary in the pit lane, either for service or not participating.
_Avoid_: Pitted, in garage

**Retired**:
A driver who has withdrawn from the session and will not return to track.
_Avoid_: DNF (acceptable in race results context), out

### Data

**Session Key**:
A unique numeric identifier assigned by OpenF1 to each session during a race weekend. Used to query location and telemetry data for a specific session.
_Avoid_: Session ID, session number

**Track Transform**:
The affine transform (mirror, rotation, scale, translation) that maps a circuit's OpenF1 Location coordinates onto its track SVG.
_Avoid_: Coordinate bounds, track limits, normalization
