import type { Location, Session } from '../types'

/** Length of each location fetch window during replay (60 seconds) */
export const REPLAY_CHUNK_MS = 60_000

/**
 * Map elapsed wall-clock time to a point in the race, looping at the end.
 * Playback is real-time (1x) and starts at the session's date_start.
 */
export function getReplayTime(session: Session, elapsedMs: number): Date {
  const start = new Date(session.date_start).getTime()
  const duration = new Date(session.date_end).getTime() - start
  if (duration <= 0) return new Date(start)
  return new Date(start + (elapsedMs % duration))
}

/** Start of the fixed-size fetch window containing the given time. */
export function getChunkStart(session: Session, time: Date): Date {
  const start = new Date(session.date_start).getTime()
  const index = Math.floor((time.getTime() - start) / REPLAY_CHUNK_MS)
  return new Date(start + index * REPLAY_CHUNK_MS)
}

/**
 * Latest location per driver at or before the given time.
 * Order of the input does not matter.
 */
export function pickLocationsAt(locations: Location[], time: Date): Location[] {
  const latest = new Map<number, Location>()
  for (const loc of locations) {
    if (new Date(loc.date) > time) continue
    const existing = latest.get(loc.driver_number)
    if (!existing || new Date(loc.date) >= new Date(existing.date)) {
      latest.set(loc.driver_number, loc)
    }
  }
  return [...latest.values()]
}
