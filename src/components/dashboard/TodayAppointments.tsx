import { Link } from 'react-router-dom'
import { CalendarDays, Clock } from 'lucide-react'
import { useMemo } from 'react'
import dayjs from 'dayjs'

import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { useAppointmentsQuery } from '@/hooks/appointments'
import type { AppointmentSummary } from '@/api/types/appointments'
import { formatDateTime } from '@/utils/datetime'

export const TodayAppointments = () => {
  const { data: appointments, isLoading: appointmentsLoading } = useAppointmentsQuery()

  // Filtrar citas de hoy
  const todayAppointments = useMemo(() => {
    if (!appointments || appointments.length === 0) return []
    const today = dayjs().startOf('day')
    return appointments.filter((app: AppointmentSummary) => {
      const appointmentDate = dayjs(app.fecha_hora).startOf('day')
      return appointmentDate.isSame(today)
    })
  }, [appointments])

  return (
    <Card
      className="transition-shadow duration-500"
      style={{
        transition: 'box-shadow 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.setProperty('box-shadow', 'var(--shadow-card-hover)')
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.setProperty('box-shadow', 'var(--shadow-card)')
      }}
      header={
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-text-muted)] font-medium">Agenda</p>
          <h3 className="mt-2 text-xl font-semibold text-[var(--color-text-heading)]">Citas de hoy</h3>
        </div>
      }
    >
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {appointmentsLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="sm" />
          </div>
        ) : todayAppointments.length > 0 ? (
          todayAppointments.slice(0, 5).map((app: AppointmentSummary) => (
            <Link
              key={app.id}
              to={`/app/citas/${app.id}`}
              className="flex items-center gap-3 rounded-lg bg-[var(--color-surface-200)] p-3 transition-all duration-200 hover:bg-[var(--color-surface-200)]/80"
            >
              <div className="rounded-lg bg-[var(--color-primary)]/20 p-2 text-[var(--color-primary)]">
                <Clock size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-heading)] truncate">
                  {app.mascota_nombre}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {formatDateTime(app.fecha_hora)}
                </p>
                {app.servicio_nombre && (
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    {app.servicio_nombre}
                  </p>
                )}
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-[var(--color-surface)] text-[var(--color-text-secondary)]">
                {app.estado}
              </span>
            </Link>
          ))
        ) : (
          <p className="text-sm text-center text-[var(--color-text-muted)] py-8">
            No hay citas programadas para hoy
          </p>
        )}
      </div>
      {todayAppointments.length > 5 && (
        <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border-subtle-color)' }}>
          <Link
            to="/app/citas"
            className="text-sm text-[var(--color-primary)] hover:underline font-medium"
          >
            Ver todas las citas ({todayAppointments.length})
          </Link>
        </div>
      )}
    </Card>
  )
}

