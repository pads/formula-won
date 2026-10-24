/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSession } from './useSession'
import type { Session } from '../types'
import type { F1DataSource } from '../api/types'
import type { ReactNode } from 'react'

const mockSession: Session = {
  session_key: 9617,
  meeting_key: 1234,
  session_name: 'Race',
  session_type: 'Race',
  date_start: '2024-10-20T19:00:00Z',
  date_end: '2024-10-20T21:00:00Z',
  circuit_key: 69,
  circuit_short_name: 'Austin',
  country_name: 'United States',
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

describe('useSession', () => {
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

  it('returns loading state initially', () => {
    const getSessions = mockDataSource.getSessions as ReturnType<typeof vi.fn>
    getSessions.mockImplementation(() => new Promise(() => {})) // Never resolves

    const { result } = renderHook(() => useSession(mockDataSource, new Date()), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.currentSession).toBeUndefined()
  })

  it('returns current session when one is live', async () => {
    const getSessions = mockDataSource.getSessions as ReturnType<typeof vi.fn>
    getSessions.mockResolvedValue([mockSession])

    const duringRace = new Date('2024-10-20T20:00:00Z')
    const { result } = renderHook(() => useSession(mockDataSource, duringRace), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.currentSession).toEqual(mockSession)
    expect(result.current.isLive).toBe(true)
  })

  it('returns undefined session when none are live', async () => {
    const getSessions = mockDataSource.getSessions as ReturnType<typeof vi.fn>
    getSessions.mockResolvedValue([mockSession])

    const beforeRace = new Date('2024-10-20T18:00:00Z')
    const { result } = renderHook(() => useSession(mockDataSource, beforeRace), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.currentSession).toBeUndefined()
    expect(result.current.isLive).toBe(false)
  })

  it('returns error state on API failure', async () => {
    const getSessions = mockDataSource.getSessions as ReturnType<typeof vi.fn>
    getSessions.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useSession(mockDataSource, new Date()), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeInstanceOf(Error)
  })
  describe('mode', () => {
    it('is live when a session is running', async () => {
      const getSessions = mockDataSource.getSessions as ReturnType<typeof vi.fn>
      getSessions.mockResolvedValue([mockSession])

      const { result } = renderHook(
        () => useSession(mockDataSource, new Date('2024-10-20T20:00:00Z'), 'Austin'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.mode).toBe('live')
      })
    })

    it('is replay with candidates when only past races exist', async () => {
      const getSessions = mockDataSource.getSessions as ReturnType<typeof vi.fn>
      getSessions.mockResolvedValue([mockSession])

      const { result } = renderHook(
        () => useSession(mockDataSource, new Date('2026-10-24T12:00:00Z'), 'Austin'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.mode).toBe('replay')
      })
      expect(result.current.replayCandidates).toEqual([mockSession])
      expect(getSessions).toHaveBeenCalledWith({ circuitShortName: 'Austin' })
    })

    it('is none when there is no live session or past race', async () => {
      const getSessions = mockDataSource.getSessions as ReturnType<typeof vi.fn>
      getSessions.mockResolvedValue([])

      const { result } = renderHook(
        () => useSession(mockDataSource, new Date('2026-10-24T12:00:00Z'), 'Austin'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
      expect(result.current.mode).toBe('none')
    })
  })
})
