import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'

import type { PetPayload } from '@/api/types/pets'
import { petService } from '@/services/pets/pet.service'
import { speciesService } from '@/services/pets/species.service'
import { breedService } from '@/services/pets/breed.service'

const usePetsFiltersInternal = () => {
  const [params, setParams] = useSearchParams()

  const filters = useMemo(
    () => ({
      search: params.get('q') ?? '',
      especie: params.get('especie') ? Number(params.get('especie')) : null,
    }),
    [params],
  )

  const updateFilters = (next: Partial<typeof filters>) => {
    const newParams = new URLSearchParams(params)
    if (next.search !== undefined) newParams.set('q', next.search)
    if (next.especie !== undefined && next.especie !== null) newParams.set('especie', String(next.especie))
    if (next.especie === null) newParams.delete('especie')
    setParams(newParams, { replace: true })
  }

  return { filters, updateFilters }
}

const getErrorMessage = (error: AxiosError<any>) => {
  const data = error.response?.data
  if (data) {
    if (typeof data.detail === 'string') return data.detail
    if (typeof data.message === 'string') return data.message
    // Manejar errores de validación de campos específicos
    if (typeof data === 'object') {
      const fieldErrors = Object.entries(data)
        .filter(([, value]) => Array.isArray(value) && value.length > 0)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value[0] : value}`)
        .join(', ')
      if (fieldErrors) return fieldErrors
    }
  }
  return 'Ocurrió un error al procesar la solicitud. Verifica que tengas un perfil de cliente activo.'
}

export const usePetsFilters = usePetsFiltersInternal

export const usePetsQuery = (filters: { search: string; especie: number | null }) =>
  useQuery({
    queryKey: ['pets', filters],
    queryFn: () => petService.list(filters),
  })

export const usePetDetailQuery = (id?: string) =>
  useQuery({
    queryKey: ['pets', 'detail', id],
    queryFn: () => petService.detail(id!),
    enabled: Boolean(id),
  })

export const usePetCreateMutation = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: PetPayload) => petService.create(payload),
    onSuccess: () => {
      toast.success('Mascota registrada')
      queryClient.invalidateQueries({ queryKey: ['pets'] })
      navigate('/app/mascotas')
    },
    onError: (error: AxiosError) => toast.error(getErrorMessage(error)),
  })
}

export const usePetUpdateMutation = (id: number | string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: PetPayload) => petService.update(id, payload),
    onSuccess: (pet) => {
      toast.success('Mascota actualizada')
      queryClient.invalidateQueries({ queryKey: ['pets'] })
      queryClient.invalidateQueries({ queryKey: ['pets', 'detail', String(id)] })
      return pet
    },
    onError: (error: AxiosError) => toast.error(getErrorMessage(error)),
  })
}

export const usePetDeleteMutation = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (id: number | string) => petService.remove(id),
    onSuccess: () => {
      toast.success('Mascota eliminada')
      queryClient.invalidateQueries({ queryKey: ['pets'] })
      navigate('/app/mascotas')
    },
    onError: (error: AxiosError) => toast.error(getErrorMessage(error)),
  })
}

export const useSpeciesQuery = () =>
  useQuery({
    queryKey: ['species'],
    queryFn: speciesService.list,
    staleTime: 5 * 60 * 1000,
  })

export const useSpeciesCreateMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { nombre: string }) => speciesService.create(payload),
    onSuccess: () => {
      toast.success('Especie creada correctamente')
      queryClient.invalidateQueries({ queryKey: ['species'] })
    },
    onError: (error: AxiosError) => toast.error(getErrorMessage(error)),
  })
}

export const useBreedsQuery = (speciesId?: number | null) =>
  useQuery({
    queryKey: ['breeds', speciesId],
    queryFn: () => breedService.listBySpecies(speciesId!),
    enabled: Boolean(speciesId),
  })

export const useBreedCreateMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { nombre: string; especie: number }) => breedService.create(payload),
    onSuccess: (_, variables) => {
      toast.success('Raza creada correctamente')
      queryClient.invalidateQueries({ queryKey: ['breeds', variables.especie] })
      queryClient.invalidateQueries({ queryKey: ['breeds'] })
    },
    onError: (error: AxiosError) => toast.error(getErrorMessage(error)),
  })
}

