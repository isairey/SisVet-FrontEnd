import { useEffect, useState } from 'react'
import { Link, Navigate, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CalendarClock, User, PawPrint, Scissors, RefreshCw, XCircle, AlertTriangle, Clock } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import {
  useAppointmentCancelMutation,
  useAppointmentDetailQuery,
  useAppointmentRescheduleMutation,
  useVeterinariansQuery,
} from '@/hooks/appointments'
import { AvailabilityPicker } from '@/pages/appointments/components/AvailabilityPicker'
import { formatDateTime, parseDateFromISO } from '@/utils/datetime'

export const AppointmentDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!id) {
    return <Navigate to="/app/citas" replace />
  }

  const { data, isLoading } = useAppointmentDetailQuery(id)
  const cancelMutation = useAppointmentCancelMutation()
  const rescheduleMutation = useAppointmentRescheduleMutation(id)
  const { data: veterinarios, isLoading: vetsLoading } = useVeterinariansQuery()
  const [selectedVet, setSelectedVet] = useState<string>('')
  const [newDateTime, setNewDateTime] = useState<string>('')
  const [activeAction, setActiveAction] = useState<'reschedule' | 'cancel'>('reschedule')

  // Inicializar el veterinario de la cita actual al cargar los datos
  useEffect(() => {
    if (data && veterinarios) {
      // Buscar el veterinario por nombre si existe
      if (data.veterinario_nombre && !selectedVet) {
        const vet = veterinarios.find(v => v.nombre === data.veterinario_nombre)
        if (vet) {
          setSelectedVet(String(vet.id))
        }
      } else if (!selectedVet && veterinarios.length > 0) {
        // Si no hay veterinario asignado, usar el primero disponible
        setSelectedVet(String(veterinarios[0].id))
      }
    }
  }, [data, selectedVet, veterinarios])

  const handleCancel = () => {
    cancelMutation.mutate(id, {
      onSuccess: () => navigate('/app/citas'),
    })
  }

  const handleReschedule = () => {
    if (!newDateTime) return
    rescheduleMutation.mutate(newDateTime, {
      onSuccess: () => {
        setNewDateTime('')
        navigate('/app/citas')
      },
    })
  }

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const getStatusBadgeTone = (estado: string): 'success' | 'info' | 'danger' | 'warning' | 'neutral' => {
    const estadoUpper = estado.toUpperCase()
    if (estadoUpper === 'COMPLETADA') return 'success'
    if (estadoUpper === 'AGENDADA') return 'info'
    if (estadoUpper === 'CANCELADA') return 'danger'
    if (estadoUpper === 'EN_PROGRESO') return 'warning'
    return 'neutral'
  }

  // Obtener la fecha inicial de la cita actual para el picker
  const initialDate = data.fecha_hora ? parseDateFromISO(data.fecha_hora) : undefined

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-label">Citas</p>
          <h1 className="text-3xl font-semibold text-[var(--color-text-heading)]">{data.mascota_nombre}</h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge tone={getStatusBadgeTone(data.estado)}>
              {data.estado}
            </Badge>
            <p className="text-sm text-[var(--color-text-secondary)]">ID {data.id}</p>
          </div>
        </div>
        <Button asChild variant="ghost" startIcon={<ArrowLeft size={16} className="text-gray-700" />}>
          <Link to="/app/citas">Volver</Link>
        </Button>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-[var(--color-primary)]/10 p-2.5 text-[var(--color-primary)]">
              <CalendarClock size={20} />
            </div>
            <p className="text-label font-medium">Fecha y hora</p>
          </div>
          <p className="text-base font-semibold text-gray-900">{formatDateTime(data.fecha_hora)}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-600">
              <PawPrint size={20} />
            </div>
            <p className="text-label font-medium">Mascota</p>
          </div>
          <p className="text-base font-semibold text-gray-900">{data.mascota_nombre}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600">
              <User size={20} />
            </div>
            <p className="text-label font-medium">Veterinario</p>
          </div>
          <p className="text-base font-semibold text-gray-900">{data.veterinario_nombre ?? 'Por asignar'}</p>
        </Card>
      </section>

      {data.servicio_nombre && (
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-100 p-2.5 text-purple-600">
              <Scissors size={20} />
            </div>
            <div>
              <p className="text-label font-medium mb-1">Servicio</p>
              <p className="text-base font-semibold text-gray-900">{data.servicio_nombre}</p>
            </div>
          </div>
        </Card>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl bg-[var(--color-primary)]/10 p-2 text-[var(--color-primary)]">
                <RefreshCw size={18} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Reagendar cita</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Selecciona el profesional y el nuevo horario disponible. Los horarios bloqueados se muestran en rojo.
            </p>
          </div>

          <div className="space-y-4">
            <label className="space-y-2 text-sm text-[var(--color-text-heading)]">
              <span className="font-medium">Veterinario</span>
              {vetsLoading ? (
                <div className="flex min-h-[42px] items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5">
                  <Spinner size="sm" />
                </div>
              ) : (
                <select
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30"
                  value={selectedVet}
                  onChange={(event) => {
                    setSelectedVet(event.target.value)
                    setNewDateTime('') // Limpiar horario seleccionado al cambiar veterinario
                  }}
                >
                  <option value="">Selecciona veterinario</option>
                  {(veterinarios ?? []).map((vet) => (
                    <option key={vet.id} value={vet.id}>
                      {vet.nombre}
                    </option>
                  ))}
                </select>
              )}
            </label>
            
            <div className="rounded-xl bg-[var(--color-surface-200)] p-4 border border-gray-200">
              <p className="text-sm font-semibold text-gray-900 mb-3">Nuevo horario</p>
              <AvailabilityPicker 
                veterinarioId={selectedVet} 
                value={newDateTime} 
                onChange={setNewDateTime}
                initialDate={initialDate}
              />
            </div>
            
            <Button
              startIcon={<RefreshCw size={16} />}
              disabled={!newDateTime || !selectedVet || rescheduleMutation.isPending}
              onClick={handleReschedule}
            >
              {rescheduleMutation.isPending ? 'Reagendando...' : 'Confirmar nuevo horario'}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl bg-red-100 p-2 text-red-600">
                <XCircle size={18} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Cancelar cita</h3>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900 mb-1">¿Seguro que quieres cancelar?</p>
                  <p className="text-sm text-red-700">
                    Notificaremos al cliente y liberaremos el horario para que otros usuarios puedan agendarlo.
                  </p>
                </div>
              </div>
            </div>
            
            <Button
              variant="danger"
              startIcon={<XCircle size={16} />}
              disabled={cancelMutation.isPending}
              onClick={handleCancel}
              className="w-full"
            >
              {cancelMutation.isPending ? 'Cancelando...' : 'Cancelar cita definitivamente'}
            </Button>
          </div>
        </Card>
      </section>
    </div>
  )
}
