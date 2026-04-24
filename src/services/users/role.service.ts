import { apiClient } from '@/api/httpClient'
import { endpoints } from '@/api/endpoints'
import type { RoleListResponse, RoleOption } from '@/api/types/users'

const list = async (): Promise<RoleOption[]> => {
  const { data } = await apiClient.get<RoleListResponse | RoleOption[]>(endpoints.roles.base())

  if (Array.isArray(data)) {
    return data
  }

  if (data && Array.isArray(data.results)) {
    return data.results
  }

  return []
}

export const roleService = {
  list,
}
