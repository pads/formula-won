/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useReplayLocations } from './useReplayLocations'
import type { Location, Session } from '../types'
import type { F1DataSource } from '../api/types'
import type { ReactNode } from 'react'

const makeRace = (key: number, start: string, end: string): Session => ({
  session_key: key,
  meeting_key: 1,
  session_name: 'Race',
  session_type: 'Race',
  date_start: start,
  date_end: end,
  circuit_key: 69,
  circuit_short_name: 'Austin',
  country_name: 'United States',
})

const race2024 = makeRace(2, '2024-10-20T19:00:00Z', '2024-10-20T21:00:00Z')
const race2023 = makeRace(1, '2023-10-22T19:00:00Z', '2023-10-22T21:00:00Z')

const sample: Location = {
  driver_number: 1,
  date: '2023-10-22T19:00:00Z',
  x: 100,
  y: 200,
  z: 0,
  session_key: 1,
  meeting_key: 1,
}

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useReplayLocations', () => {
  let dataSource: F1DataSource
  let getLocations: ReturnType<typeof vi.fn>

  beforeEach(() => {
    getLocations = vi.fn()
    dataSource = { getSessions: vi.fn(), getLocations, getDrivers: vi.fn() }
  })

  it('does nothing when disabled', () => {
    const { result } = renderHook(() => useReplayLocations(dataSource, [race2024], false), {
      wrapper: createWrapper(),
    })

    expect(result.current.session).toBeUndefined()
    expect(getLocations).not.toHaveBeenCalled()
  })

  it('fetches the opening window of the newest race', async () => {
    getLocations.mockResolvedValue([{ ...sample, session_key: 2, date: '2024-10-20T19:00:00Z' }])

    const { result } = renderHook(
      () => useReplayLocations(dataSource, [race2024, race2023], true),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.locations).toHaveLength(1)
    })
    expect(result.current.session?.session_key).toBe(2)
    expect(getLocations).toHaveBeenCalledWith(2, undefined, {
      from: new Date('2024-10-20T19:00:00Z'),
      to: new Date('2024-10-20T19:01:00Z'),
    })
  })

  it('falls back to an earlier race when the newest has no location data', async () => {
    getLocations.mockImplementation((sessionKey: number) =>
      Promise.resolve(sessionKey === 1 ? [sample] : [])
    )

    const { result } = renderHook(
      () => useReplayLocations(dataSource, [race2024, race2023], true),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.session?.session_key).toBe(1)
    })
    await waitFor(() => {
      expect(result.current.locations).toHaveLength(1)
    })
  })
})
