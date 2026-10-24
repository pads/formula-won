import { describe, it, expect } from 'vitest'
import { isSessionLive, findCurrentSession, findReplayCandidates } from './session'
import type { Session } from '../types'

const makeSession = (start: string, end: string, overrides: Partial<Session> = {}): Session => ({
  session_key: 9617,
  meeting_key: 1234,
  session_name: 'Race',
  session_type: 'Race',
  date_start: start,
  date_end: end,
  circuit_key: 69,
  circuit_short_name: 'Austin',
  country_name: 'United States',
  ...overrides,
})

describe('isSessionLive', () => {
  const session = makeSession('2024-10-20T19:00:00Z', '2024-10-20T21:00:00Z')

  it('returns false before session starts', () => {
    const beforeStart = new Date('2024-10-20T18:00:00Z')
    expect(isSessionLive(session, beforeStart)).toBe(false)
  })

  it('returns true during session', () => {
    const during = new Date('2024-10-20T20:00:00Z')
    expect(isSessionLive(session, during)).toBe(true)
  })

  it('returns true at exact start time', () => {
    const atStart = new Date('2024-10-20T19:00:00Z')
    expect(isSessionLive(session, atStart)).toBe(true)
  })

  it('returns false after session ends', () => {
    const afterEnd = new Date('2024-10-20T22:00:00Z')
    expect(isSessionLive(session, afterEnd)).toBe(false)
  })

  it('returns false at exact end time', () => {
    const atEnd = new Date('2024-10-20T21:00:00Z')
    expect(isSessionLive(session, atEnd)).toBe(false)
  })
})

describe('findCurrentSession', () => {
  const fp1 = makeSession('2024-10-18T17:30:00Z', '2024-10-18T18:30:00Z', {
    session_key: 9610,
    session_name: 'Practice 1',
    session_type: 'Practice',
  })
  const qualifying = makeSession('2024-10-19T21:00:00Z', '2024-10-19T22:00:00Z', {
    session_key: 9615,
    session_name: 'Qualifying',
    session_type: 'Qualifying',
  })
  const race = makeSession('2024-10-20T19:00:00Z', '2024-10-20T21:00:00Z', {
    session_key: 9617,
    session_name: 'Race',
    session_type: 'Race',
  })
  const sessions = [fp1, qualifying, race]

  it('returns undefined when no sessions', () => {
    const now = new Date('2024-10-20T20:00:00Z')
    expect(findCurrentSession([], now)).toBeUndefined()
  })

  it('returns undefined when no session is live', () => {
    const betweenSessions = new Date('2024-10-19T12:00:00Z')
    expect(findCurrentSession(sessions, betweenSessions)).toBeUndefined()
  })

  it('returns the live session', () => {
    const duringRace = new Date('2024-10-20T20:00:00Z')
    expect(findCurrentSession(sessions, duringRace)).toEqual(race)
  })

  it('returns the first live session if multiple overlap', () => {
    const overlapping = makeSession('2024-10-20T20:00:00Z', '2024-10-20T22:00:00Z', {
      session_key: 9999,
      session_name: 'Race',
      session_type: 'Race',
    })
    const duringBoth = new Date('2024-10-20T20:30:00Z')
    expect(findCurrentSession([race, overlapping], duringBoth)).toEqual(race)
  })
})

describe('findReplayCandidates', () => {
  const now = new Date('2026-10-24T12:00:00Z')
  const race2023 = makeSession('2023-10-22T19:00:00Z', '2023-10-22T21:00:00Z', {
    session_key: 1,
  })
  const race2024 = makeSession('2024-10-20T19:00:00Z', '2024-10-20T21:00:00Z', {
    session_key: 2,
  })
  const sprint2024 = makeSession('2024-10-19T19:00:00Z', '2024-10-19T20:00:00Z', {
    session_key: 3,
    session_name: 'Sprint',
  })
  const monza2025 = makeSession('2025-09-07T13:00:00Z', '2025-09-07T15:00:00Z', {
    session_key: 4,
    circuit_short_name: 'Monza',
  })
  const future = makeSession('2026-10-25T19:00:00Z', '2026-10-25T21:00:00Z', {
    session_key: 5,
  })

  it('returns races at the circuit, newest first', () => {
    const result = findReplayCandidates([race2023, race2024], 'Austin', now)
    expect(result.map((s) => s.session_key)).toEqual([2, 1])
  })

  it('excludes sprints and other circuits', () => {
    const result = findReplayCandidates([race2024, sprint2024, monza2025], 'Austin', now)
    expect(result.map((s) => s.session_key)).toEqual([2])
  })

  it('excludes races that have not finished', () => {
    const result = findReplayCandidates([race2024, future], 'Austin', now)
    expect(result.map((s) => s.session_key)).toEqual([2])
  })

  it('returns an empty list when nothing matches', () => {
    expect(findReplayCandidates([monza2025], 'Austin', now)).toEqual([])
  })
})
