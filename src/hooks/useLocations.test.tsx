/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useLocations } from './useLocations'
import type { Location, SessionKey } from '../types'
import type { F1DataSource } from '../api/types'
import type { ReactNode } from 'react'

const mockLocation: Location = {
  driver_number: 1,
  date: '2024-10-20T20:00:00Z',
  x: 5000,
  y: 2000,
  z: 0,
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

describe('useLocations', () => {
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

  it('returns empty array when session is not live', () => {
    const { result } = renderHook(
      () => useLocations(mockDataSource, undefined, false),
      { wrapper: createWrapper() }
    )

    expect(result.current.locations).toEqual([])
    expect(mockDataSource.getLocations).not.toHaveBeenCalled()
  })

  it('fetches locations when session is live', async () => {
    const sessionKey: SessionKey = 9617
    const getLocations = mockDataSource.getLocations as ReturnType<typeof vi.fn>
    getLocations.mockResolvedValue([mockLocation])

    const { result } = renderHook(
      () => useLocations(mockDataSource, sessionKey, true),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.locations).toEqual([mockLocation])
    })

    expect(mockDataSource.getLocations).toHaveBeenCalledWith(sessionKey)
  })

  it('returns error state on API failure', async () => {
    const sessionKey: SessionKey = 9617
    const getLocations = mockDataSource.getLocations as ReturnType<typeof vi.fn>
    getLocations.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(
      () => useLocations(mockDataSource, sessionKey, true),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})
