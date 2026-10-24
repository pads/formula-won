import { describe, it, expect } from 'vitest'
import { normalizeCoordinate, toSvgPosition, transformLocation } from './coordinates'
import type { CoordinateBounds } from '../types'

describe('normalizeCoordinate', () => {
  // COTA bounds from research
  const COTA_X = { min: -2551, max: 15580 }

  it('returns 0 for minimum value', () => {
    expect(normalizeCoordinate(-2551, COTA_X.min, COTA_X.max)).toBe(0)
  })

  it('returns 1 for maximum value', () => {
    expect(normalizeCoordinate(15580, COTA_X.min, COTA_X.max)).toBe(1)
  })

  it('returns 0.5 for midpoint value', () => {
    const midpoint = (-2551 + 15580) / 2 // 6514.5
    expect(normalizeCoordinate(midpoint, COTA_X.min, COTA_X.max)).toBe(0.5)
  })

  it('clamps values below minimum to 0', () => {
    expect(normalizeCoordinate(-5000, COTA_X.min, COTA_X.max)).toBe(0)
  })

  it('clamps values above maximum to 1', () => {
    expect(normalizeCoordinate(20000, COTA_X.min, COTA_X.max)).toBe(1)
  })
})

describe('toSvgPosition', () => {
  const viewport = { width: 1000, height: 500 }

  it('maps (0,0) normalized to top-left of viewport', () => {
    const result = toSvgPosition({ x: 0, y: 0 }, viewport)
    expect(result).toEqual({ x: 0, y: 0 })
  })

  it('maps (1,1) normalized to bottom-right of viewport', () => {
    const result = toSvgPosition({ x: 1, y: 1 }, viewport)
    expect(result).toEqual({ x: 1000, y: 500 })
  })

  it('maps (0.5, 0.5) normalized to center of viewport', () => {
    const result = toSvgPosition({ x: 0.5, y: 0.5 }, viewport)
    expect(result).toEqual({ x: 500, y: 250 })
  })

  it('handles non-square viewports correctly', () => {
    const wideViewport = { width: 800, height: 200 }
    const result = toSvgPosition({ x: 0.25, y: 0.75 }, wideViewport)
    expect(result).toEqual({ x: 200, y: 150 })
  })
})

describe('transformLocation', () => {
  // COTA bounds from research
  const cotaBounds: CoordinateBounds = {
    x: { min: -2551, max: 15580 },
    y: { min: -4072, max: 6435 },
  }
  const viewport = { width: 1000, height: 600 }

  it('transforms raw OpenF1 coordinates to SVG position', () => {
    // Min x, min y should map to (0, 0)
    const result = transformLocation(-2551, -4072, cotaBounds, viewport)
    expect(result).toEqual({ x: 0, y: 0 })
  })

  it('transforms max coordinates to viewport max', () => {
    const result = transformLocation(15580, 6435, cotaBounds, viewport)
    expect(result).toEqual({ x: 1000, y: 600 })
  })

  it('transforms midpoint coordinates to viewport center', () => {
    const midX = (-2551 + 15580) / 2 // 6514.5
    const midY = (-4072 + 6435) / 2 // 1181.5
    const result = transformLocation(midX, midY, cotaBounds, viewport)
    expect(result).toEqual({ x: 500, y: 300 })
  })
})
