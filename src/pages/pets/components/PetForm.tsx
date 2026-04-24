import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { useBreedsQuery, useSpeciesQuery } from '@/hooks/pets'
import type { Pet, PetPayload } from '@/api/types/pets'

const sexOptions = [
  { label: 'Macho', value: 'M' },
  { label: 'Hembra', value: 'H' },
]

export const formatPetSex = (sexo: string | undefined | null): string => {
  if (sexo === 'M') return 'Macho'
  if (sexo === 'H') return 'Hembra'
  return sexo ?? '—'
}

const schema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido'),
  sexo: z.enum(['M', 'H'], { message: 'Selecciona el sexo' }),
  especieId: z.union([z.number(), z.literal('')]),
  razaId: z.union([z.number(), z.literal('')]),
  fecha_nacimiento: z.string().optional(),
  peso: z.string().optional(),
})

type PetFormValues = z.infer<typeof schema>

interface PetFormProps {
  mode: 'create' | 'edit'
  initialData?: Pet
  onSubmit: (payload: PetPayload) => Promise<unknown> | unknown
  isSubmitting?: boolean
}

export const PetForm = ({ mode, initialData, onSubmit, isSubmitting }: PetFormProps) => {
  const { data: species, isLoading: speciesLoading } = useSpeciesQuery()

  // Encontrar el ID de especie desde initialData (puede venir como string nombre o objeto Species)
  const initialEspecieId = useMemo(() => {
    if (!initialData?.especie || !species) return undefined
    if (typeof initialData.especie === 'string') {
      const found = species.find((s) => s.nombre === initialData.especie)
      return found?.id
    }
    if (typeof initialData.especie === 'object' && 'id' in initialData.especie) {
      return initialData.especie.id
    }
    return undefined
  }, [initialData?.especie, species])

  const form = useForm<PetFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: initialData?.nombre ?? '',
      sexo: (initialData?.sexo === 'M' || initialData?.sexo === 'H' ? initialData.sexo : sexOptions[0].value) as 'M' | 'H',
      especieId: initialEspecieId ?? ('' as const),
      razaId: '' as const,
      fecha_nacimiento: initialData?.fecha_nacimiento ?? '',
      peso: initialData?.peso ? String(initialData.peso) : '',
    },
  })

  const selectedSpecies = form.watch('especieId')

  useEffect(() => {
    // Reset breed when species changes
    if (selectedSpecies !== initialEspecieId) {
      form.setValue('razaId', '' as const)
    }
  }, [selectedSpecies, form, initialEspecieId])

  // Cargar razas cuando se selecciona una especie
  const speciesIdNumber = typeof selectedSpecies === 'number' ? selectedSpecies : undefined
  const { data: breeds, isLoading: breedsLoading } = useBreedsQuery(speciesIdNumber)

  // Encontrar el ID de raza cuando ya tenemos las razas cargadas
  useEffect(() => {
    if (initialData?.raza && breeds && speciesIdNumber) {
      let razaId: number | undefined
      if (typeof initialData.raza === 'string') {
        const found = breeds.find((r) => r.nombre === initialData.raza)
        razaId = found?.id
      } else if (typeof initialData.raza === 'object' && 'id' in initialData.raza) {
        razaId = initialData.raza.id
      }
      if (razaId) {
        form.setValue('razaId', razaId)
      }
    }
  }, [initialData?.raza, breeds, speciesIdNumber, form])

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload: PetPayload = {
      nombre: values.nombre.trim(),
      sexo: values.sexo,
      ...(typeof values.especieId === 'number' ? { especie: values.especieId } : { especie: null }),
      ...(typeof values.razaId === 'number' ? { raza: values.razaId } : { raza: null }),
      ...(values.fecha_nacimiento && values.fecha_nacimiento.trim() !== ''
        ? { fecha_nacimiento: values.fecha_nacimiento }
        : { fecha_nacimiento: null }),
      ...(values.peso && values.peso.trim() !== '' ? { peso: Number(values.peso) } : { peso: null }),
    }

    await onSubmit(payload)
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Input 
          label="Nombre de la mascota" 
          placeholder="Ej: Max, Luna, Rocky..."
          {...form.register('nombre')} 
          error={form.formState.errors.nombre?.message} 
        />

        <label className="space-y-2 text-sm text-primary">
          <span>Sexo</span>
          <select
            className="w-full rounded-lg border border-[var(--border-subtle-color)] bg-[var(--color-surface-200)] px-4 py-2.5 text-base text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
            style={{
              borderWidth: 'var(--border-subtle-width)',
              borderStyle: 'var(--border-subtle-style)',
            }}
            {...form.register('sexo')}
          >
            {sexOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-primary">
          <span>Especie</span>
          {speciesLoading ? (
            <div className="flex min-h-[42px] items-center">
              <Spinner size="sm" />
            </div>
          ) : (
            <select
              className="w-full rounded-lg border border-[var(--border-subtle-color)] bg-[var(--color-surface-200)] px-4 py-2.5 text-base text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
              style={{
                borderWidth: 'var(--border-subtle-width)',
                borderStyle: 'var(--border-subtle-style)',
              }}
              value={typeof form.watch('especieId') === 'number' ? form.watch('especieId') : ''}
              onChange={(event) => {
                const value = event.target.value
                form.setValue('especieId', value ? Number(value) : ('' as const))
              }}
            >
              <option value="">Selecciona especie</option>
              {species?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                </option>
              ))}
            </select>
          )}
        </label>

        <label className="space-y-2 text-sm text-primary">
          <span>Raza</span>
          {breedsLoading && speciesIdNumber ? (
            <div className="flex min-h-[42px] items-center">
              <Spinner size="sm" />
            </div>
          ) : (
            <select
              className="w-full rounded-lg border border-[var(--border-subtle-color)] bg-[var(--color-surface-200)] px-4 py-2.5 text-base text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                borderWidth: 'var(--border-subtle-width)',
                borderStyle: 'var(--border-subtle-style)',
              }}
              value={typeof form.watch('razaId') === 'number' ? form.watch('razaId') : ''}
              onChange={(event) => {
                const value = event.target.value
                form.setValue('razaId', value ? Number(value) : ('' as const))
              }}
              disabled={!speciesIdNumber}
            >
              <option value="">{speciesIdNumber ? 'Selecciona raza' : 'Primero selecciona una especie'}</option>
              {(breeds ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                </option>
              ))}
            </select>
          )}
        </label>

        <Input
          type="date"
          label="Fecha de nacimiento"
          placeholder="Selecciona la fecha"
          {...form.register('fecha_nacimiento')}
          error={form.formState.errors.fecha_nacimiento?.message}
        />

        <Input
          type="number"
          step="0.1"
          min="0"
          label="Peso (kg)"
          placeholder="Ej: 5.5"
          {...form.register('peso')}
          error={form.formState.errors.peso?.message}
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={form.formState.isSubmitting || isSubmitting} className="min-w-[160px]">
          {form.formState.isSubmitting || isSubmitting
            ? 'Guardando...'
            : mode === 'create'
              ? 'Registrar mascota'
              : 'Guardar cambios'}
        </Button>
      </div>
    </form>
  )
}

