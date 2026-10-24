import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { F1DataSource } from '../api/types'
import type { Location, Session } from '../types'
import {
  REPLAY_CHUNK_MS,
  getChunkStart,
  getReplayCycle,
  getReplayTime,
  mergeLocations,
  pickLocationsAt,
} from '../utils/replay'

/** How often the replay clock advances (1 second) */
const TICK_INTERVAL = 1000

export interface UseReplayLocationsResult {
  /** The race currently being replayed; undefined when disabled or the fetch failed */
  session: Session | undefined
  /** Latest driver locations at the current replay time */
  locations: Location[]
  /** Whether the first chunk of the replay is loading */
  isLoading: boolean
}

function chunkWindow(start: Date) {
  return { from: start, to: new Date(start.getTime() + REPLAY_CHUNK_MS) }
}

/**
 * Replays a finished race in real time from lights out, looping at the end.
 * Fetches location data one chunk at a time and prefetches the next chunk.
 * If the newest candidate has no location data, falls back to the next one.
 *
 * @param dataSource - F1 data source to fetch locations from
 * @param candidates - Finished races, newest first
 * @param enabled - Whether replay should run (false while live or loading)
 */
export function useReplayLocations(
  dataSource: F1DataSource,
  candidates: Session[],
  enabled: boolean
): UseReplayLocationsResult {
  const queryClient = useQueryClient()
  // Races whose opening window had no data; the replay moves on to the next candidate
  const [skippedKeys, setSkippedKeys] = useState<number[]>([])
  const [clock, setClock] = useState<{ sessionKey?: number; elapsedMs: number }>({
    elapsedMs: 0,
  })

  const session = enabled
    ? candidates.find((candidate) => !skippedKeys.includes(candidate.session_key))
    : undefined
  const sessionKey = session?.session_key

  useEffect(() => {
    if (sessionKey === undefined) return
    const startedAt = Date.now()
    const id = setInterval(() => {
      setClock({ sessionKey, elapsedMs: Date.now() - startedAt })
    }, TICK_INTERVAL)
    return () => {
      clearInterval(id)
    }
  }, [sessionKey])

  // Ignore a clock left over from a previous race
  const elapsedMs = clock.sessionKey === sessionKey ? clock.elapsedMs : 0
  const cycle = session ? getReplayCycle(session, elapsedMs) : 0

  const replayTime = session ? getReplayTime(session, elapsedMs) : undefined
  const chunkStart = session && replayTime ? getChunkStart(session, replayTime) : undefined
  const chunkMs = chunkStart?.getTime()

  const {
    data: chunk,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['replay-locations', sessionKey, chunkMs],
    queryFn: () => {
      if (!session || !chunkStart) throw new Error('No replay session')
      return dataSource.getLocations(session.session_key, undefined, chunkWindow(chunkStart))
    },
    enabled: session !== undefined,
    staleTime: Infinity,
  })

  // Fall back to an earlier race when the opening chunk has no data
  const isOpeningChunk = session !== undefined && chunkMs === new Date(session.date_start).getTime()
  useEffect(() => {
    if (sessionKey !== undefined && isOpeningChunk && chunk?.length === 0) {
      setSkippedKeys((keys) => [...keys, sessionKey])
    }
  }, [sessionKey, isOpeningChunk, chunk])

  // Warm the next chunk so playback does not stall at the boundary
  useEffect(() => {
    if (!session || chunkMs === undefined) return
    const next = new Date(chunkMs + REPLAY_CHUNK_MS)
    if (next >= new Date(session.date_end)) return
    queryClient
      .query({
        queryKey: ['replay-locations', session.session_key, next.getTime()],
        queryFn: () => dataSource.getLocations(session.session_key, undefined, chunkWindow(next)),
        staleTime: Infinity,
      })
      .catch(() => undefined)
  }, [session, chunkMs, dataSource, queryClient])

  const replayMs = replayTime?.getTime()
  const picked = useMemo(
    () => (chunk && replayMs !== undefined ? pickLocationsAt(chunk, new Date(replayMs)) : []),
    [chunk, replayMs]
  )

  // Cars keep their last known location across chunk boundaries and while a chunk
  // loads, instead of dropping back to the pit lane. A new race or a loop back to
  // lights out starts fresh, since the old locations are in the replay's future.
  const passId = `${String(sessionKey)}:${String(cycle)}`
  const [carried, setCarried] = useState<{ passId?: string; locations: Location[] }>({
    locations: [],
  })
  useEffect(() => {
    setCarried((prev) => ({
      passId,
      locations: mergeLocations(prev.passId === passId ? prev.locations : [], picked),
    }))
  }, [passId, picked])
  const locations = mergeLocations(carried.passId === passId ? carried.locations : [], picked)

  // A failed fetch (e.g. the API rejecting us) shows the empty state, not a stuck replay
  if (isError) return { session: undefined, locations: [], isLoading: false }

  return { session, locations, isLoading }
}
