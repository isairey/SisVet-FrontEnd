import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { Calendar, Filter, Stethoscope, PlusCircle, Edit, Eye } from 'lucide-react'

import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useConsultationsQuery } from '@/hooks/consultations'
import { usePetsQuery } from '@/hooks/pets'
import { formatDateTime } from '@/utils/datetime'
import { usePermissions } from '@/hooks/permissions'

export const ConsultationsListPage = () => {
  const [query, setQuery] = useState('')
  const [petFilter, setPetFilter] = useState<string>('')
  const { hasRole } = usePermissions()

  const filters = useMemo(() => ({ search: '', especie: null as number | null }), [])
  const { data: pets } = usePetsQuery(filters)

  // El backend ya filtra automáticamente por cliente, pero solo mostramos sus mascotas en el selector
  const clientPets = useMemo(() => {
    // Si es cliente, solo mostrar sus mascotas (el backend ya las filtra)
    // Si no es cliente, mostrar todas (para admin, veterinario, etc.)
    return pets || []
  }, [pets])

  const { data: consultations, isLoading } = useConsultationsQuery({
    search: query || undefined,
    mascota: petFilter ? Number(petFilter) : undefined,
  })
  
  // Solo mostrar el botón de crear consulta si no es cliente
  const canCreate = !hasRole('cliente')

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-label">Consultas</p>
          <h1 className="text-3xl font-semibold text-[var(--color-text-heading)]">Historial clínico activo</h1>
          <p className="text-description">
            {hasRole('cliente')
              ? 'Revisa las consultas de tus mascotas realizadas por nuestros veterinarios.'
              : 'Revisa y gestiona las consultas recientes de cada paciente.'}
          </p>
        </div>
        {canCreate && (
          <Button asChild startIcon={<PlusCircle size={18} />}>
            <Link to="/app/consultas/nueva">Nueva consulta</Link>
          </Button>
        )}
      </header>

      {/* Filtros */}
      <section className="rounded-xl bg-surface p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className={`grid gap-4 ${hasRole('cliente') ? 'md:grid-cols-1' : 'md:grid-cols-2'}`}>
          <Input 
            label="Buscar consulta" 
            placeholder="Mascota, diagnóstico, veterinario..." 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
          />
          {!hasRole('cliente') && (
            <label className="space-y-2 text-sm text-[var(--color-text-heading)]">
              <span className="font-medium">Mascota</span>
              <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5">
                <Filter size={16} className="text-gray-600" />
                <select
                  className="w-full bg-transparent text-gray-900 focus:outline-none"
                  value={petFilter}
                  onChange={(event) => setPetFilter(event.target.value)}
                >
                  <option value="">Todas las mascotas</option>
                  {clientPets?.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          )}
        </div>
      </section>

      {/* Lista de consultas */}
      <section>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : consultations && consultations.length > 0 ? (
          <div className="space-y-4">
            {consultations.map((consultation) => (
              <Card
                key={consultation.id}
                className="p-5 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="rounded-xl bg-[var(--color-primary)]/10 p-2.5 text-[var(--color-primary)] flex-shrink-0">
                      <Stethoscope size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-1">Consulta #{consultation.id}</p>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{consultation.mascota_nombre}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="flex items-center gap-1.5 text-gray-600">
                          <Calendar size={14} className="text-gray-500" />
                          {formatDateTime(consultation.fecha_consulta)}
                        </span>
                        <span className="text-gray-600">
                          {consultation.veterinario_nombre}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-gray-700 line-clamp-2">{consultation.diagnostico}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 md:ml-6">
                    {/* Estado con colores mejorados */}
                    {consultation.estado_vacunacion === 'AL_DIA' && (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-800 border border-green-200">
                        {consultation.estado_vacunacion}
                      </span>
                    )}
                    {consultation.estado_vacunacion === 'PENDIENTE' && (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-800 border border-yellow-200">
                        {consultation.estado_vacunacion}
                      </span>
                    )}
                    {consultation.estado_vacunacion === 'EN_PROCESO' && (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-800 border border-blue-200">
                        {consultation.estado_vacunacion}
                      </span>
                    )}
                    {!['AL_DIA', 'PENDIENTE', 'EN_PROCESO'].includes(consultation.estado_vacunacion) && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-800 border border-gray-200">
                        {consultation.estado_vacunacion}
                      </span>
                    )}
                    
                    {/* Botones de acceso con colores */}
                    {!hasRole('cliente') && (
                      <Button 
                        asChild 
                        variant="ghost"
                        className="text-blue-600 border border-blue-200 hover:bg-blue-50"
                        startIcon={<Edit size={16} />}
                      >
                        <Link to={`/app/consultas/${consultation.id}/editar`}>
                          Editar consulta
                        </Link>
                      </Button>
                    )}
                    <Button 
                      asChild 
                      variant="ghost"
                      className="text-[var(--color-secondary)] border border-[var(--color-secondary)]/30 hover:bg-[var(--color-secondary)]/10"
                      startIcon={<Eye size={16} />}
                    >
                      <Link to={`/app/consultas/${consultation.id}`}>Ver detalle</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--border-subtle-color)] bg-[var(--color-surface-200)]/30 px-6 py-12 text-center">
            <Stethoscope size={48} className="mx-auto mb-4 text-[var(--color-text-muted)] opacity-40" />
            <p className="text-[var(--color-text-secondary)] font-medium">No se encontraron consultas</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Intenta ajustar los filtros de búsqueda.</p>
          </div>
        )}
      </section>
    </div>
  )
}
