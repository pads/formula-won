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
  let getSessions: ReturnType<typeof vi.fn>
  let mockDataSource: F1DataSource

  beforeEach(() => {
    getSessions = vi.fn()
    mockDataSource = { getSessions, getLocations: vi.fn(), getDrivers: vi.fn() }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns loading state initially', () => {
    getSessions.mockImplementation(() => new Promise(() => {})) // Never resolves

    const { result } = renderHook(() => useSession(mockDataSource, new Date(), 'Austin'), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)
    expect(result.current.replayCandidates).toEqual([])
  })

  it('offers finished races at the circuit for replay', async () => {
    getSessions.mockResolvedValue([mockSession])

    const { result } = renderHook(
      () => useSession(mockDataSource, new Date('2026-10-24T12:00:00Z'), 'Austin'),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.isLive).toBe(false)
    expect(result.current.replayCandidates).toEqual([mockSession])
  })

  it('offers nothing to replay while any session is live', async () => {
    const live = { ...mockSession, session_key: 1, circuit_short_name: 'Monza' }
    getSessions.mockResolvedValue([
      mockSession,
      { ...live, date_start: '2026-10-24T11:00:00Z', date_end: '2026-10-24T13:00:00Z' },
    ])

    const { result } = renderHook(
      () => useSession(mockDataSource, new Date('2026-10-24T12:00:00Z'), 'Austin'),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.isLive).toBe(true)
    expect(result.current.replayCandidates).toEqual([])
  })

  it('offers nothing to replay when the circuit has no finished races', async () => {
    getSessions.mockResolvedValue([])

    const { result } = renderHook(
      () => useSession(mockDataSource, new Date('2026-10-24T12:00:00Z'), 'Austin'),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.replayCandidates).toEqual([])
  })

  it('returns error state on API failure', async () => {
    getSessions.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useSession(mockDataSource, new Date(), 'Austin'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.replayCandidates).toEqual([])
  })
})
