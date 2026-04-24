import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ShieldBan, ShieldCheck, Trash2, PawPrint, Calendar, ClipboardList, Eye } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { RoleBadge } from '@/components/ui/RoleBadge'
import { UserForm } from '@/pages/users/components/UserForm'
import {
  useUserActionMutation,
  useUserDeleteMutation,
  useUserDetailQuery,
  useUserUpdateMutation,
} from '@/hooks/users'
import type { UserUpdatePayload } from '@/api/types/users'
import type { AppointmentSummary } from '@/api/types/appointments'
import type { ConsultationSummary } from '@/api/types/consultations'
import { usePetsQuery } from '@/hooks/pets'
import { useAppointmentsQuery } from '@/hooks/appointments'
import { useConsultationsQuery } from '@/hooks/consultations'
import { formatDateTime } from '@/utils/datetime'

export const UserDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useUserDetailQuery(id)
  const updateMutation = useUserUpdateMutation(id!)
  const deleteMutation = useUserDeleteMutation()
  const activateMutation = useUserActionMutation('activate')
  const suspendMutation = useUserActionMutation('suspend')

  // Obtener todas las mascotas, citas y consultas para filtrar
  const { data: allPets, isLoading: petsLoading } = usePetsQuery({ search: '', especie: null })
  const { data: allAppointments, isLoading: appointmentsLoading } = useAppointmentsQuery()
  const { data: allConsultations, isLoading: consultationsLoading } = useConsultationsQuery({})

  // Los servicios ya normalizan los datos, así que asumimos que son arrays
  const normalizedAppointments: AppointmentSummary[] = Array.isArray(allAppointments) ? allAppointments : []
  const normalizedConsultations: ConsultationSummary[] = Array.isArray(allConsultations) ? allConsultations : []

  // Filtrar datos relacionados
  const userPets = useMemo(() => {
    if (!allPets || !data?.perfil_cliente) return []
    // Filtrar mascotas por cliente - el campo cliente es el nombre completo del propietario
    const userFullName = `${data.nombre} ${data.apellido}`.trim()
    return allPets.filter((pet) => {
      if (typeof pet.cliente === 'string') {
        return pet.cliente === userFullName
      }
      return false
    })
  }, [allPets, data?.perfil_cliente, data?.nombre, data?.apellido])

  const userAppointments = useMemo(() => {
    if (!normalizedAppointments.length || !userPets.length) return []
    const petIdsSet = new Set(userPets.map((pet) => pet.id))
    return normalizedAppointments.filter((appointment: AppointmentSummary) => petIdsSet.has(appointment.mascota))
  }, [normalizedAppointments, userPets])

  const userConsultations = useMemo(() => {
    if (!normalizedConsultations.length || !userPets.length) return []
    // Filtrar consultas por mascota - las consultas tienen mascota_nombre, así que comparamos por nombre
    return normalizedConsultations.filter((consultation: ConsultationSummary) =>
      userPets.some((pet) => pet.nombre === consultation.mascota_nombre)
    )
  }, [normalizedConsultations, userPets])

  const initialValues = useMemo(() => {
    if (!data) return undefined
    return {
      nombre: data.nombre,
      apellido: data.apellido,
      email: data.email,
      username: data.username,
      estado: data.estado,
      roles: data.roles.map((rol) => rol.nombre),
      telefono: data.perfil_cliente?.telefono ?? '',
      direccion: data.perfil_cliente?.direccion ?? '',
      licencia: data.perfil_veterinario?.licencia ?? '',
      especialidad: data.perfil_veterinario?.especialidad ?? '',
    }
  }, [data])

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const isSuspendPending = suspendMutation.isPending && suspendMutation.variables === id
  const isActivatePending = activateMutation.isPending && activateMutation.variables === id
  const hasClientProfile = Boolean(data.perfil_cliente)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-label">Usuario</p>
          <h1 className="text-3xl font-semibold text-heading">{data.nombre} {data.apellido}</h1>
          <div className="mt-2 flex items-center gap-3 text-sm text-secondary">
            <span>{data.email}</span>
            <span>•</span>
            <StatusBadge status={data.estado} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="ghost" startIcon={<ArrowLeft size={18} className="text-[var(--color-text-heading)]" />}>
            <Link to="/app/usuarios">Volver</Link>
          </Button>
          {data.estado !== 'activo' ? (
            <Button
              variant="secondary"
              startIcon={<ShieldCheck size={16} />}
              disabled={isActivatePending}
              onClick={() => activateMutation.mutate(id!)}
            >
              {isActivatePending ? 'Activando...' : 'Activar'}
            </Button>
          ) : (
            <Button
              variant="danger"
              startIcon={<ShieldBan size={16} />}
              disabled={isSuspendPending}
              onClick={() => suspendMutation.mutate(id!)}
            >
              {isSuspendPending ? 'Suspendiendo...' : 'Suspender'}
            </Button>
          )}
        </div>
      </div>

      <section className="rounded-3xl bg-surface p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
        <h2 className="mb-4 text-xl font-semibold text-heading">Información general</h2>
        <UserForm
          mode="edit"
          initialValues={initialValues}
          onSubmit={(payload) => updateMutation.mutateAsync(payload as UserUpdatePayload)}
          isSubmitting={updateMutation.isPending}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card header={<p className="text-label">Roles</p>}>
          <div className="flex flex-wrap gap-2">
            {data.roles.map((rol) => (
              <RoleBadge key={rol.id} role={rol.nombre} />
            ))}
          </div>
        </Card>
        {data.perfil_cliente && (
          <Card header={<p className="text-label">Perfil Cliente</p>}>
            <div className="space-y-2 text-sm text-secondary">
              <p>Teléfono: {data.perfil_cliente.telefono ?? '—'}</p>
              <p>Dirección: {data.perfil_cliente.direccion ?? '—'}</p>
            </div>
          </Card>
        )}
        {data.perfil_veterinario && (
          <Card header={<p className="text-label">Perfil Veterinario</p>}>
            <div className="space-y-2 text-sm text-secondary">
              <p>Licencia: {data.perfil_veterinario.licencia ?? '—'}</p>
              <p>Especialidad: {data.perfil_veterinario.especialidad ?? '—'}</p>
            </div>
          </Card>
        )}
      </section>

      {/* Información relacionada - Solo para usuarios con perfil de cliente */}
      {hasClientProfile && (
        <div className="space-y-6">
          {/* Mascotas del usuario */}
          <Card
            header={
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-text-muted)] font-medium">Mascotas</p>
                  <h3 className="mt-2 text-xl font-semibold text-[var(--color-text-heading)]">
                    Mascotas registradas ({userPets.length})
                  </h3>
                </div>
              </div>
            }
          >
            {petsLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size="sm" />
              </div>
            ) : userPets.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {userPets.map((pet) => (
                  <Link
                    key={pet.id}
                    to={`/app/mascotas/${pet.id}`}
                    className="group rounded-xl bg-[var(--color-surface-200)] p-4 transition-all hover:bg-[var(--color-surface-200)]/80"
                    style={{ boxShadow: 'var(--shadow-soft)' }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-[var(--color-primary)]/20 p-2.5 text-[var(--color-primary)]">
                        <PawPrint size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[var(--color-text-heading)] group-hover:text-[var(--color-primary)] transition-colors">
                          {pet.nombre}
                        </h4>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                          {typeof pet.especie === 'object' ? pet.especie?.nombre : pet.especie || 'Sin especie'}
                          {pet.raza && ` • ${typeof pet.raza === 'object' ? pet.raza?.nombre : pet.raza}`}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
                Este usuario no tiene mascotas registradas
              </p>
            )}
          </Card>

          {/* Citas del usuario */}
          <Card
            header={
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-text-muted)] font-medium">Citas</p>
                <h3 className="mt-2 text-xl font-semibold text-[var(--color-text-heading)]">
                  Citas agendadas ({userAppointments.length})
                </h3>
              </div>
            }
          >
            {appointmentsLoading || !allAppointments ? (
              <div className="flex justify-center py-8">
                <Spinner size="sm" />
              </div>
            ) : userAppointments.length > 0 ? (
              <div className="space-y-3">
                {userAppointments.slice(0, 5).map((appointment: AppointmentSummary) => (
                  <Link
                    key={appointment.id}
                    to={`/app/citas/${appointment.id}`}
                    className="flex items-center gap-4 rounded-xl bg-[var(--color-surface-200)] p-4 transition-all hover:bg-[var(--color-surface-200)]/80"
                    style={{ boxShadow: 'var(--shadow-soft)' }}
                  >
                    <div className="rounded-lg bg-[var(--color-secondary)]/20 p-2.5 text-[var(--color-secondary)]">
                      <Calendar size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-[var(--color-text-heading)]">{appointment.mascota_nombre}</h4>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                        {formatDateTime(appointment.fecha_hora)}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        {appointment.servicio_nombre || 'Sin servicio'}
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize"
                      style={{
                        backgroundColor: appointment.estado === 'COMPLETADA' ? '#D1FAE5' : 
                                       appointment.estado === 'CANCELADA' ? '#FEE2E2' :
                                       appointment.estado === 'EN_PROGRESO' ? '#DBEAFE' : '#E0E7FF',
                        color: appointment.estado === 'COMPLETADA' ? '#065F46' : 
                               appointment.estado === 'CANCELADA' ? '#991B1B' :
                               appointment.estado === 'EN_PROGRESO' ? '#1E40AF' : '#3730A3',
                        borderColor: appointment.estado === 'COMPLETADA' ? '#A7F3D0' : 
                                    appointment.estado === 'CANCELADA' ? '#FECACA' :
                                    appointment.estado === 'EN_PROGRESO' ? '#BFDBFE' : '#C7D2FE',
                      }}
                    >
                      {appointment.estado.toLowerCase().replace('_', ' ')}
                    </span>
                  </Link>
                ))}
                {userAppointments.length > 5 && (
                  <Link
                    to="/app/citas"
                    className="block text-center text-sm text-[var(--color-primary)] hover:underline"
                  >
                    Ver todas las citas ({userAppointments.length})
                  </Link>
                )}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
                Este usuario no tiene citas agendadas
              </p>
            )}
          </Card>

          {/* Consultas del usuario */}
          <Card
            header={
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-text-muted)] font-medium">Consultas</p>
                <h3 className="mt-2 text-xl font-semibold text-[var(--color-text-heading)]">
                  Consultas realizadas ({userConsultations.length})
                </h3>
              </div>
            }
          >
            {consultationsLoading || !allConsultations ? (
              <div className="flex justify-center py-8">
                <Spinner size="sm" />
              </div>
            ) : userConsultations.length > 0 ? (
              <div className="space-y-3">
                {userConsultations.slice(0, 5).map((consultation: ConsultationSummary) => (
                  <Link
                    key={consultation.id}
                    to={`/app/consultas/${consultation.id}`}
                    className="flex items-center gap-4 rounded-xl bg-[var(--color-surface-200)] p-4 transition-all hover:bg-[var(--color-surface-200)]/80"
                    style={{ boxShadow: 'var(--shadow-soft)' }}
                  >
                    <div className="rounded-lg bg-[var(--color-accent-pink)]/20 p-2.5 text-[var(--color-accent-pink)]">
                      <ClipboardList size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-[var(--color-text-heading)]">{consultation.mascota_nombre}</h4>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                        {formatDateTime(consultation.fecha_consulta)}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-1">
                        {consultation.diagnostico || 'Sin diagnóstico'}
                      </p>
                    </div>
                    <Button asChild variant="ghost" startIcon={<Eye size={14} />}>
                      <span>Ver</span>
                    </Button>
                  </Link>
                ))}
                {userConsultations.length > 5 && (
                  <Link
                    to="/app/consultas"
                    className="block text-center text-sm text-[var(--color-primary)] hover:underline"
                  >
                    Ver todas las consultas ({userConsultations.length})
                  </Link>
                )}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
                Este usuario no tiene consultas realizadas
              </p>
            )}
          </Card>
        </div>
      )}

      <section className="rounded-3xl bg-surface p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
        <h3 className="text-lg font-semibold text-red-600">Zona peligrosa</h3>
        <p className="text-sm text-red-600/80">
          Eliminar al usuario realiza un <em>soft delete</em> en el backend y no se puede recuperar desde la interfaz.
        </p>
        <Button
          variant="ghost"
          startIcon={<Trash2 size={16} />}
          className="mt-4 text-red-300 hover:text-red-100"
          disabled={deleteMutation.isPending}
          onClick={() => id && deleteMutation.mutate(id)}
        >
          {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar usuario'}
        </Button>
      </section>
    </div>
  )
}
