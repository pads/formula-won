import { describe, it, expect } from 'vitest'
import { getReplayTime, getChunkStart, pickLocationsAt, REPLAY_CHUNK_MS } from './replay'
import type { Location, Session } from '../types'

const session: Session = {
  session_key: 1,
  meeting_key: 1,
  session_name: 'Race',
  session_type: 'Race',
  date_start: '2024-10-20T19:00:00Z',
  date_end: '2024-10-20T21:00:00Z',
  circuit_key: 69,
  circuit_short_name: 'Austin',
  country_name: 'United States',
}

const loc = (driver_number: number, date: string, x: number): Location => ({
  driver_number,
  date,
  x,
  y: 0,
  z: 0,
  session_key: 1,
  meeting_key: 1,
})

describe('getReplayTime', () => {
  it('starts at lights out', () => {
    expect(getReplayTime(session, 0).toISOString()).toBe('2024-10-20T19:00:00.000Z')
  })

  it('advances in real time', () => {
    expect(getReplayTime(session, 90_000).toISOString()).toBe('2024-10-20T19:01:30.000Z')
  })

  it('loops back to the start after the session ends', () => {
    const twoHours = 2 * 60 * 60 * 1000
    expect(getReplayTime(session, twoHours + 5_000).toISOString()).toBe('2024-10-20T19:00:05.000Z')
  })
})

describe('getChunkStart', () => {
  it('aligns to chunk boundaries from session start', () => {
    const time = new Date('2024-10-20T19:02:30Z')
    expect(getChunkStart(session, time).getTime()).toBe(
      new Date('2024-10-20T19:00:00Z').getTime() + 2 * REPLAY_CHUNK_MS
    )
  })
})

describe('pickLocationsAt', () => {
  it('returns the latest sample per driver at or before the time', () => {
    const locations = [
      loc(1, '2024-10-20T19:00:01Z', 10),
      loc(1, '2024-10-20T19:00:03Z', 30),
      loc(1, '2024-10-20T19:00:09Z', 90),
      loc(44, '2024-10-20T19:00:02Z', 20),
    ]
    const result = pickLocationsAt(locations, new Date('2024-10-20T19:00:05Z'))
    expect(result.map((l) => [l.driver_number, l.x]).sort()).toEqual([
      [1, 30],
      [44, 20],
    ])
  })

  it('omits drivers with no sample yet', () => {
    const result = pickLocationsAt(
      [loc(1, '2024-10-20T19:00:09Z', 90)],
      new Date('2024-10-20T19:00:05Z')
    )
    expect(result).toEqual([])
  })
})
