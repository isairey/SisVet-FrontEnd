import type { SessionUser } from '@/core/types/auth'

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResponse {
  access: string
  refresh: string
  user: SessionUser
}

export interface RefreshResponse {
  access: string
  refresh?: string
}

export interface VerifyResponse {
  valid: boolean
  user: SessionUser
}

export interface RegisterSimplePayload {
  username: string
  email: string
  password: string
  password_confirm: string
  nombre: string
  apellido: string
  telefono?: string
  direccion?: string
}

export interface RegisterStepOnePayload extends RegisterSimplePayload {}

export interface RegisterVerifyPayload {
  email: string
  code: string
}

export interface ChangePasswordPayload {
  password_actual: string
  password_nueva: string
  password_nueva_confirm: string
}

export interface ResetPasswordRequestPayload {
  email: string
}

export interface ResetPasswordConfirmPayload {
  token: string
  password: string
  password2: string
}

