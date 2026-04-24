import { apiClient } from '@/api/httpClient'
import { endpoints } from '@/api/endpoints'
import type {
  Invoice,
  InvoiceCreatePayload,
  InvoiceCreateFromProductsPayload,
  InvoiceListResponse,
  PaymentInvoicePayload,
} from '@/api/types/billing'

interface InvoiceQueryParams {
  search?: string
  estado?: string
  cliente?: number | string
  page?: number
  ordering?: string
}

const normalizeList = (data: InvoiceListResponse | Invoice[]): InvoiceListResponse => {
  // Si ya es la estructura paginada, devolverla
  if (data && typeof data === 'object' && 'results' in data && 'count' in data) {
    return data as InvoiceListResponse
  }

  // Si es un array, convertirlo a estructura paginada
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data,
    }
  }

  // Si no hay datos, devolver estructura vacía
  return {
    count: 0,
    next: null,
    previous: null,
    results: [],
  }
}

const list = async (params: InvoiceQueryParams = {}): Promise<InvoiceListResponse> => {
  const queryParams: Record<string, unknown> = {
    search: params.search,
    estado: params.estado,
    cliente: params.cliente,
    page: params.page,
    ordering: params.ordering,
  }

  // Limpiar parámetros undefined o vacíos
  Object.keys(queryParams).forEach((key) => {
    if (queryParams[key] === undefined || queryParams[key] === '') {
      delete queryParams[key]
    }
  })

  const { data } = await apiClient.get<InvoiceListResponse | Invoice[]>(endpoints.billing.invoices(), {
    params: queryParams,
  })

  return normalizeList(data)
}

const detail = async (id: number | string): Promise<Invoice> => {
  const { data } = await apiClient.get<Invoice>(endpoints.billing.invoiceDetail(id))
  return data
}

const create = async (payload: InvoiceCreatePayload): Promise<Invoice> => {
  const { data } = await apiClient.post<Invoice>(endpoints.billing.invoices(), payload)
  return data
}

const createFromAppointment = async (appointmentId: number | string): Promise<Invoice> => {
  const { data } = await apiClient.post<Invoice>(endpoints.billing.createFromAppointment(appointmentId), {})
  return data
}

const createFromConsultation = async (consultationId: number | string): Promise<Invoice> => {
  const { data } = await apiClient.post<Invoice>(endpoints.billing.createFromConsultation(consultationId), {})
  return data
}

const createFromProducts = async (payload: InvoiceCreateFromProductsPayload): Promise<Invoice> => {
  const { data } = await apiClient.post<Invoice>(endpoints.billing.createFromProducts(), payload)
  return data
}

const pay = async (
  invoiceId: number | string,
  payload: PaymentInvoicePayload,
): Promise<{ message: string; factura_id: number; estado: string }> => {
  const { data } = await apiClient.post<{ message: string; factura_id: number; estado: string }>(
    endpoints.billing.payInvoice(invoiceId),
    payload,
  )
  return data
}

const cancel = async (invoiceId: number | string): Promise<{ message: string }> => {
  const { data } = await apiClient.post<{ message: string }>(endpoints.billing.cancelInvoice(invoiceId), {})
  return data
}

const sendEmail = async (invoiceId: number | string): Promise<{ message: string }> => {
  const { data } = await apiClient.post<{ message: string }>(endpoints.billing.sendInvoiceEmail(invoiceId), {})
  return data
}

export const invoiceService = {
  list,
  detail,
  create,
  createFromAppointment,
  createFromConsultation,
  createFromProducts,
  pay,
  cancel,
  sendEmail,
}

