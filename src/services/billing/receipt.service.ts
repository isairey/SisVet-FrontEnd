import { apiClient } from '@/api/httpClient'
import { endpoints } from '@/api/endpoints'
import type { InvoiceReceipt } from '@/api/types/billing'

export const getInvoiceReceipt = async (invoiceId: number | string): Promise<InvoiceReceipt> => {
  const { data } = await apiClient.get<InvoiceReceipt>(endpoints.billing.invoiceReceipt(invoiceId))
  return data
}

// Función para generar PDF (si el backend lo soporta)
export const downloadInvoiceReceiptPDF = async (invoiceId: number | string): Promise<Blob> => {
  const { data } = await apiClient.get<Blob>(endpoints.billing.invoiceReceipt(invoiceId), {
    responseType: 'blob',
    params: { formato: 'pdf' }, // Si el backend soporta parámetro para PDF
  })
  return data
}

