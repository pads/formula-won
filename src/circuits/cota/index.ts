import type { CircuitConfig } from '../../types'

export { TrackSvg, TRACK_VIEWPORT, PIT_LANE_POSITION } from './TrackSvg'

/**
 * Circuit of the Americas (COTA) configuration.
 * Bounds derived from OpenF1 location data (2024 US Grand Prix).
 */
export const cotaConfig: CircuitConfig = {
  name: 'Circuit of the Americas',
  shortName: 'Austin',
  bounds: {
    x: { min: -2551, max: 15580 },
    y: { min: -4072, max: 6435 },
  },
}
