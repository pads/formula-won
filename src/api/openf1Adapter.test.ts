import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createOpenF1Adapter } from './openf1Adapter'
import type { F1DataSource } from './types'

describe('OpenF1Adapter', () => {
  let adapter: F1DataSource
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockFetch = vi.fn()
    adapter = createOpenF1Adapter('https://api.openf1.org/v1', mockFetch)
  })

  describe('getSessions', () => {
    it('returns typed session data from API response', async () => {
      const apiResponse = [
        {
          session_key: 9617,
          meeting_key: 1234,
          session_name: 'Race',
          session_type: 'Race',
          date_start: '2024-10-20T19:00:00',
          date_end: '2024-10-20T21:00:00',
          circuit_key: 69,
          circuit_short_name: 'Austin',
          country_name: 'United States',
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(apiResponse),
      })

      const sessions = await adapter.getSessions()

      expect(sessions).toEqual([
        {
          session_key: 9617,
          meeting_key: 1234,
          session_name: 'Race',
          session_type: 'Race',
          date_start: '2024-10-20T19:00:00',
          date_end: '2024-10-20T21:00:00',
          circuit_key: 69,
          circuit_short_name: 'Austin',
          country_name: 'United States',
        },
      ])
      expect(mockFetch).toHaveBeenCalledWith('https://api.openf1.org/v1/sessions')
    })

    it('applies filter parameters to the request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })

      await adapter.getSessions({ year: 2024, circuitShortName: 'Austin' })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openf1.org/v1/sessions?year=2024&circuit_short_name=Austin'
      )
    })

    it('throws error when API returns non-OK response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      })

      await expect(adapter.getSessions()).rejects.toThrow('OpenF1 API error: 500')
    })
  })

  describe('getSessions by session name', () => {
    it('sends session_name', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([]) })
      const adapter = createOpenF1Adapter('https://api.openf1.org/v1', mockFetch)

      await adapter.getSessions({ circuitShortName: 'Austin', sessionName: 'Race' })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openf1.org/v1/sessions?circuit_short_name=Austin&session_name=Race'
      )
    })
  })

  describe('getLocations', () => {
    it('returns driver location data for a session', async () => {
      const apiResponse = [
        {
          driver_number: 1,
          date: '2024-10-20T19:10:00',
          x: 10567,
          y: 3265,
          z: 1300,
          session_key: 9617,
          meeting_key: 1234,
        },
        {
          driver_number: 44,
          date: '2024-10-20T19:10:00',
          x: 10200,
          y: 3100,
          z: 1295,
          session_key: 9617,
          meeting_key: 1234,
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(apiResponse),
      })

      const locations = await adapter.getLocations(9617)

      expect(locations).toHaveLength(2)
      expect(locations[0]).toEqual({
        driver_number: 1,
        date: '2024-10-20T19:10:00',
        x: 10567,
        y: 3265,
        z: 1300,
        session_key: 9617,
        meeting_key: 1234,
      })
      expect(mockFetch).toHaveBeenCalledWith('https://api.openf1.org/v1/location?session_key=9617')
    })

    it('filters by driver number when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })

      await adapter.getLocations(9617, 1)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openf1.org/v1/location?session_key=9617&driver_number=1'
      )
    })
  })

  describe('getLocations with a time window', () => {
    it('adds date range operators to the request', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve([]) })
      const adapter = createOpenF1Adapter('https://api.openf1.org/v1', mockFetch)

      await adapter.getLocations(9617, undefined, {
        from: new Date('2024-10-20T19:00:00Z'),
        to: new Date('2024-10-20T19:01:00Z'),
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openf1.org/v1/location?session_key=9617&date>=2024-10-20T19:00:00.000Z&date<2024-10-20T19:01:00.000Z'
      )
    })
  })

  describe('getDrivers', () => {
    it('returns driver info with team colors', async () => {
      const apiResponse = [
        {
          driver_number: 1,
          broadcast_name: 'M VERSTAPPEN',
          full_name: 'Max VERSTAPPEN',
          name_acronym: 'VER',
          team_name: 'Red Bull Racing',
          team_colour: '3671C6',
          session_key: 9617,
          meeting_key: 1234,
        },
        {
          driver_number: 44,
          broadcast_name: 'L HAMILTON',
          full_name: 'Lewis HAMILTON',
          name_acronym: 'HAM',
          team_name: 'Mercedes',
          team_colour: '27F4D2',
          session_key: 9617,
          meeting_key: 1234,
        },
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(apiResponse),
      })

      const drivers = await adapter.getDrivers(9617)

      expect(drivers).toHaveLength(2)
      expect(drivers[0]).toEqual({
        driver_number: 1,
        broadcast_name: 'M VERSTAPPEN',
        full_name: 'Max VERSTAPPEN',
        name_acronym: 'VER',
        team_name: 'Red Bull Racing',
        team_colour: '3671C6',
        session_key: 9617,
        meeting_key: 1234,
      })
      expect(mockFetch).toHaveBeenCalledWith('https://api.openf1.org/v1/drivers?session_key=9617')
    })
  })
})
