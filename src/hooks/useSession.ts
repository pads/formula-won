import { useQuery } from '@tanstack/react-query'
import type { F1DataSource } from '../api/types'
import type { Session } from '../types'
import { findCurrentSession } from '../utils/session'

export interface UseSessionResult {
  /** List of all sessions fetched */
  sessions: Session[]
  /** The currently live session, if any */
  currentSession: Session | undefined
  /** Whether a session is currently live */
  isLive: boolean
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
 * @returns Session data and live state
 */
export function useSession(dataSource: F1DataSource, now: Date): UseSessionResult {
  const {
    data: sessions = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => dataSource.getSessions(),
  })

  const currentSession = findCurrentSession(sessions, now)
  const isLive = currentSession !== undefined

  return {
    sessions,
    currentSession,
    isLive,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
  }
}
