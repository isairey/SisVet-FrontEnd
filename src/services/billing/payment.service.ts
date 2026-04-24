import { apiClient } from '@/api/httpClient'
import { endpoints } from '@/api/endpoints'
import type { Payment, PaymentCreatePayload, PaymentListResponse, PaymentMethod, PaymentMethodCreatePayload } from '@/api/types/billing'

interface PaymentQueryParams {
  factura?: number
  page?: number
}

const list = async (params: PaymentQueryParams = {}) => {
  const queryParams: Record<string, unknown> = {
    factura: params.factura,
    page: params.page,
  }

  // Limpiar parámetros undefined
  Object.keys(queryParams).forEach((key) => {
    if (queryParams[key] === undefined || queryParams[key] === '') {
      delete queryParams[key]
    }
  })

  const { data } = await apiClient.get<PaymentListResponse | Payment[]>(endpoints.billing.payments, {
    params: queryParams,
  })

  // Normalizar respuesta
  if (Array.isArray(data)) {
    return data
  }

  return data.results || []
}

const create = async (payload: PaymentCreatePayload) => {
  const { data } = await apiClient.post<Payment>(endpoints.billing.payments, payload)
  return data
}

const getPaymentMethods = async () => {
  try {
    const url = endpoints.billing.paymentMethods()
    const { data } = await apiClient.get<PaymentMethod[] | { count: number; next: string | null; previous: string | null; results: PaymentMethod[] }>(url)
    
    // Manejar respuesta paginada o array directo
    if (Array.isArray(data)) {
      return data
    }
    
    // Si viene en formato paginado con count, next, previous, results
    if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
      return data.results
    }
    
    // Fallback: retornar array vacío si no se puede parsear
    console.warn('Formato de respuesta de métodos de pago no reconocido:', data)
    return []
  } catch (error) {
    console.error('Error al obtener métodos de pago desde el servicio:', error)
    throw error
  }
}

const createPaymentMethod = async (payload: PaymentMethodCreatePayload) => {
  const { data } = await apiClient.post<PaymentMethod>(endpoints.billing.paymentMethods(), payload)
  return data
}

const updatePaymentMethod = async (id: number | string, payload: PaymentMethodCreatePayload) => {
  const { data } = await apiClient.put<PaymentMethod>(`${endpoints.billing.paymentMethods()}${id}/`, payload)
  return data
}

const deletePaymentMethod = async (id: number | string) => {
  await apiClient.delete(`${endpoints.billing.paymentMethods()}${id}/`)
}

export const paymentService = {
  list,
  create,
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
}

