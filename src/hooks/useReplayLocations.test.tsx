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

// The replay clock ticks once a second, so waits that depend on it need longer than 1s
const CLOCK_TICK_TIMEOUT = { timeout: 3000 }

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
  it('keeps cars at their last known location while the next chunk loads', async () => {
    getLocations.mockImplementation((_key: number, _driver: undefined, window: { from: Date }) =>
      window.from.toISOString() === '2024-10-20T19:00:00.000Z'
        ? Promise.resolve([{ ...sample, session_key: 2, date: '2024-10-20T19:00:00Z' }])
        : new Promise(() => {})
    )

    const { result } = renderHook(() => useReplayLocations(dataSource, [race2024], true), {
      wrapper: createWrapper(),
    })
    await waitFor(() => {
      expect(result.current.locations).toHaveLength(1)
    })

    // Jump the clock past the first chunk; the next chunk never resolves
    const realNow = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(realNow + 61_000)

    // Let the 1s replay clock tick into the second chunk
    await new Promise((resolve) => setTimeout(resolve, 1500))

    expect(result.current.locations).toHaveLength(1)
  })
  it('shows nothing when every race has an empty opening window', async () => {
    getLocations.mockResolvedValue([])

    const { result } = renderHook(
      () => useReplayLocations(dataSource, [race2024, race2023], true),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(getLocations).toHaveBeenCalledWith(1, undefined, expect.anything())
    })
    await waitFor(() => {
      expect(result.current.session).toBeUndefined()
    })
  })

  it('prefers a newly finished race over one reached by fallback', async () => {
    getLocations.mockImplementation((sessionKey: number) =>
      Promise.resolve(sessionKey === 1 ? [sample] : [])
    )
    const newest = makeRace(3, '2025-10-19T19:00:00Z', '2025-10-19T21:00:00Z')

    const { result, rerender } = renderHook(
      ({ candidates }) => useReplayLocations(dataSource, candidates, true),
      { wrapper: createWrapper(), initialProps: { candidates: [race2024, race2023] } }
    )
    await waitFor(() => {
      expect(result.current.session?.session_key).toBe(1)
    })

    rerender({ candidates: [newest, race2024, race2023] })

    await waitFor(() => {
      expect(result.current.session?.session_key).toBe(3)
    })
  })

  it('clears carried locations when the replay loops back to lights out', async () => {
    const at = (driver_number: number, date: string): Location => ({
      ...sample,
      session_key: 2,
      driver_number,
      date,
    })
    getLocations.mockImplementation((_key: number, _driver: undefined, window: { from: Date }) => {
      const from = window.from.toISOString()
      if (from === '2024-10-20T19:00:00.000Z') {
        return Promise.resolve([at(1, '2024-10-20T19:00:00Z')])
      }
      if (from === '2024-10-20T19:01:00.000Z') {
        return Promise.resolve([at(44, '2024-10-20T19:01:30Z')])
      }
      return new Promise(() => {})
    })

    const { result } = renderHook(() => useReplayLocations(dataSource, [race2024], true), {
      wrapper: createWrapper(),
    })
    await waitFor(() => {
      expect(result.current.locations).toHaveLength(1)
    })

    // Into the second chunk, where driver 44 appears and driver 1 is carried
    const realNow = Date.now()
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(realNow + 100_000)
    await waitFor(() => {
      expect(result.current.locations.map((l) => l.driver_number).sort()).toEqual([1, 44])
    }, CLOCK_TICK_TIMEOUT)

    // Loop back to lights out: driver 44 is in the replay's future, so it must go
    const twoHours = 2 * 60 * 60 * 1000
    nowSpy.mockReturnValue(realNow + twoHours + 5_000)
    await waitFor(() => {
      expect(result.current.locations.map((l) => l.driver_number)).toEqual([1])
    }, CLOCK_TICK_TIMEOUT)
  })
})
