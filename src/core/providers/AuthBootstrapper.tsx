import { useEffect } from 'react'

import { authService } from '@/services/auth'
import { useSessionStore } from '@/core/store/session-store'

export const AuthBootstrapper = () => {
  const accessToken = useSessionStore((state) => state.accessToken)
  const hydrated = useSessionStore((state) => state.hydrated)
  const setUser = useSessionStore((state) => state.setUser)
  const markHydrated = useSessionStore((state) => state.markHydrated)
  const clearSession = useSessionStore((state) => state.clearSession)

  useEffect(() => {
    if (hydrated) return

    const bootstrap = async () => {
      if (!accessToken) {
        markHydrated()
        return
      }

      try {
        const { user } = await authService.verifySession()
        setUser(user)
      } catch {
        clearSession()
      } finally {
        markHydrated()
      }
    }

    void bootstrap()
  }, [accessToken, hydrated, markHydrated, setUser, clearSession])

  return null
}

