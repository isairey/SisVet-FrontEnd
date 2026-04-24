import { apiClient } from '@/api/httpClient'
import { endpoints } from '@/api/endpoints'
import type { AppointmentSummary, AppointmentPayload, ReagendarPayload, AvailabilityResponse, ServiceItem } from '@/api/types/appointments'

const list = async (): Promise<AppointmentSummary[]> => {
  const { data } = await apiClient.get<AppointmentSummary[] | { results: AppointmentSummary[] }>(
    endpoints.appointments.base(),
  )
  // Verificación más segura de TS para paginación de DRF
  if (Array.isArray(data)) return data
  if (data && 'results' in data) return data.results
  return []
}

const create = async (payload: AppointmentPayload) => {
  const { data } = await apiClient.post<AppointmentSummary>(endpoints.appointments.base(), payload)
  return data
}

const detail = async (id: number | string) => {
  const { data } = await apiClient.get<AppointmentSummary>(endpoints.appointments.detail(id))
  return data
}

const cancel = async (id: number | string) => {
  const { data } = await apiClient.post<AppointmentSummary>(endpoints.appointments.cancel(id))
  return data
}

const reschedule = async (id: number | string, fecha_hora: string) => {
  const payload: ReschedulePayload = { fecha_hora }
  const { data } = await apiClient.post<AppointmentSummary>(endpoints.appointments.reschedule(id), payload)
  return data
}

const services = async (): Promise<ServiceItem[]> => {
  const { data } = await apiClient.get<ServiceItem[] | { results: ServiceItem[] }>(endpoints.appointments.services())
  // Normalizar respuesta: puede ser array directo o objeto con results
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
    return data.results
  }
  return []
}

const availability = async (veterinarioId: number | string, fecha: string) => {
  const { data } = await apiClient.get<AvailabilityResponse>(endpoints.appointments.availability(), {
    params: { veterinario_id: veterinarioId, fecha },
  })
  return data.horarios_disponibles
}

const availableForInvoice = async () => {
  const { data } = await apiClient.get<AppointmentSummary[] | { results: AppointmentSummary[] }>(
    endpoints.appointments.availableForInvoice(),
  )
  if (Array.isArray(data)) return data
  if (data && 'results' in data) return data.results
  return []
}

export const appointmentService = {
  list,
  create,
  detail,
  cancel,
  reschedule,
  services,
  availability,
  availableForInvoice,
}
