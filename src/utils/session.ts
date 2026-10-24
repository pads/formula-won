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
