import { Link } from 'react-router-dom'
import { useState, useMemo } from 'react'
import { CalendarDays, PlusCircle, Stethoscope, Filter, ArrowUpDown } from 'lucide-react'
import clsx from 'clsx'

import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useAppointmentsQuery } from '@/hooks/appointments'
import type { AppointmentSummary } from '@/api/types/appointments'
import { formatDateTime } from '@/utils/datetime'
import { usePermissions } from '@/hooks/permissions'

type TimeFilter = 'todas' | 'hoy' | 'esta_semana' | 'este_mes'
type SortOrder = 'fecha_asc' | 'fecha_desc' | 'mascota_asc' | 'mascota_desc'

export const AppointmentsPage = () => {
  const { data, isLoading } = useAppointmentsQuery()
  const { checkPermission } = usePermissions()
  const canCreate = checkPermission('citas', 'canCreate')
  const canCreateConsulta = checkPermission('consultas', 'canCreate')

  // Estados para filtros
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('todas')
  const [estadoFilter, setEstadoFilter] = useState<string>('todos')
  const [sortOrder, setSortOrder] = useState<SortOrder>('fecha_asc')

  // Función para obtener el rango de fechas según el filtro
  const getDateRange = (filter: TimeFilter) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (filter) {
      case 'hoy':
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        }
      case 'esta_semana':
        const dayOfWeek = now.getDay()
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - dayOfWeek)
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        endOfWeek.setHours(23, 59, 59, 999)
        return { start: startOfWeek, end: endOfWeek }
      case 'este_mes':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
        return { start: startOfMonth, end: endOfMonth }
      default:
        return null
    }
  }

  // Filtrar y ordenar citas
  const filteredAndSortedData = useMemo(() => {
    if (!data) return []

    let filtered = [...data]

    // Filtro por tiempo
    if (timeFilter !== 'todas') {
      const dateRange = getDateRange(timeFilter)
      if (dateRange) {
        filtered = filtered.filter((cita) => {
          const citaDate = new Date(cita.fecha_hora)
          return citaDate >= dateRange.start && citaDate <= dateRange.end
        })
      }
    }

    // Filtro por estado
    if (estadoFilter !== 'todos') {
      filtered = filtered.filter((cita) => cita.estado === estadoFilter)
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'fecha_asc':
          return new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime()
        case 'fecha_desc':
          return new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime()
        case 'mascota_asc':
          return a.mascota_nombre.localeCompare(b.mascota_nombre)
        case 'mascota_desc':
          return b.mascota_nombre.localeCompare(a.mascota_nombre)
        default:
          return 0
      }
    })

    return filtered
  }, [data, timeFilter, estadoFilter, sortOrder])

  // Obtener estados únicos para el filtro
  const estadosUnicos = useMemo(() => {
    if (!data) return []
    return Array.from(new Set(data.map((cita) => cita.estado))).sort()
  }, [data])

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-label">Citas</p>
          <h1 className="text-3xl font-semibold text-heading">Agenda general</h1>
          <p className="text-description">Visualiza las próximas citas y accede rápidamente a su detalle.</p>
        </div>
        {canCreate && (
          <Button startIcon={<PlusCircle size={18} />} asChild>
            <Link to="/app/citas/nueva">Nueva cita</Link>
          </Button>
        )}
      </header>

      {/* Filtros y ordenamiento */}
      <section className="rounded-3xl bg-surface p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="mb-6 space-y-4">
          {/* Filtros por tiempo */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text-heading)]">
              <Filter size={16} className="mr-2 inline" />
              Filtrar por tiempo
            </label>
            <div className="flex flex-wrap gap-2">
              {(['todas', 'hoy', 'esta_semana', 'este_mes'] as TimeFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={clsx(
                    'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                    timeFilter === filter
                      ? 'bg-[var(--color-primary)] text-white shadow-md'
                      : 'bg-[var(--color-surface-200)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)]'
                  )}
                >
                  {filter === 'todas' && 'Todas'}
                  {filter === 'hoy' && 'Hoy'}
                  {filter === 'esta_semana' && 'Esta semana'}
                  {filter === 'este_mes' && 'Este mes'}
                </button>
              ))}
            </div>
          </div>

          {/* Filtros por estado y ordenamiento */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text-heading)]">
                Filtrar por estado
              </label>
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                className="w-full rounded-lg border border-[var(--border-subtle-color)] bg-[var(--color-surface-200)] px-4 py-2 text-sm text-[var(--color-text-primary)] transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                style={{ borderWidth: 'var(--border-subtle-width)' }}
              >
                <option value="todos">Todos los estados</option>
                {estadosUnicos.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--color-text-heading)]">
                <ArrowUpDown size={16} className="mr-2 inline" />
                Ordenar por
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="w-full rounded-lg border border-[var(--border-subtle-color)] bg-[var(--color-surface-200)] px-4 py-2 text-sm text-[var(--color-text-primary)] transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                style={{ borderWidth: 'var(--border-subtle-width)' }}
              >
                <option value="fecha_asc">Fecha (más antiguas primero)</option>
                <option value="fecha_desc">Fecha (más recientes primero)</option>
                <option value="mascota_asc">Mascota (A-Z)</option>
                <option value="mascota_desc">Mascota (Z-A)</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-surface p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner size="lg" />
          </div>
        ) : filteredAndSortedData && filteredAndSortedData.length > 0 ? (
          <div className="space-y-0">
            {filteredAndSortedData.map((cita: AppointmentSummary, index: number) => (
              <div
                key={cita.id}
                className={`flex flex-col gap-4 p-5 transition-colors hover:bg-[var(--color-surface-200)]/50 md:flex-row md:items-center md:justify-between ${index > 0 ? 'border-t border-[var(--border-subtle-color)]' : ''}`}
                style={index > 0 ? { borderTopWidth: 'var(--border-subtle-width)' } : {}}
              >
                {/* Información principal - Izquierda */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex-shrink-0 rounded-xl bg-[var(--color-primary)]/10 p-3 text-[var(--color-primary)]">
                    <CalendarDays size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-[var(--color-text-heading)] mb-1">
                      {cita.mascota_nombre}
                    </h3>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-[var(--color-text-primary)]">
                        {formatDateTime(cita.fecha_hora)}
                      </p>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {cita.servicio_nombre ?? 'Sin servicio asignado'}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-xs text-[var(--color-text-tertiary)]">Veterinario:</span>
                        <span className="text-sm font-medium text-[var(--color-text-primary)]">
                          {cita.veterinario_nombre ?? 'Por asignar'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detalles y acciones - Derecha */}
                <div className="flex flex-col items-start gap-3 md:items-end md:flex-shrink-0 md:min-w-[280px]">
                  {/* Estado arriba */}
                  <div className="w-full md:w-auto md:text-right">
                    {cita.estado === 'COMPLETADA' && (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-800 border border-green-200">
                        {cita.estado}
                      </span>
                    )}

                    {cita.estado === 'AGENDADA' && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-800 border border-blue-200">
                        {cita.estado}
                      </span>
                    )}

                    {cita.estado === 'CANCELADA' && (
                      <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-red-800 border border-red-200">
                        {cita.estado}
                      </span>
                    )}

                    {cita.estado === 'EN_PROGRESO' && (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-800 border border-yellow-200">
                        {cita.estado}
                      </span>
                    )}

                    {!['COMPLETADA', 'AGENDADA', 'CANCELADA', 'EN_PROGRESO'].includes(cita.estado) && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-800 border border-gray-200">
                        {cita.estado}
                      </span>
                    )}
                  </div>

                  {/* Acciones abajo */}
                  <div className="flex items-center gap-2 w-full md:w-auto md:justify-end">
                    {!['CANCELADA', 'COMPLETADA'].includes(cita.estado.toUpperCase()) && canCreateConsulta && (
                      <Button 
                        asChild 
                        variant="ghost" 
                        className="text-blue-600 border border-blue-200 hover:bg-blue-50 flex-1 md:flex-initial"
                        title="Generar Consulta"
                      >
                        <Link 
                          to={`/app/consultas/nueva?mascota=${cita.mascota}&servicio=${cita.servicio}&cita=${cita.id}&nombre_servicio=${encodeURIComponent(cita.servicio_nombre || '')}`}
                        >
                          <Stethoscope size={16} className="mr-2"/>
                          Atender
                        </Link>
                      </Button>
                    )}
              
                    <Button asChild variant="ghost" className="flex-1 md:flex-initial">
                      <Link to={`/app/citas/${cita.id}`}>Ver detalle</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border-subtle-color)] px-6 py-12 text-center text-secondary" style={{ borderWidth: 'var(--border-subtle-width)', borderStyle: 'dashed' }}>
            No hay citas que coincidan con los filtros seleccionados.
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--border-subtle-color)] px-6 py-12 text-center text-secondary" style={{ borderWidth: 'var(--border-subtle-width)', borderStyle: 'dashed' }}>
            No hay citas registradas por ahora.
          </div>
        )}
      </section>
    </div>
  )
}
