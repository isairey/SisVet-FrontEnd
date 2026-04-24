import type { UserRole } from '@/core/types/auth'
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarDays,
  ClipboardList,
  NotebookTabs,
  Package,
  Receipt,
  Settings,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavigationItem {
  label: string
  href: string
  icon: LucideIcon
  allowedRoles: UserRole[]
}

/**
 * Configuración de permisos y navegación por rol
 * Define qué módulos puede ver y acceder cada rol
 */
export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: 'Inicio',
    href: '/app',
    icon: LayoutDashboard,
    allowedRoles: ['administrador', 'veterinario', 'practicante', 'recepcionista', 'cliente'],
  },
  {
    label: 'Usuarios',
    href: '/app/usuarios',
    icon: Users,
    allowedRoles: ['administrador'],
  },
  {
    label: 'Mascotas',
    href: '/app/mascotas',
    icon: Stethoscope,
    allowedRoles: ['administrador', 'veterinario', 'practicante', 'recepcionista', 'cliente'],
  },
  {
    label: 'Citas',
    href: '/app/citas',
    icon: CalendarDays,
    allowedRoles: ['administrador', 'veterinario', 'practicante', 'recepcionista', 'cliente'],
  },
  {
    label: 'Consultas',
    href: '/app/consultas',
    icon: ClipboardList,
    allowedRoles: ['administrador', 'veterinario', 'practicante', 'recepcionista', 'cliente'],
  },
  {
    label: 'Historias clínicas',
    href: '/app/historias',
    icon: NotebookTabs,
    allowedRoles: ['administrador', 'veterinario', 'practicante', 'recepcionista', 'cliente'],
  },
  {
    label: 'Inventario',
    href: '/app/inventario',
    icon: Package,
    allowedRoles: ['administrador', 'recepcionista'],
  },
  {
    label: 'Facturación',
    href: '/app/facturacion',
    icon: Receipt,
    allowedRoles: ['administrador', 'recepcionista', 'cliente'],
  },
  {
    label: 'Configuración',
    href: '/app/configuracion',
    icon: Settings,
    allowedRoles: ['administrador'],
  },
]

/**
 * Permisos de acción por módulo y rol
 */
export interface ModulePermissions {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export const ROLE_PERMISSIONS: Record<string, Record<string, ModulePermissions>> = {
  // Permisos de Mascotas
  mascotas: {
    cliente: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    administrador: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    veterinario: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    practicante: { canView: true, canCreate: true, canEdit: false, canDelete: false },
    recepcionista: { canView: true, canCreate: true, canEdit: true, canDelete: false },
  },
  // Permisos de Citas
  citas: {
    cliente: { canView: true, canCreate: true, canEdit: false, canDelete: true },
    administrador: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    veterinario: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    practicante: { canView: true, canCreate: true, canEdit: false, canDelete: false },
    recepcionista: { canView: true, canCreate: true, canEdit: true, canDelete: true },
  },
  // Permisos de Consultas
  consultas: {
    cliente: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    administrador: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    veterinario: { canView: true, canCreate: true, canEdit: true, canDelete: false },
    practicante: { canView: true, canCreate: true, canEdit: false, canDelete: false },
    recepcionista: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  },
  // Permisos de Historias Clínicas
  historias: {
    cliente: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    administrador: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    veterinario: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    practicante: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    recepcionista: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  },
  // Permisos de Inventario
  inventario: {
    cliente: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    administrador: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    veterinario: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    practicante: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    recepcionista: { canView: true, canCreate: false, canEdit: false, canDelete: false },
  },
  // Permisos de Facturación
  facturacion: {
    cliente: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    administrador: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    veterinario: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    practicante: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    recepcionista: { canView: true, canCreate: true, canEdit: true, canDelete: false },
  },
  // Permisos de Usuarios
  usuarios: {
    cliente: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    administrador: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    veterinario: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    practicante: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    recepcionista: { canView: false, canCreate: false, canEdit: false, canDelete: false },
  },
  // Permisos de Configuración
  configuracion: {
    cliente: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    administrador: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    veterinario: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    practicante: { canView: false, canCreate: false, canEdit: false, canDelete: false },
    recepcionista: { canView: false, canCreate: false, canEdit: false, canDelete: false },
  },
}

/**
 * Obtiene los items de navegación permitidos para un rol
 */
export const getNavigationItemsForRole = (roles: UserRole[]): NavigationItem[] => {
  return NAVIGATION_ITEMS.filter((item) => item.allowedRoles.some((role) => roles.includes(role)))
}

/**
 * Verifica si un usuario tiene permiso para una acción específica en un módulo
 */
export const hasPermission = (
  roles: UserRole[],
  module: keyof typeof ROLE_PERMISSIONS,
  action: 'canView' | 'canCreate' | 'canEdit' | 'canDelete',
): boolean => {
  const modulePermissions = ROLE_PERMISSIONS[module]
  if (!modulePermissions) return false

  // Si tiene rol de administrador, tiene todos los permisos
  if (roles.includes('administrador')) return true

  // Verificar permisos para cada rol del usuario
  return roles.some((role) => {
    const permissions = modulePermissions[role]
    return permissions?.[action] ?? false
  })
}

/**
 * Obtiene los permisos completos de un módulo para un usuario
 */
export const getModulePermissions = (
  roles: UserRole[],
  module: keyof typeof ROLE_PERMISSIONS,
): ModulePermissions => {
  const modulePermissions = ROLE_PERMISSIONS[module]
  if (!modulePermissions) {
    return { canView: false, canCreate: false, canEdit: false, canDelete: false }
  }

  // Si tiene rol de administrador, tiene todos los permisos
  if (roles.includes('administrador')) {
    return { canView: true, canCreate: true, canEdit: true, canDelete: true }
  }

  // Combinar permisos de todos los roles del usuario (OR lógico)
  const combinedPermissions: ModulePermissions = {
    canView: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
  }

  roles.forEach((role) => {
    const permissions = modulePermissions[role]
    if (permissions) {
      combinedPermissions.canView = combinedPermissions.canView || permissions.canView
      combinedPermissions.canCreate = combinedPermissions.canCreate || permissions.canCreate
      combinedPermissions.canEdit = combinedPermissions.canEdit || permissions.canEdit
      combinedPermissions.canDelete = combinedPermissions.canDelete || permissions.canDelete
    }
  })

  return combinedPermissions
}

