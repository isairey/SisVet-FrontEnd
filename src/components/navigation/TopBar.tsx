import type { ReactNode } from 'react'
import { Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useMemo } from 'react'
import { useSessionStore } from '@/core/store/session-store'

import { UserMenu } from './UserMenu'

interface TopBarProps {
  title?: ReactNode
  onToggleSidebar?: () => void
}

// Mapeo de rutas a nombres de paneles
const routePanelMap: Record<string, string> = {
  '/app': 'Inicio',
  '/app/perfil': 'Perfil',
  '/app/usuarios': 'Usuarios',
  '/app/usuarios/nuevo': 'Nuevo Usuario',
  '/app/mascotas': 'Mascotas',
  '/app/mascotas/nueva': 'Nueva Mascota',
  '/app/citas': 'Citas',
  '/app/citas/nueva': 'Nueva Cita',
  '/app/consultas': 'Consultas',
  '/app/consultas/nueva': 'Nueva Consulta',
  '/app/historias': 'Historias Clínicas',
  '/app/inventario': 'Inventario',
  '/app/inventario/nuevo': 'Nuevo Producto',
  '/app/inventario/kardex': 'Kardex',
  '/app/inventario/movimientos/nuevo': 'Nuevo Movimiento',
  '/app/facturacion': 'Facturación',
  '/app/configuracion': 'Configuración',
}

// Función para obtener el nombre del panel desde la ruta
const getPanelNameFromPath = (pathname: string): string => {
  // Buscar coincidencia exacta primero
  if (routePanelMap[pathname]) {
    return routePanelMap[pathname]
  }

  // Buscar coincidencias con parámetros (ej: /app/citas/123 -> Detalle de Cita)
  const pathSegments = pathname.split('/').filter(Boolean)
  
  // Si es una ruta de detalle (ej: /app/citas/123)
  if (pathSegments.length === 3 && pathSegments[0] === 'app' && pathSegments[2]) {
    const basePath = `/${pathSegments[0]}/${pathSegments[1]}`
    const baseName = routePanelMap[basePath]
    if (baseName) {
      // Detectar el tipo de detalle según el módulo
      if (pathSegments[1] === 'citas') return 'Detalle de Cita'
      if (pathSegments[1] === 'consultas') return 'Detalle de Consulta'
      if (pathSegments[1] === 'mascotas') return 'Detalle de Mascota'
      if (pathSegments[1] === 'usuarios') return 'Detalle de Usuario'
      if (pathSegments[1] === 'historias') return 'Detalle de Historia Clínica'
      if (pathSegments[1] === 'inventario') return 'Detalle de Producto'
      if (pathSegments[1] === 'facturacion') return 'Detalle de Factura'
      return `Detalle de ${baseName}`
    }
  }

  // Por defecto, usar "Dashboard"
  return 'Dashboard'
}

export const TopBar = ({ title, onToggleSidebar }: TopBarProps) => {
  const location = useLocation()
  const userRoles = useSessionStore((state) => state.user?.roles ?? [])
  const isAdmin = userRoles.includes('administrador')
  
  const panelName = useMemo(() => {
    return getPanelNameFromPath(location.pathname)
  }, [location.pathname])

  return (
    <header 
      className="dashboard-header sticky top-0 z-20 flex items-center justify-between gap-4 bg-surface px-4 py-4 md:px-6"
      style={{
        boxShadow: '0 2px 8px rgba(139, 92, 246, 0.04), 0 1px 3px rgba(0, 0, 0, 0.03)',
      }}
    >
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="inline-flex items-center rounded-xl bg-[var(--color-surface-200)] p-2 text-[var(--color-muted)] transition hover:text-[var(--color-text-heading)] hover:bg-[var(--color-surface-200)]/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] md:hidden"
            style={{ boxShadow: 'var(--shadow-soft)' }}
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-muted)]">Panel</p>
            <h1 className="text-xl font-semibold text-[var(--color-text-heading)] truncate">
              {panelName}
            </h1>
          </div>
        </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <UserMenu />
      </div>
    </header>
  )
}

