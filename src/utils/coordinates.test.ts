import { describe, it, expect } from 'vitest'
import { transformLocation } from './coordinates'
import { cotaConfig } from '../circuits/cota'

describe('transformLocation', () => {
  it('applies scale and translation', () => {
    const transform = { xx: 2, xy: 0, tx: 10, yx: 0, yy: 3, ty: 20 }
    expect(transformLocation(1, 1, transform)).toEqual({ x: 12, y: 23 })
  })

  it('applies rotation and mirroring', () => {
    // 90 degree rotation with a Y flip: (x, y) -> (y, x)
    const transform = { xx: 0, xy: 1, tx: 0, yx: 1, yy: 0, ty: 0 }
    expect(transformLocation(4, 7, transform)).toEqual({ x: 7, y: 4 })
  })
})

describe('COTA transform', () => {
  it('places the starting grid on the start/finish straight', () => {
    // First 2025 US GP sample for driver 1, on the grid
    const grid = transformLocation(-475, -1049, cotaConfig.transform)
    expect(grid.x).toBeCloseTo(681, 0)
    expect(grid.y).toBeCloseTo(615.4, 0)
  })
})
