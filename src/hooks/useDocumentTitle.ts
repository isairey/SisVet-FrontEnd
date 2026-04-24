import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Mapeo de rutas a nombres de paneles (mismo que en TopBar)
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

/**
 * Hook para actualizar el título del documento según la ruta actual
 */
export const useDocumentTitle = () => {
  const location = useLocation()

  useEffect(() => {
    const panelName = getPanelNameFromPath(location.pathname)
    const baseTitle = 'SGV - Sistema de Gestión Veterinaria'
    document.title = `${panelName} | ${baseTitle}`
  }, [location.pathname])
}

