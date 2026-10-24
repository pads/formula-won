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

/**
 * Affine transform from OpenF1 Location coordinates to track SVG coordinates:
 * svgX = xx * x + xy * y + tx, svgY = yx * x + yy * y + ty.
 * A plain scale is not enough: the SVG is rotated and mirrored relative to OpenF1.
 */
export interface TrackTransform {
  xx: number
  xy: number
  tx: number
  yx: number
  yy: number
  ty: number
}

/** Circuit configuration */
export interface CircuitConfig {
  name: string
  shortName: string
  transform: TrackTransform
}

/** Driver state during a session */
export type DriverState = 'on_track' | 'in_pits' | 'retired'
