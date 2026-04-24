import { useState } from 'react'
import { Heart, Dog, Cat, PlusCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useSpeciesQuery, useBreedsQuery, useSpeciesCreateMutation, useBreedCreateMutation } from '@/hooks/pets/usePets'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const speciesSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
})

const breedSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
})

type SpeciesFormValues = z.infer<typeof speciesSchema>
type BreedFormValues = z.infer<typeof breedSchema>

export const SpeciesBreedsConfigTab = () => {
  const [selectedSpecies, setSelectedSpecies] = useState<number | null>(null)
  const { data: species, isLoading: speciesLoading } = useSpeciesQuery()
  const { data: breeds, isLoading: breedsLoading } = useBreedsQuery(selectedSpecies || undefined)
  
  const createSpeciesModal = useDisclosure()
  const createBreedModal = useDisclosure()

  const speciesForm = useForm<SpeciesFormValues>({
    resolver: zodResolver(speciesSchema),
    defaultValues: { nombre: '' },
  })

  const breedForm = useForm<BreedFormValues>({
    resolver: zodResolver(breedSchema),
    defaultValues: { nombre: '' },
  })

  const createSpeciesMutation = useSpeciesCreateMutation()
  const createBreedMutation = useBreedCreateMutation()

  const handleCreateSpecies = async (values: SpeciesFormValues) => {
    try {
      await createSpeciesMutation.mutateAsync({ nombre: values.nombre })
      speciesForm.reset()
      createSpeciesModal.close()
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleCreateBreed = async (values: BreedFormValues) => {
    if (!selectedSpecies) return
    try {
      await createBreedMutation.mutateAsync({ nombre: values.nombre, especie: selectedSpecies })
      breedForm.reset()
      createBreedModal.close()
    } catch (error) {
      // Error handled by mutation
    }
  }

  const selectedSpeciesName = species?.find((s) => s.id === selectedSpecies)?.nombre

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-text-heading)]">Especies y Razas</h2>
          <p className="text-sm text-[var(--color-text-muted)]">Gestiona las especies y razas disponibles en el sistema</p>
        </div>
        <Button startIcon={<PlusCircle size={16} />} onClick={createSpeciesModal.open}>
          Nueva Especie
        </Button>
      </div>

      {speciesLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : species && species.length > 0 ? (
        <div className="space-y-6">
          {/* Lista de Especies - Vista Tabla */}
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-text-heading)] mb-4">Especies</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left">
                <thead>
                  <tr className="text-sm uppercase tracking-wide text-subtle">
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle-color)' }}>
                  {species.map((specie) => (
                    <tr
                      key={specie.id}
                      className={`text-sm text-secondary hover:bg-[var(--color-surface-200)]/50 transition-colors cursor-pointer ${
                        selectedSpecies === specie.id ? 'bg-[var(--color-primary)]/5' : ''
                      }`}
                      onClick={() => setSelectedSpecies(selectedSpecies === specie.id ? null : specie.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                            <Heart size={16} />
                          </div>
                          <span className="font-semibold text-heading">{specie.nombre}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium ${
                          selectedSpecies === specie.id 
                            ? 'text-[var(--color-primary)]' 
                            : 'text-[var(--color-text-heading)]'
                        }`}>
                          {selectedSpecies === specie.id ? '▼ Ocultar razas' : '▶ Ver razas'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lista de Razas para la especie seleccionada - Vista Tabla */}
          {selectedSpecies && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--color-text-heading)]">
                  Razas - {selectedSpeciesName}
                </h3>
                <button
                  onClick={createBreedModal.open}
                  className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle-color)] bg-[var(--color-surface-200)] px-4 py-2 text-sm font-semibold text-[#2D2D2D] hover:bg-[var(--color-surface)] transition-colors"
                >
                  <PlusCircle size={16} className="text-black" />
                  Nueva Raza
                </button>
              </div>
              {breedsLoading ? (
                <div className="flex justify-center py-10">
                  <Spinner size="lg" />
                </div>
              ) : breeds && breeds.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left">
                    <thead>
                      <tr className="text-sm uppercase tracking-wide text-subtle">
                        <th className="px-4 py-3">Nombre</th>
                        <th className="px-4 py-3">Especie</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle-color)' }}>
                      {breeds.map((breed) => (
                        <tr
                          key={breed.id}
                          className="text-sm text-secondary hover:bg-[var(--color-surface-200)]/50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-[var(--color-surface-200)]">
                                {breed.especie.nombre.toLowerCase().includes('perro') ? (
                                  <Dog size={16} className="text-[var(--color-text-secondary)]" />
                                ) : (
                                  <Cat size={16} className="text-[var(--color-text-secondary)]" />
                                )}
                              </div>
                              <span className="font-semibold text-heading">{breed.nombre}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[var(--color-text-secondary)]">{breed.especie.nombre}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--color-text-muted)] rounded-xl bg-surface p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
                  <p>No hay razas registradas para esta especie</p>
                  <button
                    onClick={createBreedModal.open}
                    className="mt-4 flex items-center gap-2 rounded-lg border border-[var(--border-subtle-color)] bg-[var(--color-surface-200)] px-4 py-2 text-sm font-semibold text-[#2D2D2D] hover:bg-[var(--color-surface)] transition-colors"
                  >
                    <PlusCircle size={16} className="text-black" />
                    Crear primera raza
                  </button>
                </div>
              )}
            </div>
          )}

          {!selectedSpecies && (
            <div className="text-center py-8 text-[var(--color-text-muted)] rounded-xl bg-surface p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
              <p>Selecciona una especie para ver y gestionar sus razas</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-10 text-[var(--color-text-muted)] rounded-xl bg-surface p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
          <Heart size={48} className="mx-auto mb-4 opacity-40" />
          <p>No hay especies registradas</p>
          <Button 
            className="mt-4" 
            startIcon={<PlusCircle size={16} />} 
            onClick={createSpeciesModal.open}
          >
            Crear primera especie
          </Button>
        </div>
      )}

      {/* Modal Crear Especie */}
      <Modal isOpen={createSpeciesModal.isOpen} onClose={createSpeciesModal.close} title="Nueva Especie" size="md">
        <form onSubmit={speciesForm.handleSubmit(handleCreateSpecies)} className="space-y-4">
          <Input
            label="Nombre de la Especie"
            placeholder="Ej: Perro, Gato, Conejo"
            {...speciesForm.register('nombre')}
            error={speciesForm.formState.errors.nombre?.message}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={createSpeciesModal.close}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createSpeciesMutation.isPending}>
              {createSpeciesMutation.isPending ? 'Creando...' : 'Crear Especie'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Crear Raza */}
      <Modal isOpen={createBreedModal.isOpen} onClose={createBreedModal.close} title={`Nueva Raza - ${selectedSpeciesName || ''}`} size="md">
        <form onSubmit={breedForm.handleSubmit(handleCreateBreed)} className="space-y-4">
          <Input
            label="Nombre de la Raza"
            placeholder="Ej: Labrador, Siames, Persa"
            {...breedForm.register('nombre')}
            error={breedForm.formState.errors.nombre?.message}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={createBreedModal.close}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createBreedMutation.isPending || !selectedSpecies}>
              {createBreedMutation.isPending ? 'Creando...' : 'Crear Raza'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
