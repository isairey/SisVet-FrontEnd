import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { SessionUser } from '@/core/types/auth'

/**
 * Define el estado de la sesión del usuario.
 */
interface SessionState {
  user: SessionUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  /** Bandera para saber si el store ya ha cargado los datos de localStorage (hidratación) */
  hydrated: boolean
}

/**
 * Define las acciones disponibles para modificar la sesión.
 */
interface SessionActions {
  setSession: (payload: { user: SessionUser; accessToken: string; refreshToken?: string | null }) => void
  setTokens: (payload: { accessToken: string; refreshToken?: string | null }) => void
  setUser: (user: SessionUser | null) => void
  markHydrated: (value?: boolean) => void
  clearSession: () => void
}

/**
 * Store global de sesión usando Zustand.
 * Utiliza el middleware 'persist' para guardar automáticamente el estado en localStorage/sessionStorage.
 */
export const useSessionStore = create<SessionState & SessionActions>()(
  persist(
    (set) => ({
      // Estado inicial
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      hydrated: false,

      // Acciones
      
      /** Establece una sesión completa (login exitoso) */
      setSession: ({ user, accessToken, refreshToken }) =>
        set({
          user,
          accessToken,
          refreshToken: refreshToken ?? null,
          isAuthenticated: true,
        }),

      /** Actualiza solo los tokens (útil tras un refresh token) */
      setTokens: ({ accessToken, refreshToken }) =>
        set((state) => ({
          accessToken,
          refreshToken: refreshToken ?? state.refreshToken,
          isAuthenticated: state.user ? true : state.isAuthenticated,
        })),

      /** Actualiza los datos del usuario sin tocar los tokens */
      setUser: (user) =>
        set((state) => ({
          user,
          isAuthenticated: Boolean(user && state.accessToken),
        })),

      /** Marca el store como hidratado (carga inicial completada) para evitar flashes de UI */
      markHydrated: (value = true) => set({ hydrated: value }),

      /** Cierra la sesión y limpia el estado sensible, manteniendo la bandera de hidratación */
      clearSession: () =>
        set((state) => ({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          hydrated: state.hydrated || true,
        })),
    }),
    {
      name: 'sgv-session', // Key utilizada en localStorage
      // Partializamos para guardar solo lo necesario y evitar guardar basura o estado transitorio
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        hydrated: state.hydrated,
      }),
    },
  ),
)