import axios, { AxiosError } from 'axios'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'

import type { RefreshResponse } from '@/api/types/auth'
import { appConfig } from '@/core/config/app-config'
import { useSessionStore } from '@/core/store/session-store'

/**
 * Extensión de la configuración de Axios para incluir la bandera de reintento (`_retry`).
 * Esto evita bucles infinitos cuando el refresh token también falla.
 */
type AxiosRequestConfigWithRetry = AxiosRequestConfig & { _retry?: boolean }

/**
 * Instancia principal de Axios para la comunicación con el Backend.
 * Configurada con timeouts y headers base.
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: appConfig.apiUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

/**
 * Interceptor de Solicitud (Request):
 * Inyecta automáticamente el Access Token en los headers si existe una sesión activa.
 */
apiClient.interceptors.request.use((config) => {
  const token = useSessionStore.getState().accessToken

  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Variable para controlar la condición de carrera (race condition) cuando ocurren múltiples 401 simultáneos.
// Si ya hay una promesa de refresh en curso, las siguientes peticiones esperarán a esa misma promesa.
let refreshPromise: Promise<string | null> | null = null

/**
 * Función auxiliar para gestionar la renovación del token.
 * Implementa un patrón Singleton para la promesa de renovación para evitar múltiples llamadas al endpoint de refresh.
 */
const refreshAccessToken = async (): Promise<string | null> => {
  const { refreshToken, setTokens, clearSession } = useSessionStore.getState()
  
  if (!refreshToken) {
    return null
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post<RefreshResponse>(`${appConfig.apiUrl}/auth/refresh/`, { refresh: refreshToken })
      .then((response) => {
        const { access, refresh } = response.data
        // Actualizamos los tokens en el store (y localStorage via persistencia)
        setTokens({ accessToken: access, refreshToken: refresh ?? refreshToken })
        return access
      })
      .catch(() => {
        // Si el refresh token también expiró o es inválido, cerramos la sesión forzosamente.
        clearSession()
        return null
      })
      .finally(() => {
        // Limpiamos la promesa una vez finalizada para permitir futuros intentos
        refreshPromise = null
      })
  }

  return refreshPromise
}

/**
 * Interceptor de Respuesta (Response):
 * Maneja globalmente los errores 401 (No autorizado).
 * Intenta renovar el token de forma transparente y reintentar la solicitud original.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfigWithRetry | undefined
    const status = error.response?.status
    const requestUrl = originalRequest?.url ?? ''

    // Solo intentamos refrescar si:
    // 1. Es un error 401.
    // 2. Existe la solicitud original.
    // 3. No hemos reintentado ya esta solicitud (evitar bucle).
    // 4. No es una petición de login o del propio refresh (evitar bucle).
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !requestUrl.includes('/auth/login') &&
      !requestUrl.includes('/auth/refresh/')
    ) {
      originalRequest._retry = true
      const newAccessToken = await refreshAccessToken()

      if (newAccessToken) {
        // Actualizamos el header con el nuevo token y reintentamos la petición original
        originalRequest.headers = originalRequest.headers ?? {}
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return apiClient(originalRequest)
      }
    }

    return Promise.reject(error)
  },
)

export { apiClient }