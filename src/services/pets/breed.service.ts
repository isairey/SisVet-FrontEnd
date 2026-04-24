import { apiClient } from '@/api/httpClient'
import { endpoints } from '@/api/endpoints'
import type { Breed, BreedListResponse } from '@/api/types/pets'

const listBySpecies = async (speciesId: number): Promise<Breed[]> => {
  const { data } = await apiClient.get<BreedListResponse>(endpoints.pets.breeds(), {
    params: { especie: speciesId },
  })

  if (Array.isArray(data)) return data
  if (data?.results) return data.results
  return []
}

const create = async (payload: { nombre: string; especie: number }): Promise<Breed> => {
  const { data } = await apiClient.post<Breed>(endpoints.pets.breeds(), payload)
  return data
}

export const breedService = {
  listBySpecies,
  create,
}

