import { useQuery } from '@tanstack/react-query'
import type { F1DataSource } from '../api/types'
import type { Session } from '../types'
import { findCurrentSession, findReplayCandidates } from '../utils/session'

/** Whether the app is showing a live session, a past race, or nothing */
export type SessionMode = 'live' | 'replay' | 'none'

export interface UseSessionResult {
  /** List of all sessions fetched */
  sessions: Session[]
  /** The currently live session, if any */
  currentSession: Session | undefined
  /** Whether a session is currently live */
  isLive: boolean
  /** Finished races at the circuit, newest first (replay fallbacks) */
  replayCandidates: Session[]
  /** live if a session is running, replay if a past race exists, else none */
  mode: SessionMode
  /** Whether the initial fetch is loading */
  isLoading: boolean
  /** Whether there was an error fetching sessions */
  isError: boolean
  /** The error that occurred, if any */
  error: Error | null
}

/**
 * Hook to fetch sessions and determine which one is currently live.
 *
 * @param dataSource - F1 data source to fetch sessions from
 * @param now - Current time for live session detection
 * @param circuitShortName - Restrict to this circuit; enables replay candidates
 * @returns Session data and live state
 */
export function useSession(
  dataSource: F1DataSource,
  now: Date,
  circuitShortName?: string
): UseSessionResult {
  const {
    data: sessions = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['sessions', circuitShortName],
    queryFn: () => dataSource.getSessions(circuitShortName ? { circuitShortName } : undefined),
  })

  const currentSession = findCurrentSession(sessions, now)
  const isLive = currentSession !== undefined
  const replayCandidates = circuitShortName
    ? findReplayCandidates(sessions, circuitShortName, now)
    : []
  const mode: SessionMode = isLive ? 'live' : replayCandidates.length > 0 ? 'replay' : 'none'

  return {
    sessions,
    currentSession,
    isLive,
    replayCandidates,
    mode,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
  }
}
