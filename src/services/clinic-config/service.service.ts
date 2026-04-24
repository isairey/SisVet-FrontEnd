import { apiClient } from '@/api/httpClient'
import { endpoints } from '@/api/endpoints'
import type { Service, ServicePayload, ServiceListResponse } from '@/api/types/clinic-config'

const normalizeList = (data: ServiceListResponse): Service[] => {
  if (Array.isArray(data)) return data
  if (data?.results) return data.results
  return []
}

const list = async (): Promise<Service[]> => {
  const { data } = await apiClient.get<ServiceListResponse>(endpoints.clinicConfig.services.base())
  return normalizeList(data)
}

const detail = async (id: number | string): Promise<Service> => {
  const { data } = await apiClient.get<Service>(endpoints.clinicConfig.services.detail(id))
  return data
}

const create = async (payload: ServicePayload): Promise<Service> => {
  const { data } = await apiClient.post<Service>(endpoints.clinicConfig.services.base(), payload)
  return data
}

const update = async (id: number | string, payload: Partial<ServicePayload>): Promise<Service> => {
  const { data } = await apiClient.patch<Service>(endpoints.clinicConfig.services.detail(id), payload)
  return data
}

const remove = async (id: number | string): Promise<void> => {
  await apiClient.delete(endpoints.clinicConfig.services.detail(id))
}

export const serviceConfigService = {
  list,
  detail,
  create,
  update,
  remove,
}

