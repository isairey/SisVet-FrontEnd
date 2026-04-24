import { apiClient } from '@/api/httpClient'
import { endpoints } from '@/api/endpoints'
import type {
  ConsultationDetail,
  ConsultationListResponse,
  ConsultationPayload,
  ConsultationStats,
  ConsultationSummary,
} from '@/api/types/consultations'

export interface ConsultationQueryParams {
  mascota?: number | string
  veterinario?: number | string
  fecha_consulta?: string
  search?: string
}

const normalizeList = (data: ConsultationListResponse) => {
  if (Array.isArray(data)) return data
  if (data?.results) return data.results
  return []
}

const list = async (params: ConsultationQueryParams = {}) => {
  const { data } = await apiClient.get<ConsultationListResponse>(endpoints.consultations.base(), {
    params: {
      mascota: params.mascota,
      veterinario: params.veterinario,
      fecha_consulta: params.fecha_consulta,
      search: params.search,
    },
  })
  return normalizeList(data)
}

const detail = async (id: number | string) => {
  const { data } = await apiClient.get<ConsultationDetail>(endpoints.consultations.detail(id))
  return data
}

const create = async (payload: ConsultationPayload) => {
  const { data } = await apiClient.post<ConsultationDetail>(endpoints.consultations.base(), payload)
  return data
}

const update = async (id: number | string, payload: Partial<ConsultationPayload>) => {
  const { data } = await apiClient.patch<ConsultationDetail>(endpoints.consultations.detail(id), payload)
  return data
}

const remove = async (id: number | string) => {
  await apiClient.delete(endpoints.consultations.detail(id))
}

const byPet = async (petId: number | string) => {
  const { data } = await apiClient.get<ConsultationSummary[]>(endpoints.consultations.byPet(petId))
  return data
}

const byVet = async (vetId: number | string) => {
  const { data } = await apiClient.get<ConsultationSummary[]>(endpoints.consultations.byVet(vetId))
  return data
}

const sendConsent = async (id: number | string) => {
  const { data } = await apiClient.post<{ detail: string }>(endpoints.consultations.consent(id))
  return data
}

const confirmConsent = async (token: string) => {
  // Usar axios directamente sin interceptores para este endpoint público
  const axios = (await import('axios')).default
  const { appConfig } = await import('@/core/config/app-config')
  
  try {
    const { data } = await axios.post<{ message: string }>(
      `${appConfig.apiUrl}/consultas/confirmar-consentimiento/`,
      { token },
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 15000,
      }
    )
    return data
  } catch (error: any) {
    // Log para debugging
    console.error('Error al confirmar consentimiento:', {
      token: token?.substring(0, 10) + '...',
      url: `${appConfig.apiUrl}/consultas/confirmar-consentimiento/`,
      error: error?.response?.data || error?.message,
      status: error?.response?.status,
    })
    throw error
  }
}

const stats = async () => {
  const { data } = await apiClient.get<ConsultationStats>(endpoints.consultations.stats())
  return data
}

const availableForInvoice = async () => {
  const { data } = await apiClient.get<ConsultationListResponse>(endpoints.consultations.availableForInvoice())
  return normalizeList(data)
}

export const consultationService = {
  list,
  detail,
  create,
  update,
  remove,
  byPet,
  byVet,
  sendConsent,
  confirmConsent,
  stats,
  availableForInvoice,
}

