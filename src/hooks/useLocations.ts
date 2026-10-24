import { useQuery } from '@tanstack/react-query'
import type { F1DataSource } from '../api/types'
import type { Location, SessionKey } from '../types'

/** Polling interval for location updates (3 seconds) */
const POLLING_INTERVAL = 3000

export interface UseLocationsResult {
  /** Current driver locations */
  locations: Location[]
  /** Whether locations are being fetched */
  isLoading: boolean
  /** Whether there was an error fetching locations */
  isError: boolean
  /** The error that occurred, if any */
  error: Error | null
}

/**
 * Hook to fetch and poll driver locations during a live session.
 * Only fetches when the session is live.
 *
 * @param dataSource - F1 data source to fetch locations from
 * @param sessionKey - Session key to fetch locations for
 * @param isLive - Whether the session is currently live
 * @returns Location data and loading state
 */
export function useLocations(
  dataSource: F1DataSource,
  sessionKey: SessionKey | undefined,
  isLive: boolean
): UseLocationsResult {
  const {
    data: locations = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['locations', sessionKey],
    queryFn: () => {
      if (sessionKey === undefined) throw new Error('No session key')
      return dataSource.getLocations(sessionKey)
    },
    enabled: isLive && sessionKey !== undefined,
    refetchInterval: isLive ? POLLING_INTERVAL : false,
  })

  return {
    locations,
    isLoading: isLive && isLoading,
    isError,
    error: error instanceof Error ? error : null,
  }
}
