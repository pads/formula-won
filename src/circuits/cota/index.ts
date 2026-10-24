import type { CircuitConfig } from '../../types'

/**
 * Circuit of the Americas (COTA) configuration.
 *
 * The transform maps OpenF1 Location coordinates onto the COTA track SVG. It was
 * fitted (mirror + rotation + scale + translation, ICP) between a full race lap
 * from the 2025 US Grand Prix and the SVG path, leaving a mean error of about 2 SVG
 * units against a track width of several. Refit it if the SVG is replaced.
 */
export const cotaConfig: CircuitConfig = {
  name: 'Circuit of the Americas',
  shortName: 'Austin',
  transform: {
    xx: 0.0322808,
    xy: -0.0176268,
    tx: 677.856,
    yx: -0.0176268,
    yy: -0.0322808,
    ty: 573.188,
  },
}
