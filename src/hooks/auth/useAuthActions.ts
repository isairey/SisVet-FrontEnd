import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import toast from 'react-hot-toast'

import type { LoginPayload, RegisterSimplePayload, RegisterStepOnePayload, RegisterVerifyPayload } from '@/api/types/auth'
import { authService, passwordService, profileService } from '@/services/auth'
import { useSessionStore } from '@/core/store/session-store'

/**
 * Extrae y formatea errores de autenticación complejos.
 * Maneja errores de campo (ej: "password": ["Es muy corta"]) y errores generales ("detail").
 */
const getErrorMessage = (error: AxiosError<any>) => {
  if (error.response?.data) {
    const data = error.response.data as Record<string, unknown>
    
    // Recopilar errores de campos específicos (ej: email, password)
    const fieldErrors: string[] = []
    Object.keys(data).forEach((key) => {
      if (key !== 'detail' && key !== 'message' && key !== 'non_field_errors') {
        const value = data[key]
        if (Array.isArray(value) && value.length > 0) {
          fieldErrors.push(`${key}: ${value[0]}`)
        } else if (typeof value === 'string') {
          fieldErrors.push(`${key}: ${value}`)
        }
      }
    })
    
    if (fieldErrors.length > 0) {
      return fieldErrors.join(', ')
    }
    
    // Errores generales
    if (typeof data.detail === 'string') return data.detail
    if (typeof data.message === 'string') return data.message
    if (Array.isArray(data.non_field_errors) && data.non_field_errors[0]) return String(data.non_field_errors[0])
  }
  return 'Ocurrió un error inesperado.'
}

/**
 * Mutación para Iniciar Sesión.
 * Al completarse: Guarda el usuario y tokens en el Store de Zustand (persistiendo la sesión).
 */
export const useLoginMutation = () => {
  const setSession = useSessionStore((state) => state.setSession)

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: ({ user, access, refresh }) => {
      // Actualizamos el estado global, lo que dispara la redirección a /app automáticamente
      setSession({ user, accessToken: access, refreshToken: refresh })
      toast.success(`Bienvenido ${user.nombre_completo}`)
    },
    onError: (error: AxiosError) => {
      toast.error(getErrorMessage(error))
    },
  })
}

/**
 * Mutación para Cerrar Sesión.
 * Realiza un logout "best-effort": intenta invalidar el token en el backend,
 * pero siempre limpia la sesión local (Store) sin importar si la petición falla.
 */
export const useLogoutMutation = () => {
  const refreshToken = useSessionStore((state) => state.refreshToken)
  const clearSession = useSessionStore((state) => state.clearSession)

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        await authService.logout(refreshToken)
      }
    },
    onSettled: () => {
      // 'onSettled' se ejecuta siempre (éxito o error).
      // Garantiza que el usuario salga de la app aunque el servidor esté caído.
      clearSession()
    },
  })
}

/**
 * Registro simple (para Clientes).
 * Solo notifica el éxito, la redirección se maneja en el componente.
 */
export const useRegisterSimpleMutation = () =>
  useMutation({
    mutationFn: (payload: RegisterSimplePayload) => authService.registerSimple(payload),
    onSuccess: () => toast.success('Registro exitoso. Revisa tu correo para confirmar.'),
    onError: (error: AxiosError) => toast.error(getErrorMessage(error)),
  })

/**
 * Paso 1 del Registro con Código (envío de datos y generación de OTP).
 */
export const useRegisterStepMutation = () =>
  useMutation({
    mutationFn: (payload: RegisterStepOnePayload) => authService.registerStepOne(payload),
    onSuccess: () => toast.success('Te enviamos un código de verificación. Revisa tu bandeja de entrada.'),
    onError: (error: AxiosError) => toast.error(getErrorMessage(error)),
  })

/**
 * Paso 2: Verificación del código OTP.
 */
export const useVerifyCodeMutation = () =>
  useMutation({
    mutationFn: (payload: RegisterVerifyPayload) => authService.verifyRegistrationCode(payload),
    onSuccess: () => toast.success('Cuenta verificada. Ya puedes iniciar sesión.'),
    onError: (error: AxiosError) => toast.error(getErrorMessage(error)),
  })

export const useResendCodeMutation = () =>
  useMutation({
    mutationFn: (payload: { email: string }) => authService.resendVerificationCode(payload),
    onSuccess: () => toast.success('Nuevo código enviado.'),
    onError: (error: AxiosError) => toast.error(getErrorMessage(error)),
  })

// --- Gestión de Contraseñas ---

export const useRequestResetMutation = () =>
  useMutation({
    mutationFn: (payload: { email: string }) => passwordService.requestReset(payload),
    onSuccess: () => toast.success('Si el correo existe, enviamos un enlace de restablecimiento.'),
    onError: (error: AxiosError) => toast.error(getErrorMessage(error)),
  })

export const useConfirmResetMutation = () =>
  useMutation({
    mutationFn: passwordService.confirmReset,
    onSuccess: () => toast.success('Contraseña actualizada correctamente.'),
    onError: (error: AxiosError) => toast.error(getErrorMessage(error)),
  })

// --- Gestión de Perfil ---

/**
 * Obtiene los datos del perfil actual.
 * Solo se ejecuta si el usuario está autenticado (`enabled: isAuthenticated`).
 */
export const useProfileQuery = () => {
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated)

  return useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: profileService.getProfile,
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  })
}

/**
 * Actualiza los datos del perfil.
 * Actualiza manualmente la caché de ['auth', 'profile'] para reflejar los cambios sin recargar.
 */
export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'profile'], data)
      toast.success('Perfil actualizado')
    },
    onError: (error: AxiosError) => toast.error(getErrorMessage(error)),
  })
}

export const useChangePasswordMutation = () =>
  useMutation({
    mutationFn: passwordService.changePassword,
    onSuccess: () => toast.success('Contraseña actualizada'),
    onError: (error: AxiosError) => toast.error(getErrorMessage(error)),
  })