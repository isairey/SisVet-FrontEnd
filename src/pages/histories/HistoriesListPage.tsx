import { Link } from 'react-router-dom'
import { Filter, NotebookTabs } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { HistoryCard } from '@/components/histories/HistoryCard'
import { useHistoriesQuery } from '@/hooks/histories'
import { usePetsQuery } from '@/hooks/pets'
import { usePermissions } from '@/hooks/permissions'

export const HistoriesListPage = () => {
  const [query, setQuery] = useState('')
  const [selectedPet, setSelectedPet] = useState<string>('')
  const { hasRole } = usePermissions()

  const { data: histories, isLoading } = useHistoriesQuery({
    search: query || undefined,
    mascota: selectedPet ? Number(selectedPet) : undefined,
  })

  const petFilters = useMemo(() => ({ search: '', especie: null as number | null }), [])
  const { data: pets } = usePetsQuery(petFilters)

  // El backend ya filtra automáticamente por cliente, pero solo mostramos sus mascotas en el selector
  const clientPets = useMemo(() => {
    // Si es cliente, solo mostrar sus mascotas (el backend ya las filtra)
    // Si no es cliente, mostrar todas (para admin, veterinario, etc.)
    return pets || []
  }, [pets])

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-label">Historias clínicas</p>
          <h1 className="text-3xl font-semibold text-[var(--color-text-heading)]">Seguimiento completo de pacientes</h1>
          <p className="text-description">
            {hasRole('cliente')
              ? 'Revisa el historial clínico completo de tus mascotas.'
              : 'Consulta, filtra y analiza la evolución de cada mascota en tu clínica.'}
          </p>
        </div>
        {!hasRole('cliente') && (
          <Button asChild startIcon={<NotebookTabs size={18} />}>
            <Link to="/app/consultas/nueva">Crear nueva consulta</Link>
          </Button>
        )}
      </header>

      {/* Filtros */}
      <section className="rounded-xl bg-surface p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className={`grid gap-4 ${hasRole('cliente') ? 'md:grid-cols-1' : 'md:grid-cols-2'}`}>
          <Input
            label="Buscar historia clínica"
            placeholder={hasRole('cliente') ? 'Buscar en historias de tus mascotas...' : 'Mascota o propietario...'}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {!hasRole('cliente') && (
            <label className="space-y-2 text-sm text-[var(--color-text-heading)]">
              <span className="font-medium">Mascota</span>
              <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5">
                <Filter size={16} className="text-gray-600" />
                <select
                  className="w-full bg-transparent text-gray-900 focus:outline-none"
                  value={selectedPet}
                  onChange={(event) => setSelectedPet(event.target.value)}
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

      {/* Lista de historias */}
      <section>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : histories && histories.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {histories.map((history) => (
              <HistoryCard key={history.id} history={history} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--border-subtle-color)] bg-[var(--color-surface-200)]/30 px-6 py-12 text-center">
            <NotebookTabs size={48} className="mx-auto mb-4 text-[var(--color-text-muted)] opacity-40" />
            <p className="text-[var(--color-text-secondary)] font-medium">No se encontraron historias clínicas</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Intenta ajustar los filtros de búsqueda.</p>
          </div>
        )}
      </section>
    </div>
  )
}
