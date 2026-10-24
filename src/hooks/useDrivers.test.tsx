/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDrivers } from './useDrivers'
import type { Driver, SessionKey } from '../types'
import type { F1DataSource } from '../api/types'
import type { ReactNode } from 'react'

const mockDriver: Driver = {
  driver_number: 1,
  broadcast_name: 'M VERSTAPPEN',
  full_name: 'Max VERSTAPPEN',
  name_acronym: 'VER',
  team_name: 'Red Bull Racing',
  team_colour: '3671C6',
  session_key: 9617,
  meeting_key: 1234,
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useDrivers', () => {
  let mockDataSource: F1DataSource

  beforeEach(() => {
    mockDataSource = {
      getSessions: vi.fn(),
      getLocations: vi.fn(),
      getDrivers: vi.fn(),
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns empty array when no session key', () => {
    const { result } = renderHook(() => useDrivers(mockDataSource, undefined), {
      wrapper: createWrapper(),
    })

    expect(result.current.drivers).toEqual([])
    expect(mockDataSource.getDrivers).not.toHaveBeenCalled()
  })

  it('fetches drivers for session', async () => {
    const sessionKey: SessionKey = 9617
    const getDrivers = mockDataSource.getDrivers as ReturnType<typeof vi.fn>
    getDrivers.mockResolvedValue([mockDriver])

    const { result } = renderHook(() => useDrivers(mockDataSource, sessionKey), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.drivers).toEqual([mockDriver])
    })

    expect(mockDataSource.getDrivers).toHaveBeenCalledWith(sessionKey)
  })

  it('returns error state on API failure', async () => {
    const sessionKey: SessionKey = 9617
    const getDrivers = mockDataSource.getDrivers as ReturnType<typeof vi.fn>
    getDrivers.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useDrivers(mockDataSource, sessionKey), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})
