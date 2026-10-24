import { f1Data } from './api'
import { useSession, useLocations, useDrivers } from './hooks'
import { Track } from './components/Track'
import { SessionHeader } from './components/SessionHeader'

function App() {
  const now = new Date()

  // Fetch session data and determine if live
  const { currentSession, isLive, isLoading: sessionLoading } = useSession(f1Data, now)

  // Fetch drivers for the current session
  const { drivers } = useDrivers(f1Data, currentSession?.session_key)

  // Poll locations during live session
  const { locations } = useLocations(f1Data, currentSession?.session_key, isLive)

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4">
      <SessionHeader
        session={currentSession}
        isLive={isLive}
        isLoading={sessionLoading}
      />

      <main className="mt-8">
        <Track locations={locations} drivers={drivers} isLive={isLive} />
      </main>
    </div>
  )
}

export default App
