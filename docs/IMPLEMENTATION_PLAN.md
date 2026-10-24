# Formula Won - Implementation Plan

## Overview

Build a React + TypeScript web app that visualizes F1 driver locations on track during live sessions. MVP focuses on COTA for the US Grand Prix.

## Tech Stack

- **Build**: Vite + React + TypeScript (strict)
- **Styling**: Tailwind CSS (dark theme)
- **State**: Zustand
- **Data fetching**: React Query (TanStack Query)
- **Package manager**: pnpm
- **Linting**: ESLint + Prettier
- **Deploy**: Netlify

## Project Structure

```
formula-won/
├── docs/
│   ├── IMPLEMENTATION_PLAN.md   # This plan
│   └── adr/                     # Architecture Decision Records
├── src/
│   ├── main.tsx                 # Entry point
│   ├── App.tsx                  # Root component
│   ├── api/
│   │   └── openf1.ts            # OpenF1 API client
│   ├── components/
│   │   ├── Track/
│   │   │   ├── Track.tsx        # SVG track container
│   │   │   ├── DriverDot.tsx    # Individual driver marker
│   │   │   └── PitLane.tsx      # Pit lane area
│   │   ├── SessionHeader.tsx    # Session info display
│   │   └── DriverTooltip.tsx    # Hover tooltip
│   ├── circuits/
│   │   └── cota/
│   │       ├── index.ts         # Circuit config & bounds
│   │       └── track.svg        # Track SVG asset
│   ├── hooks/
│   │   ├── useSession.ts        # Session detection & data
│   │   ├── useLocations.ts      # Driver location polling
│   │   └── useDrivers.ts        # Driver info & colors
│   ├── stores/
│   │   └── sessionStore.ts      # Zustand store
│   ├── utils/
│   │   ├── coordinates.ts       # Coordinate normalization
│   │   └── colors.ts            # Team color mapping
│   └── types/
│       └── index.ts             # TypeScript types
├── public/
├── index.html
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── .env                         # VITE_OPENF1_API_URL
└── package.json
```

## Implementation Approach

**TDD throughout**: Use the TDD skill (red-green-refactor) for all implementation. Write failing tests first, implement to pass, then refactor. Follow Kent Beck's TestDesiderata principles.

## Implementation Steps

### Phase 1: Project Scaffold
1. Save this implementation plan to `docs/IMPLEMENTATION_PLAN.md`
2. Initialize Vite project with React + TypeScript template
3. Install dependencies: `@tanstack/react-query`, `zustand`, `tailwindcss`, `postcss`, `autoprefixer`, `vitest`
4. Configure Tailwind with dark theme
5. Configure ESLint + Prettier
6. Configure Vitest for unit testing
7. Set up environment variable for OpenF1 API URL
8. Create base folder structure

### Phase 2: API Layer (TDD)
1. Write tests for OpenF1 API client types and parsing
2. Implement typed API client:
   - `GET /sessions` - fetch sessions, detect live
   - `GET /location` - fetch driver positions
   - `GET /drivers` - fetch driver info
3. Define TypeScript types for API responses

### Phase 3: Coordinate Transform (TDD)
1. Write tests for coordinate normalization with known COTA data points
2. Implement `normalizeCoordinates()` utility
3. Write tests for SVG viewport transform
4. Implement `toSvgPosition()` utility
5. Create COTA circuit config with bounds:
   - X: -2,551 to 15,580
   - Y: -4,072 to 6,435

### Phase 4: COTA Circuit Setup
1. Download COTA SVG from FreeSVG.org (Public Domain)
2. Clean up SVG: remove unnecessary elements, optimize
3. Add pit lane path to SVG
4. Wire up circuit config with SVG

### Phase 5: Session Detection (TDD)
1. Write tests for live session detection logic
2. Implement `isSessionLive()` utility
3. Write tests for session state transitions
4. Implement `useSession` hook

### Phase 6: Core Components
1. **Track.tsx**: Render SVG, position drivers using tested coordinate transform
2. **DriverDot.tsx**: Team-colored circle with CSS transitions
3. **DriverTooltip.tsx**: Name + number on hover
4. **PitLane.tsx**: Area for stationary/retired drivers
5. **SessionHeader.tsx**: Circuit name, session type, status

### Phase 7: Data Flow (TDD)
1. Write tests for location polling behavior (start/stop, interval, error handling)
2. Implement **useLocations hook**: Poll `/location` every 3s during live session
3. Write tests for driver data fetching and team color lookup
4. Implement **useDrivers hook**: Fetch driver list, team colors
5. Write tests for session store state transitions
6. Implement **sessionStore**: Track current session state, connection status
7. Wire up React Query with polling config

### Phase 8: UI States
1. Loading state: Track outline with skeleton dots
2. Error state: "Connection lost" indicator with stale data
3. No session state: All drivers in pit lane
4. Retired drivers: Dimmed appearance in pit lane
5. Responsive: Fluid SVG with maintained aspect ratio

### Phase 9: Deploy (Deferred)
*Deploy to Netlify once local version is complete and verified.*

## COTA Coordinate Bounds (Pre-computed)

```typescript
export const COTA_BOUNDS = {
  x: { min: -2551, max: 15580 },
  y: { min: -4072, max: 6435 },
};
```

## Key Files to Create

| File | Purpose |
|------|---------|
| `src/api/openf1.ts` | API client with typed requests |
| `src/utils/coordinates.ts` | Normalize OpenF1 coords to 0-1 |
| `src/circuits/cota/index.ts` | COTA config + bounds |
| `src/components/Track/Track.tsx` | Main visualization |
| `src/hooks/useLocations.ts` | Polling driver positions |

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "@tanstack/react-query": "^5.x",
    "zustand": "^4.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "vite": "^5.x",
    "@vitejs/plugin-react": "^4.x",
    "tailwindcss": "^3.x",
    "postcss": "^8.x",
    "autoprefixer": "^10.x",
    "eslint": "^8.x",
    "prettier": "^3.x",
    "vitest": "^1.x"
  }
}
```

## Out of Scope (Post-MVP)

- Sidebar with standings, gaps, tire info, lap times
- Additional circuits beyond COTA
- Light mode theme toggle
- Historical session replay
