import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { Spinner } from '@/components/ui/Spinner'
import { useSessionStore } from '@/core/store/session-store'

interface RequireAuthProps {
  children: ReactNode
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const location = useLocation()
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated)
  const hydrated = useSessionStore((state) => state.hydrated)

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base text-white">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />
  }

  return <>{children}</>
}

