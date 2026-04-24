import { Outlet } from 'react-router-dom'

import { Sidebar } from '@/components/navigation/Sidebar'
import { TopBar } from '@/components/navigation/TopBar'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useSessionStore } from '@/core/store/session-store'
import { getNavigationItemsForRole } from '@/core/permissions/rolePermissions'

export const DashboardLayout = () => {
  const { isOpen, toggle, close } = useDisclosure(false)
  const userRoles = useSessionStore((state) => state.user?.roles ?? [])
  const navigationItems = getNavigationItemsForRole(userRoles)
  
  // Actualizar título de la pestaña según la ruta
  useDocumentTitle()

  return (
    <div className="dashboard-shell flex min-h-screen bg-base text-[var(--color-text-primary)] overflow-x-hidden">
      <Sidebar items={navigationItems} isOpen={isOpen} onNavigate={close} />
      {isOpen && <div className="fixed inset-0 z-20 bg-black/20 md:hidden" onClick={close} />}

      <div className="dashboard-main flex w-full flex-col flex-1 min-w-0 md:pl-[260px]">
        <TopBar onToggleSidebar={toggle} />

        {/* Banner */}
        <div className="w-full relative bg-base px-3 py-2 md:px-4 md:py-3">
          <div className="w-full h-32 rounded-lg overflow-hidden relative" style={{ boxShadow: 'var(--shadow-soft)' }}>
            <img 
              src="/banner.png" 
              alt="Banner SGV" 
              className="absolute inset-0 w-full h-full"
              style={{
                imageRendering: 'auto',
                imageRendering: '-webkit-optimize-contrast',
                imageRendering: 'crisp-edges',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
                margin: 0,
                padding: 0,
              }}
              loading="eager"
              decoding="async"
              onError={(e) => {
                // Fallback si el banner no existe
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          </div>
        </div>

        <main className="dashboard-content flex-1 space-y-6 overflow-y-auto overflow-x-hidden px-3 py-4 md:px-4 md:py-6">
          <section className="min-h-[calc(100vh-180px)] rounded-[var(--radius-card)] bg-surface px-4 py-5 md:px-6 md:py-6" style={{ boxShadow: 'var(--shadow-card)' }}>
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  )
}

