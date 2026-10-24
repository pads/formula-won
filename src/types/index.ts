/**
 * OpenF1 API Types
 * See: https://openf1.org
 */

/** A unique identifier for a race weekend meeting */
export type MeetingKey = number

/** A unique identifier for a session within a meeting */
export type SessionKey = number

/** Driver's race number (1-99) */
export type DriverNumber = number

/** Session types during a race weekend */
export type SessionType =
  | 'Practice 1'
  | 'Practice 2'
  | 'Practice 3'
  | 'Sprint Qualifying'
  | 'Sprint'
  | 'Qualifying'
  | 'Race'

/** Session information from OpenF1 */
export interface Session {
  session_key: SessionKey
  meeting_key: MeetingKey
  session_name: SessionType
  session_type: string
  date_start: string
  date_end: string
  circuit_key: number
  circuit_short_name: string
  country_name: string
}

/** Driver location data from OpenF1 */
export interface Location {
  driver_number: DriverNumber
  date: string
  x: number
  y: number
  z: number
  session_key: SessionKey
  meeting_key: MeetingKey
}

/** Driver information from OpenF1 */
export interface Driver {
  driver_number: DriverNumber
  broadcast_name: string
  full_name: string
  name_acronym: string
  team_name: string
  team_colour: string
  session_key: SessionKey
  meeting_key: MeetingKey
}

/** Coordinate bounds for normalizing track positions */
export interface CoordinateBounds {
  x: { min: number; max: number }
  y: { min: number; max: number }
}

/** Circuit configuration */
export interface CircuitConfig {
  name: string
  shortName: string
  bounds: CoordinateBounds
}

/** Normalized position (0-1 range) for SVG rendering */
export interface NormalizedPosition {
  x: number
  y: number
}

/** Driver state during a session */
export type DriverState = 'on_track' | 'in_pits' | 'retired'
