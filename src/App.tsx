import { useEffect, useState } from 'react'
import { f1Data } from './api'
import { cotaConfig } from './circuits/cota'
import { useSession, useDrivers, useReplayLocations } from './hooks'
import { Track } from './components/Track'
import { SessionHeader } from './components/SessionHeader'

function App() {
  // Ticks once a minute so a session going live (or ending) is picked up
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date())
    }, 60_000)
    return () => {
      clearInterval(id)
    }
  }, [])

  // Work out which race to replay; nothing is replayed while a session is live
  const { replayCandidates, isLoading: sessionLoading } = useSession(
    f1Data,
    now,
    cotaConfig.shortName
  )

  const { session: replaySession, locations } = useReplayLocations(
    f1Data,
    replayCandidates,
    replayCandidates.length > 0
  )

  const { drivers, isError: driversFailed } = useDrivers(f1Data, replaySession?.session_key)

  // Without driver metadata there are no dots, so treat it like any other API failure
  const session = driversFailed ? undefined : replaySession

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4">
      <SessionHeader session={session} isLoading={sessionLoading} />

      <main className="mt-8">
        <Track locations={locations} drivers={drivers} showPositions={session !== undefined} />
      </main>
    </div>
  )
}

export default App
