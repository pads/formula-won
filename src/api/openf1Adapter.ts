import type { Driver, DriverNumber, Location, Session, SessionKey } from '../types'
import type { F1DataSource, SessionParams, TimeWindow } from './types'

type FetchFn = typeof fetch

/**
 * Creates an OpenF1 adapter implementing the F1DataSource port.
 * Accepts a custom fetch function for testing.
 */
export function createOpenF1Adapter(baseUrl: string, fetchFn: FetchFn = fetch): F1DataSource {
  return {
    async getSessions(params?: SessionParams): Promise<Session[]> {
      const url = new URL(`${baseUrl}/sessions`)

      if (params?.year !== undefined) {
        url.searchParams.set('year', String(params.year))
      }
      if (params?.circuitShortName) {
        url.searchParams.set('circuit_short_name', params.circuitShortName)
      }
      if (params?.sessionName) {
        url.searchParams.set('session_name', params.sessionName)
      }
      if (params?.sessionKey !== undefined) {
        url.searchParams.set('session_key', String(params.sessionKey))
      }

      const response = await fetchFn(url.toString())

      if (!response.ok) {
        throw new Error(`OpenF1 API error: ${String(response.status)}`)
      }

      return (await response.json()) as Session[]
    },

    async getLocations(
      sessionKey: SessionKey,
      driverNumber?: DriverNumber,
      window?: TimeWindow
    ): Promise<Location[]> {
      const url = new URL(`${baseUrl}/location`)
      url.searchParams.set('session_key', String(sessionKey))

      if (driverNumber) {
        url.searchParams.set('driver_number', String(driverNumber))
      }

      // OpenF1 filter operators are part of the key (`date>=...`), so they
      // cannot go through URLSearchParams, which would encode the `=`.
      let requestUrl = url.toString()
      if (window) {
        requestUrl += `&date>=${window.from.toISOString()}&date<${window.to.toISOString()}`
      }

      const response = await fetchFn(requestUrl)

      if (!response.ok) {
        throw new Error(`OpenF1 API error: ${String(response.status)}`)
      }

      return (await response.json()) as Location[]
    },

    async getDrivers(sessionKey: SessionKey): Promise<Driver[]> {
      const url = new URL(`${baseUrl}/drivers`)
      url.searchParams.set('session_key', String(sessionKey))

      const response = await fetchFn(url.toString())

      if (!response.ok) {
        throw new Error(`OpenF1 API error: ${String(response.status)}`)
      }

      return (await response.json()) as Driver[]
    },
  }
}
