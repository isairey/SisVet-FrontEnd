import { useMemo } from 'react'
import { useSessionStore } from '@/core/store/session-store'
import type { UserRole } from '@/core/types/auth'
import { getModulePermissions, hasPermission, getNavigationItemsForRole } from '@/core/permissions/rolePermissions'
import type { ModulePermissions } from '@/core/permissions/rolePermissions'

/**
 * Hook para verificar permisos del usuario actual
 */
export const usePermissions = () => {
  const userRoles = useSessionStore((state) => state.user?.roles ?? [])

  const checkPermission = useMemo(
    () =>
      (
        module: Parameters<typeof hasPermission>[1],
        action: Parameters<typeof hasPermission>[2],
      ): boolean => {
        return hasPermission(userRoles, module, action)
      },
    [userRoles],
  )

  const getPermissions = useMemo(
    () => (module: Parameters<typeof getModulePermissions>[1]): ModulePermissions => {
      return getModulePermissions(userRoles, module)
    },
    [userRoles],
  )

  const isAdmin = useMemo(() => userRoles.includes('administrador'), [userRoles])

  const hasRole = useMemo(
    () => (role: UserRole): boolean => {
      return userRoles.includes(role)
    },
    [userRoles],
  )

  const navigationItems = useMemo(() => getNavigationItemsForRole(userRoles), [userRoles])

  return {
    userRoles,
    checkPermission,
    getPermissions,
    isAdmin,
    hasRole,
    navigationItems,
  }
}

