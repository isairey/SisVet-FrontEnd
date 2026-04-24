import { Navigate } from 'react-router-dom'

import { Spinner } from '@/components/ui/Spinner'
import { useSessionStore } from '@/core/store/session-store'

export const LandingRedirect = () => {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated)
  const hydrated = useSessionStore((state) => state.hydrated)

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base text-white">
        <Spinner size="lg" />
      </div>
    )
  }

  return <Navigate to={isAuthenticated ? '/app' : '/auth'} replace />
}

