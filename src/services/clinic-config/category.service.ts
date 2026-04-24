import { apiClient } from '@/api/httpClient'
import { endpoints } from '@/api/endpoints'
import type { Category, CategoryPayload, CategoryListResponse } from '@/api/types/clinic-config'

const normalizeList = (data: CategoryListResponse): Category[] => {
  if (Array.isArray(data)) return data
  if (data?.results) return data.results
  return []
}

const list = async (search?: string): Promise<Category[]> => {
  const params = search ? { buscador: search } : {}
  const { data } = await apiClient.get<CategoryListResponse>(endpoints.clinicConfig.categories.base(), { params })
  return normalizeList(data)
}

const detail = async (id: number | string): Promise<Category> => {
  const { data } = await apiClient.get<Category>(endpoints.clinicConfig.categories.detail(id))
  return data
}

const create = async (payload: CategoryPayload): Promise<Category> => {
  const { data } = await apiClient.post<Category>(endpoints.clinicConfig.categories.base(), payload)
  return data
}

const update = async (id: number | string, payload: Partial<CategoryPayload>): Promise<Category> => {
  const { data } = await apiClient.patch<Category>(endpoints.clinicConfig.categories.detail(id), payload)
  return data
}

const remove = async (id: number | string): Promise<void> => {
  await apiClient.delete(endpoints.clinicConfig.categories.detail(id))
}

export const categoryConfigService = {
  list,
  detail,
  create,
  update,
  remove,
}

