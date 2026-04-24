import { useQuery } from '@tanstack/react-query'
import { getInvoiceReceipt } from '@/services/billing/receipt.service'

const QUERY_KEYS = {
  all: ['invoiceReceipt'] as const,
  receipt: (id: number | string) => [...QUERY_KEYS.all, id] as const,
}

export const useInvoiceReceiptQuery = (invoiceId?: number | string) => {
  return useQuery({
    queryKey: QUERY_KEYS.receipt(invoiceId!),
    queryFn: () => getInvoiceReceipt(invoiceId!),
    enabled: !!invoiceId,
    staleTime: 2 * 60 * 1000, // Cache por 2 minutos
  })
}

