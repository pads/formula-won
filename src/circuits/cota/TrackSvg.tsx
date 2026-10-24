interface TrackSvgProps {
  className?: string
}

/**
 * COTA track SVG component.
 * Renders the Circuit of the Americas schematic.
 */
export function TrackSvg({ className }: TrackSvgProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 600"
      fill="none"
      className={className}
    >
      {/* Track outline */}
      <path
        id="track"
        d="M 150 300
           L 200 250
           C 220 220, 260 180, 300 160
           C 340 140, 380 130, 420 140
           C 460 150, 500 180, 520 200
           L 560 240
           C 580 260, 620 280, 660 280
           L 750 280
           C 800 280, 840 300, 860 340
           C 880 380, 880 420, 860 460
           C 840 500, 800 520, 750 520
           L 600 520
           C 560 520, 520 500, 500 460
           L 480 420
           C 460 380, 420 360, 380 360
           L 300 360
           C 260 360, 220 380, 200 420
           L 180 460
           C 160 500, 140 520, 120 520
           C 80 520, 60 480, 60 440
           L 60 360
           C 60 320, 80 300, 120 300
           Z"
        stroke="#444"
        strokeWidth="24"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Track surface */}
      <path
        id="track-surface"
        d="M 150 300
           L 200 250
           C 220 220, 260 180, 300 160
           C 340 140, 380 130, 420 140
           C 460 150, 500 180, 520 200
           L 560 240
           C 580 260, 620 280, 660 280
           L 750 280
           C 800 280, 840 300, 860 340
           C 880 380, 880 420, 860 460
           C 840 500, 800 520, 750 520
           L 600 520
           C 560 520, 520 500, 500 460
           L 480 420
           C 460 380, 420 360, 380 360
           L 300 360
           C 260 360, 220 380, 200 420
           L 180 460
           C 160 500, 140 520, 120 520
           C 80 520, 60 480, 60 440
           L 60 360
           C 60 320, 80 300, 120 300
           Z"
        stroke="#333"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Start/Finish line */}
      <line id="start-finish" x1="140" y1="290" x2="140" y2="310" stroke="#fff" strokeWidth="3" />

      {/* Pit lane */}
      <path
        id="pit-lane"
        d="M 100 340 L 100 480 C 100 500, 120 510, 140 510 L 200 510"
        stroke="#555"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="4 4"
      />
    </svg>
  )
}

/** SVG viewport dimensions matching the viewBox */
export const TRACK_VIEWPORT = {
  width: 1000,
  height: 600,
}

/** Pit lane position for stationary drivers */
export const PIT_LANE_POSITION = {
  x: 150,
  y: 510,
}
