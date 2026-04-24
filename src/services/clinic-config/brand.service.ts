import { apiClient } from '@/api/httpClient'
import { endpoints } from '@/api/endpoints'
import type { Brand, BrandPayload, BrandListResponse } from '@/api/types/clinic-config'

const normalizeList = (data: BrandListResponse): Brand[] => {
  if (Array.isArray(data)) return data
  if (data?.results) return data.results
  return []
}

const list = async (search?: string): Promise<Brand[]> => {
  const params = search ? { buscador: search } : {}
  const { data } = await apiClient.get<BrandListResponse>(endpoints.clinicConfig.brands.base(), { params })
  return normalizeList(data)
}

const detail = async (id: number | string): Promise<Brand> => {
  const { data } = await apiClient.get<Brand>(endpoints.clinicConfig.brands.detail(id))
  return data
}

const create = async (payload: BrandPayload): Promise<Brand> => {
  const { data } = await apiClient.post<Brand>(endpoints.clinicConfig.brands.base(), payload)
  return data
}

const update = async (id: number | string, payload: Partial<BrandPayload>): Promise<Brand> => {
  const { data } = await apiClient.patch<Brand>(endpoints.clinicConfig.brands.detail(id), payload)
  return data
}

const remove = async (id: number | string): Promise<void> => {
  await apiClient.delete(endpoints.clinicConfig.brands.detail(id))
}

export const brandConfigService = {
  list,
  detail,
  create,
  update,
  remove,
}

