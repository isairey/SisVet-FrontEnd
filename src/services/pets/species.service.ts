import { apiClient } from '@/api/httpClient'
import { endpoints } from '@/api/endpoints'
import type { Species, SpeciesListResponse } from '@/api/types/pets'

const list = async (): Promise<Species[]> => {
  const { data } = await apiClient.get<SpeciesListResponse>(endpoints.pets.species())

  if (Array.isArray(data)) return data
  if (data?.results) return data.results
  return []
}

const create = async (payload: { nombre: string }): Promise<Species> => {
  const { data } = await apiClient.post<Species>(endpoints.pets.species(), payload)
  return data
}

export const speciesService = {
  list,
  create,
}

