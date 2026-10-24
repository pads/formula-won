import { useQuery } from '@tanstack/react-query'
import type { F1DataSource } from '../api/types'
import type { Session } from '../types'
import { findCurrentSession, findReplayCandidates } from '../utils/session'

export interface UseSessionResult {
  /** Whether any session is currently live (the API rejects us while one is) */
  isLive: boolean
  /** Finished races at the circuit, newest first. Empty while a session is live or the fetch failed. */
  replayCandidates: Session[]
  /** Whether the initial fetch is loading */
  isLoading: boolean
  /** Whether there was an error fetching sessions */
  isError: boolean
  /** The error that occurred, if any */
  error: Error | null
}

/**
 * Hook to fetch sessions and work out which finished race to replay.
 * Sessions from every circuit are fetched so a live session anywhere is
 * detected; replay is suppressed while one is running.
 *
 * @param dataSource - F1 data source to fetch sessions from
 * @param now - Current time for live session detection
 * @param circuitShortName - Circuit whose races may be replayed
 * @returns Live state and replay candidates
 */
export function useSession(
  dataSource: F1DataSource,
  now: Date,
  circuitShortName: string
): UseSessionResult {
  const {
    data: sessions = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => dataSource.getSessions(),
  })

  const isLive = findCurrentSession(sessions, now) !== undefined
  // After a failed refetch React Query keeps the old sessions, which may be stale
  const replayCandidates =
    isLive || isError ? [] : findReplayCandidates(sessions, circuitShortName, now)

  return {
    isLive,
    replayCandidates,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
  }
}
