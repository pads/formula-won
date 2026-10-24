import { TrackSvg, TRACK_VIEWPORT, PIT_LANE_POSITION } from '../../circuits/cota/TrackSvg'
import { cotaConfig } from '../../circuits/cota'
import { transformLocation } from '../../utils/coordinates'
import { DriverDot } from './DriverDot'
import type { Location, Driver } from '../../types'

export interface TrackProps {
  /** Current driver locations from OpenF1 */
  locations: Location[]
  /** Driver info for team colors and names */
  drivers: Driver[]
  /** Whether the session is currently live */
  isLive: boolean
}

/**
 * Track component that renders the circuit SVG with driver positions.
 * When live, drivers are positioned based on location data.
 * When not live, drivers are shown in the pit lane.
 */
export function Track({ locations, drivers, isLive }: TrackProps) {
  // Create a lookup map for latest location by driver number
  const locationMap = new Map(locations.map((loc) => [loc.driver_number, loc]))

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <svg
        viewBox={`0 0 ${String(TRACK_VIEWPORT.width)} ${String(TRACK_VIEWPORT.height)}`}
        className="w-full h-auto"
      >
        {/* Render the track background */}
        <TrackSvg />

        {/* Render driver dots */}
        {drivers.map((driver) => {
          const location = locationMap.get(driver.driver_number)
          let position = PIT_LANE_POSITION

          if (isLive && location) {
            position = transformLocation(
              location.x,
              location.y,
              cotaConfig.bounds,
              TRACK_VIEWPORT
            )
          }

          return (
            <DriverDot
              key={driver.driver_number}
              driver={driver}
              x={position.x}
              y={position.y}
              isOnTrack={isLive && !!location}
            />
          )
        })}
      </svg>
    </div>
  )
}
