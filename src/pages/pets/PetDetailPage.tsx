import { useMemo } from 'react'
import { ArrowLeft, Trash2, User, ClipboardList, FileText, Phone, Mail, PawPrint, Eye } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { PetForm } from '@/pages/pets/components/PetForm'
import { usePetDeleteMutation, usePetDetailQuery, usePetUpdateMutation } from '@/hooks/pets'
import { useConsultationsByPetQuery } from '@/hooks/consultations'
import { useHistoryByPetQuery } from '@/hooks/histories'
import { formatDateTime } from '@/utils/datetime'
import type { ConsultationSummary } from '@/api/types/consultations'

export const PetDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = usePetDetailQuery(id)
  const updateMutation = usePetUpdateMutation(id!)
  const deleteMutation = usePetDeleteMutation()

  // Obtener datos relacionados
  const { data: consultations, isLoading: consultationsLoading } = useConsultationsByPetQuery(id)
  const { data: history, isLoading: historyLoading } = useHistoryByPetQuery(id)

  // Normalizar consultas
  const normalizedConsultations: ConsultationSummary[] = Array.isArray(consultations) ? consultations : []

  // Calcular edad si hay fecha de nacimiento
  const edad = useMemo(() => {
    if (!data?.fecha_nacimiento) return null
    const birthDate = new Date(data.fecha_nacimiento)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }, [data?.fecha_nacimiento])

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1">
          <p className="text-label">Mascota</p>
          <h1 className="text-3xl font-semibold text-heading">{data.nombre}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-secondary">
            {edad !== null && (
              <>
                <span>{edad} {edad === 1 ? 'año' : 'años'}</span>
              </>
            )}
            {data.peso && (
              <>
                {edad !== null && <span>•</span>}
                <span>{data.peso} kg</span>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <Button asChild variant="ghost" startIcon={<ArrowLeft size={18} className="text-black" />}>
            <Link to="/app/mascotas">Volver</Link>
          </Button>
          <Button
            variant="danger"
            startIcon={<Trash2 size={16} />}
            disabled={deleteMutation.isPending}
            onClick={() => id && deleteMutation.mutate(id)}
          >
            {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </div>

      {/* Información del propietario */}
      {data.cliente && (
        <Card
          header={
            <div className="flex items-center gap-2">
              <User size={18} className="text-[var(--color-primary)]" />
              <p className="text-label">Propietario</p>
            </div>
          }
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[var(--color-primary)]/20 p-3 text-[var(--color-primary)]">
              <User size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[var(--color-text-heading)]">{data.cliente}</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">Propietario de {data.nombre}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Información general de la mascota */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card header={<p className="text-label">Especie</p>}>
          <div className="flex items-center gap-2">
            <PawPrint size={18} className="text-[var(--color-primary)]" />
            <p className="text-lg font-semibold text-heading">
              {typeof data.especie === 'string' ? data.especie : data.especie?.nombre ?? '—'}
            </p>
          </div>
        </Card>
        <Card header={<p className="text-label">Raza</p>}>
          <p className="text-lg font-semibold text-heading">
            {typeof data.raza === 'string' ? data.raza : data.raza?.nombre ?? '—'}
          </p>
        </Card>
        <Card header={<p className="text-label">Sexo</p>}>
          <p className="text-lg font-semibold text-heading">
            {data.sexo === 'M' ? 'Macho' : data.sexo === 'H' ? 'Hembra' : '—'}
          </p>
        </Card>
        <Card header={<p className="text-label">Fecha de nacimiento</p>}>
          <p className="text-lg font-semibold text-heading">
            {data.fecha_nacimiento
              ? new Date(data.fecha_nacimiento).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : '—'}
          </p>
        </Card>
      </section>

      {/* Formulario de edición */}
      <section className="rounded-3xl bg-surface p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
        <h2 className="mb-4 text-xl font-semibold text-heading">Editar información</h2>
        <PetForm
          mode="edit"
          initialData={data}
          onSubmit={(payload) => updateMutation.mutateAsync(payload)}
          isSubmitting={updateMutation.isPending}
        />
      </section>

      {/* Historia clínica */}
      <Card
        header={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-[var(--color-secondary)]" />
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-text-muted)] font-medium">Historia Clínica</p>
                <h3 className="mt-2 text-xl font-semibold text-[var(--color-text-heading)]">
                  Historia clínica completa
                </h3>
              </div>
            </div>
            {history && (
              <Button asChild variant="secondary" startIcon={<Eye size={16} />}>
                <Link to={`/app/historias/${history.id}`}>Ver completa</Link>
              </Button>
            )}
          </div>
        }
      >
        {historyLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="sm" />
          </div>
        ) : history ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-[var(--color-surface-200)] p-4">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Total de consultas</p>
                <p className="text-2xl font-bold text-[var(--color-text-heading)]">
                  {history.consultas?.length || 0}
                </p>
              </div>
              <div className="rounded-xl bg-[var(--color-surface-200)] p-4">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Estado de vacunación</p>
                <p className="text-lg font-semibold text-[var(--color-text-heading)]">
                  {history.estado_vacunacion_actual || 'No especificado'}
                </p>
              </div>
            </div>
            {history.propietario && (
              <div className="rounded-xl bg-[var(--color-surface-200)] p-4">
                <p className="text-xs text-[var(--color-text-muted)] mb-2">Información del propietario</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User size={16} className="text-[var(--color-primary)]" />
                    <span className="font-medium text-[var(--color-text-heading)]">
                      {history.propietario.nombre_completo}
                    </span>
                  </div>
                  {history.propietario.email && (
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                      <Mail size={16} className="text-[var(--color-muted)]" />
                      <span>{history.propietario.email}</span>
                    </div>
                  )}
                  {history.propietario.telefono && (
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                      <Phone size={16} className="text-[var(--color-muted)]" />
                      <span>{history.propietario.telefono}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {history.consultas && history.consultas.length > 0 && (
              <div className="rounded-xl bg-[var(--color-surface-200)] p-4">
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Última consulta</p>
                <p className="text-sm font-medium text-[var(--color-text-heading)]">
                  {formatDateTime(history.consultas[0].fecha_consulta)}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
            Esta mascota no tiene historia clínica registrada aún
          </p>
        )}
      </Card>

      {/* Consultas realizadas */}
      <Card
        header={
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-text-muted)] font-medium">Consultas</p>
            <h3 className="mt-2 text-xl font-semibold text-[var(--color-text-heading)]">
              Consultas realizadas ({normalizedConsultations.length})
            </h3>
          </div>
        }
      >
        {consultationsLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="sm" />
          </div>
        ) : normalizedConsultations.length > 0 ? (
          <div className="space-y-3">
            {normalizedConsultations.slice(0, 5).map((consultation: ConsultationSummary) => (
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
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Veterinario: {consultation.veterinario_nombre}
                  </p>
                </div>
                <Button asChild variant="ghost" startIcon={<Eye size={14} />}>
                  <span>Ver</span>
                </Button>
              </Link>
            ))}
            {normalizedConsultations.length > 5 && (
              <Link
                to="/app/consultas"
                className="block text-center text-sm text-[var(--color-primary)] hover:underline"
              >
                Ver todas las consultas ({normalizedConsultations.length})
              </Link>
            )}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">
            Esta mascota no tiene consultas registradas aún
          </p>
        )}
      </Card>
    </div>
  )
}
