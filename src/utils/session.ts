import type { Session } from '../types'

/**
 * Determine if a session is currently live.
 * A session is live when the current time is at or after the start time
 * and before the end time (start inclusive, end exclusive).
 *
 * @param session - The session to check
 * @param now - The current time to compare against
 * @returns true if the session is currently live
 */
export function isSessionLive(session: Session, now: Date): boolean {
  const start = new Date(session.date_start)
  const end = new Date(session.date_end)
  return now >= start && now < end
}

/**
 * Find the currently live session from a list of sessions.
 * Returns the first session that is live at the given time.
 *
 * @param sessions - List of sessions to search
 * @param now - The current time to compare against
 * @returns The live session, or undefined if no session is live
 */
export function findCurrentSession(sessions: Session[], now: Date): Session | undefined {
  return sessions.find((session) => isSessionLive(session, now))
}

/**
 * Find finished Grand Prix races at a circuit, most recent first.
 * Sprints are excluded. Returns every match so callers can fall back to an
 * earlier year when the newest race has no location data.
 *
 * @param sessions - List of sessions to search
 * @param circuitShortName - Circuit to match (e.g. "Austin")
 * @param now - The current time; races ending after this are excluded
 * @returns Matching races ordered newest first
 */
export function findReplayCandidates(
  sessions: Session[],
  circuitShortName: string,
  now: Date
): Session[] {
  return sessions
    .filter(
      (session) =>
        session.session_name === 'Race' &&
        session.circuit_short_name === circuitShortName &&
        new Date(session.date_end) <= now
    )
    .sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime())
}
