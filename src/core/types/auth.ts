export type UserRole = 'administrador' | 'veterinario' | 'practicante' | 'recepcionista' | 'cliente'

export interface SessionUser {
  id: number
  username: string
  email: string
  nombre_completo: string
  roles: UserRole[]
}

export interface RoleDetail {
  id: number
  nombre: UserRole
  descripcion?: string
}

export interface VeterinarioProfile {
  id: number
  licencia?: string
  especialidad?: string
  horario?: string
}

export interface PracticanteProfile {
  id: number
  tutor_veterinario?: string
  universidad?: string
  periodo_practica?: string
}

export interface ClienteProfile {
  id: number
  telefono?: string
  direccion?: string
}

export interface UserProfile {
  id: number
  username: string
  email: string
  nombre: string
  apellido: string
  estado: string
  created_at: string
  roles: RoleDetail[]
  perfil_veterinario?: VeterinarioProfile | null
  perfil_practicante?: PracticanteProfile | null
  perfil_cliente?: ClienteProfile | null
}

