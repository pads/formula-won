import type { TrackTransform } from '../types'

export interface SvgPosition {
  x: number
  y: number
}

/**
 * Transform raw OpenF1 coordinates to a position in the track SVG.
 *
 * @param x - Raw X coordinate from OpenF1
 * @param y - Raw Y coordinate from OpenF1
 * @param transform - The circuit's OpenF1 -> SVG transform
 * @returns Position in SVG coordinates
 */
export function transformLocation(x: number, y: number, transform: TrackTransform): SvgPosition {
  return {
    x: transform.xx * x + transform.xy * y + transform.tx,
    y: transform.yx * x + transform.yy * y + transform.ty,
  }
}
