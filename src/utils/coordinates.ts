import type { CoordinateBounds, NormalizedPosition } from '../types'

export interface Viewport {
  width: number
  height: number
}

export interface SvgPosition {
  x: number
  y: number
}

/**
 * Normalize a coordinate value to a 0-1 range.
 * Values outside bounds are clamped.
 *
 * @param value - Raw coordinate value
 * @param min - Minimum bound
 * @param max - Maximum bound
 * @returns Normalized value between 0 and 1
 */
export function normalizeCoordinate(value: number, min: number, max: number): number {
  const normalized = (value - min) / (max - min)
  return Math.max(0, Math.min(1, normalized))
}

/**
 * Convert a normalized position (0-1) to SVG pixel coordinates.
 *
 * @param normalized - Position with x,y in 0-1 range
 * @param viewport - SVG viewport dimensions
 * @returns Position in SVG pixel coordinates
 */
export function toSvgPosition(normalized: NormalizedPosition, viewport: Viewport): SvgPosition {
  return {
    x: normalized.x * viewport.width,
    y: normalized.y * viewport.height,
  }
}

/**
 * Transform raw OpenF1 coordinates to SVG pixel position.
 * Combines normalization and viewport mapping in one step.
 *
 * @param x - Raw X coordinate from OpenF1
 * @param y - Raw Y coordinate from OpenF1
 * @param bounds - Circuit coordinate bounds
 * @param viewport - SVG viewport dimensions
 * @returns Position in SVG pixel coordinates
 */
export function transformLocation(
  x: number,
  y: number,
  bounds: CoordinateBounds,
  viewport: Viewport
): SvgPosition {
  const normalized: NormalizedPosition = {
    x: normalizeCoordinate(x, bounds.x.min, bounds.x.max),
    y: normalizeCoordinate(y, bounds.y.min, bounds.y.max),
  }
  return toSvgPosition(normalized, viewport)
}
