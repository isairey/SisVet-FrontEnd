import { apiClient } from '@/api/httpClient'
import { endpoints } from '@/api/endpoints'
import type { Pet, PetListResponse, PetPayload } from '@/api/types/pets'

export interface PetQueryParams {
  search?: string
  especie?: number | null
}

const normalizeList = (data: PetListResponse): Pet[] => {
  if (Array.isArray(data)) return data
  if (data?.results) return data.results
  return []
}

const list = async (params: PetQueryParams = {}) => {
  const { data } = await apiClient.get<PetListResponse>(endpoints.pets.base(), {
    params: {
      search: params.search,
      especie: params.especie ?? undefined,
    },
  })
  return normalizeList(data)
}

const detail = async (id: number | string) => {
  const { data } = await apiClient.get<Pet>(endpoints.pets.detail(id))
  return data
}

const create = async (payload: PetPayload) => {
  const { data } = await apiClient.post<Pet>(endpoints.pets.base(), payload)
  return data
}

const update = async (id: number | string, payload: PetPayload) => {
  const { data } = await apiClient.patch<Pet>(endpoints.pets.detail(id), payload)
  return data
}

const remove = async (id: number | string) => {
  await apiClient.delete(endpoints.pets.detail(id))
}

export const petService = {
  list,
  detail,
  create,
  update,
  remove,
}

