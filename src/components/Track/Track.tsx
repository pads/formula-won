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
  /** Whether locations are being shown (live or replay) rather than parked in the pits */
  showPositions: boolean
}

/**
 * Track component that renders the circuit SVG with driver positions.
 * When showing positions (live or replay), drivers are placed from location data.
 * Otherwise, drivers are shown in the pit lane.
 */
export function Track({ locations, drivers, showPositions }: TrackProps) {
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

          if (showPositions && location) {
            position = transformLocation(location.x, location.y, cotaConfig.bounds, TRACK_VIEWPORT)
          }

          return (
            <DriverDot
              key={driver.driver_number}
              driver={driver}
              x={position.x}
              y={position.y}
              isOnTrack={showPositions && !!location}
            />
          )
        })}
      </svg>
    </div>
  )
}
