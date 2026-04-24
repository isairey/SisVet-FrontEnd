import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import type { UserRole } from '@/core/types/auth'
import { useSessionStore } from '@/core/store/session-store'

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: ReactNode
  fallback?: ReactNode
}

export const RoleGuard = ({ allowedRoles, children, fallback }: RoleGuardProps) => {
  const roles = useSessionStore((state) => state.user?.roles ?? [])
  const canAccess = allowedRoles.some((role) => roles.includes(role))

  if (!canAccess) {
    return fallback ?? <Navigate to="/app" replace />
  }

  return <>{children}</>
}

