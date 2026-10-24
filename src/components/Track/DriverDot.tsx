import { useState } from 'react'
import type { Driver } from '../../types'

export interface DriverDotProps {
  /** Driver information */
  driver: Driver
  /** X position in SVG coordinates */
  x: number
  /** Y position in SVG coordinates */
  y: number
  /** Whether the driver is currently on track */
  isOnTrack: boolean
}

const DOT_RADIUS = 8

/**
 * Individual driver marker rendered as a colored dot.
 * Shows driver number on hover.
 */
export function DriverDot({ driver, x, y, isOnTrack }: DriverDotProps) {
  const [isHovered, setIsHovered] = useState(false)

  // Team color from OpenF1 (hex without #)
  const teamColor = `#${driver.team_colour}`

  return (
    <g
      className="transition-all duration-300 ease-out"
      style={{ transform: `translate(${String(x)}px, ${String(y)}px)` }}
      onMouseEnter={() => {
        setIsHovered(true)
      }}
      onMouseLeave={() => {
        setIsHovered(false)
      }}
    >
      {/* Driver dot */}
      <circle
        r={DOT_RADIUS}
        fill={teamColor}
        stroke={isOnTrack ? '#fff' : '#666'}
        strokeWidth={2}
        opacity={isOnTrack ? 1 : 0.5}
        className="cursor-pointer"
      />

      {/* Driver number (shown on hover) */}
      {isHovered && (
        <text
          y={-DOT_RADIUS - 4}
          textAnchor="middle"
          fill="#fff"
          fontSize={12}
          fontWeight="bold"
          className="pointer-events-none"
        >
          {driver.name_acronym}
        </text>
      )}
    </g>
  )
}
