import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { F1DataSource } from '../api/types'
import type { Location, Session } from '../types'
import { REPLAY_CHUNK_MS, getChunkStart, getReplayTime, pickLocationsAt } from '../utils/replay'

/** How often the replay clock advances (1 second) */
const TICK_INTERVAL = 1000

export interface UseReplayLocationsResult {
  /** The race currently being replayed */
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
  const [candidateIndex, setCandidateIndex] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)

  const session = enabled ? candidates[candidateIndex] : undefined
  const sessionKey = session?.session_key

  // Restart the clock whenever the replayed race changes
  useEffect(() => {
    setElapsedMs(0)
  }, [sessionKey])

  useEffect(() => {
    if (sessionKey === undefined) return
    const startedAt = Date.now()
    const id = setInterval(() => {
      setElapsedMs(Date.now() - startedAt)
    }, TICK_INTERVAL)
    return () => {
      clearInterval(id)
    }
  }, [sessionKey])

  const replayTime = session ? getReplayTime(session, elapsedMs) : undefined
  const chunkStart = session && replayTime ? getChunkStart(session, replayTime) : undefined
  const chunkMs = chunkStart?.getTime()

  const { data: chunk, isLoading } = useQuery({
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
    if (isOpeningChunk && chunk?.length === 0 && candidateIndex + 1 < candidates.length) {
      setCandidateIndex(candidateIndex + 1)
    }
  }, [isOpeningChunk, chunk, candidateIndex, candidates.length])

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

  const locations = chunk && replayTime ? pickLocationsAt(chunk, replayTime) : []

  return { session, locations, isLoading }
}
