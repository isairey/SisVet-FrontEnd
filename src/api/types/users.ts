import type { PaginatedResponse } from '@/api/types/common'
import type { ClienteProfile, PracticanteProfile, SessionUser, VeterinarioProfile } from '@/core/types/auth'

export type UserEstado = 'activo' | 'inactivo' | 'suspendido'

export interface UserListItem extends SessionUser {
  nombre: string
  apellido: string
  estado: UserEstado
  created_at: string
}

export interface UserDetail {
  id: number
  username: string
  email: string
  nombre: string
  apellido: string
  estado: UserEstado
  roles: { id: number; nombre: string }[]
  created_at: string
  perfil_veterinario?: VeterinarioProfile | null
  perfil_practicante?: PracticanteProfile | null
  perfil_cliente?: ClienteProfile | null
}

export interface UserCreatePayload {
  username: string
  email: string
  password: string
  password_confirm: string
  nombre: string
  apellido: string
  estado?: UserEstado
  roles: string[]
  perfil_veterinario?: Partial<VeterinarioProfile>
  perfil_practicante?: Partial<PracticanteProfile>
  perfil_cliente?: Partial<ClienteProfile>
}

export interface UserUpdatePayload extends Partial<Omit<UserCreatePayload, 'password' | 'password_confirm'>> {}

export interface UserChangePasswordPayload {
  password_actual: string
  password_nueva: string
  password_nueva_confirm: string
}

export interface UserStats {
  total_usuarios: number
  usuarios_activos: number
  usuarios_por_rol: Record<string, number>
}

export interface UserQueryParams {
  page?: number
  search?: string
  estado?: UserEstado | 'todos'
  rol?: string
  ordering?: string
}

export type UserListResponse = PaginatedResponse<UserListItem>

export interface RoleOption {
  id: number
  nombre: string
  descripcion?: string
}

export type RoleListResponse = PaginatedResponse<RoleOption>

