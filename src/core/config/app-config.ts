const API_VERSION = '/api/v1'
const rawBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const sanitizedBase = rawBaseUrl.replace(/\/$/, '')

export const appConfig = {
  appName: 'Sistema de Gestión Veterinaria',
  env: import.meta.env.MODE,
  apiBaseUrl: sanitizedBase,
  apiVersion: API_VERSION,
  apiUrl: `${sanitizedBase}${API_VERSION}`,
  timeZone: import.meta.env.VITE_TIME_ZONE ?? 'America/Bogota',
}

export type AppConfig = typeof appConfig

