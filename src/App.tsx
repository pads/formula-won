import { useEffect, useState } from 'react'
import { f1Data } from './api'
import { cotaConfig } from './circuits/cota'
import { useSession, useLocations, useDrivers, useReplayLocations } from './hooks'
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

  // Fetch session data and determine if live, or which race to replay
  const {
    currentSession,
    replayCandidates,
    mode,
    isLive,
    isLoading: sessionLoading,
  } = useSession(f1Data, now, cotaConfig.shortName)

  // Replay the latest race when nothing is live
  const { session: replaySession, locations: replayLocations } = useReplayLocations(
    f1Data,
    replayCandidates,
    mode === 'replay'
  )

  const session = isLive ? currentSession : replaySession

  // Fetch drivers for whichever session is shown
  const { drivers } = useDrivers(f1Data, session?.session_key)

  // Poll locations during live session
  const { locations: liveLocations } = useLocations(f1Data, currentSession?.session_key, isLive)
  const locations = isLive ? liveLocations : replayLocations

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4">
      <SessionHeader
        session={session}
        isLive={isLive}
        isReplay={!isLive && replaySession !== undefined}
        isLoading={sessionLoading}
      />

      <main className="mt-8">
        <Track locations={locations} drivers={drivers} showPositions={session !== undefined} />
      </main>
    </div>
  )
}

export default App
