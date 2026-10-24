import { useQuery } from '@tanstack/react-query'
import type { F1DataSource } from '../api/types'
import type { Driver, SessionKey } from '../types'

export interface UseDriversResult {
  /** List of drivers in the session */
  drivers: Driver[]
  /** Whether drivers are being fetched */
  isLoading: boolean
  /** Whether there was an error fetching drivers */
  isError: boolean
  /** The error that occurred, if any */
  error: Error | null
}

/**
 * Hook to fetch driver information for a session.
 * Drivers are fetched once per session (not polled).
 *
 * @param dataSource - F1 data source to fetch drivers from
 * @param sessionKey - Session key to fetch drivers for
 * @returns Driver data and loading state
 */
export function useDrivers(
  dataSource: F1DataSource,
  sessionKey: SessionKey | undefined
): UseDriversResult {
  const {
    data: drivers = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['drivers', sessionKey],
    queryFn: () => {
      if (sessionKey === undefined) throw new Error('No session key')
      return dataSource.getDrivers(sessionKey)
    },
    enabled: sessionKey !== undefined,
    staleTime: Infinity, // Drivers don't change during a session
  })

  return {
    drivers,
    isLoading,
    isError,
    error: error instanceof Error ? error : null,
  }
}
