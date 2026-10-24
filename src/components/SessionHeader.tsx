import type { Session } from '../types'

export interface SessionHeaderProps {
  /** Current session data */
  session: Session | undefined
  /** Whether the session is live */
  isLive: boolean
  /** Whether the session is a past race being replayed */
  isReplay?: boolean
  /** Whether session data is loading */
  isLoading: boolean
}

/**
 * Displays session information: circuit name, session type, and live status.
 */
export function SessionHeader({
  session,
  isLive,
  isReplay = false,
  isLoading,
}: SessionHeaderProps) {
  if (isLoading) {
    return (
      <header className="text-center py-4">
        <div className="h-8 bg-neutral-800 rounded animate-pulse w-48 mx-auto" />
        <div className="h-6 bg-neutral-800 rounded animate-pulse w-32 mx-auto mt-2" />
      </header>
    )
  }

  if (!session) {
    return (
      <header className="text-center py-4">
        <h1 className="text-2xl font-bold text-neutral-200">Formula Won</h1>
        <p className="text-neutral-500 mt-1">No live session</p>
      </header>
    )
  }

  return (
    <header className="text-center py-4">
      <div className="flex items-center justify-center gap-3">
        <h1 className="text-2xl font-bold text-neutral-200">{session.circuit_short_name}</h1>
        {isLive && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-600 text-white">
            LIVE
          </span>
        )}
        {isReplay && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-700 text-neutral-100">
            REPLAY
          </span>
        )}
      </div>
      <p className="text-neutral-400 mt-1">
        {session.country_name} - {session.session_name}
        {isReplay && ` ${String(new Date(session.date_start).getUTCFullYear())}`}
      </p>
    </header>
  )
}
