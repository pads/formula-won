import type {
  Driver,
  DriverNumber,
  Location,
  Session,
  SessionKey,
} from '../types'

/**
 * Parameters for filtering sessions
 */
export interface SessionParams {
  year?: number
  circuitShortName?: string
  sessionKey?: SessionKey
}

/**
 * Port interface for F1 data access.
 * Implementations may use OpenF1, a mock, or any other data source.
 */
export interface F1DataSource {
  /**
   * Fetch sessions matching the given parameters.
   * Returns all sessions if no params provided.
   */
  getSessions(params?: SessionParams): Promise<Session[]>

  /**
   * Fetch driver locations for a session.
   * Optionally filter to a single driver.
   */
  getLocations(
    sessionKey: SessionKey,
    driverNumber?: DriverNumber
  ): Promise<Location[]>

  /**
   * Fetch driver information for a session.
   */
  getDrivers(sessionKey: SessionKey): Promise<Driver[]>
}
