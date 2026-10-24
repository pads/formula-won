/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import type { Driver, Location, Session } from './types'

const race: Session = {
  session_key: 9888,
  meeting_key: 1,
  session_name: 'Race',
  session_type: 'Race',
  date_start: '2025-10-19T19:00:00Z',
  date_end: '2025-10-19T21:00:00Z',
  circuit_key: 69,
  circuit_short_name: 'Austin',
  country_name: 'United States',
}

const location: Location = {
  driver_number: 1,
  date: '2025-10-19T19:00:00Z',
  x: -475,
  y: -1049,
  z: 0,
  session_key: 9888,
  meeting_key: 1,
}

const driver: Driver = {
  driver_number: 1,
  broadcast_name: 'M VERSTAPPEN',
  full_name: 'Max Verstappen',
  name_acronym: 'VER',
  team_name: 'Red Bull Racing',
  team_colour: '4781D7',
  session_key: 9888,
  meeting_key: 1,
}

const { f1Data } = vi.hoisted(() => ({
  f1Data: {
    getSessions: vi.fn(),
    getLocations: vi.fn(),
    getDrivers: vi.fn(),
  },
}))
vi.mock('./api', () => ({ f1Data }))

function renderApp() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  )
}

describe('App', () => {
  beforeEach(() => {
    f1Data.getSessions.mockResolvedValue([race])
    f1Data.getLocations.mockResolvedValue([location])
    f1Data.getDrivers.mockResolvedValue([driver])
  })

  it('replays the latest race', async () => {
    renderApp()

    expect(await screen.findByText('REPLAY')).toBeTruthy()
    expect(screen.getByText(/2025/)).toBeTruthy()
  })

  it('shows replay unavailable when the drivers request fails', async () => {
    f1Data.getDrivers.mockRejectedValue(new Error('429'))
    renderApp()

    expect(await screen.findByText('Replay unavailable')).toBeTruthy()
    await waitFor(() => {
      expect(screen.queryByText('REPLAY')).toBeNull()
    })
  })
})
