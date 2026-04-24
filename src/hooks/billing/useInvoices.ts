import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { invoiceService } from '@/services/billing/invoice.service'
import type { Invoice, InvoiceCreatePayload, InvoiceCreateFromProductsPayload, InvoiceDuplicateError, PaymentInvoicePayload } from '@/api/types/billing'

interface InvoiceFilters {
  search?: string
  estado?: string
  cliente?: number | string
  page?: number
  ordering?: string
}

const QUERY_KEYS = {
  all: ['invoices'] as const,
  lists: () => [...QUERY_KEYS.all, 'list'] as const,
  list: (filters?: InvoiceFilters) => [...QUERY_KEYS.lists(), filters] as const,
  details: () => [...QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number | string) => [...QUERY_KEYS.details(), id] as const,
}

export const useInvoicesQuery = (filters?: InvoiceFilters) => {
  return useQuery({
    queryKey: QUERY_KEYS.list(filters),
    queryFn: () => invoiceService.list(filters),
  })
}

export const useInvoiceDetailQuery = (id: number | string | undefined) => {
  return useQuery({
    queryKey: QUERY_KEYS.detail(id!),
    queryFn: () => invoiceService.detail(id!),
    enabled: !!id,
    retry: (failureCount, error: any) => {
      // Reintentar hasta 3 veces si es error 404 (factura aún no disponible)
      if (error?.response?.status === 404 && failureCount < 3) {
        return true
      }
      // Para otros errores, solo reintentar una vez
      return failureCount < 1
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000), // Retry con delay exponencial
  })
}

export const useInvoiceCreateMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: InvoiceCreatePayload) => invoiceService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() })
      toast.success('Factura creada correctamente')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error al crear la factura')
    },
  })
}

export const useInvoiceCreateFromAppointmentMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (appointmentId: number | string) => invoiceService.createFromAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() })
      // Invalidar la lista de citas disponibles para facturar
      queryClient.invalidateQueries({ queryKey: ['appointments', 'available-for-invoice'] })
      toast.success('Factura creada desde cita correctamente')
    },
    onError: (error: any) => {
      const errorData = error?.response?.data as InvoiceDuplicateError | undefined
      
      if (errorData?.factura_existente) {
        const facturaId = errorData.factura_existente.id
        const mensaje = errorData.detail || errorData.mensaje || 'Ya existe una factura para esta cita'
        toast.error(`Ya existe una factura para esta cita (Factura #${facturaId}). Redirigiendo...`, { duration: 4000 })
        // Redirigir a la factura existente después de un breve delay
        setTimeout(() => {
          window.location.href = `/app/facturacion/${facturaId}`
        }, 2000)
      } else {
        toast.error(errorData?.detail || errorData?.mensaje || 'Error al crear factura desde cita')
      }
    },
  })
}

export const useInvoiceCreateFromConsultationMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (consultationId: number | string) => invoiceService.createFromConsultation(consultationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() })
      // Invalidar la lista de consultas disponibles para facturar
      queryClient.invalidateQueries({ queryKey: ['consultations', 'available-for-invoice'] })
      toast.success('Factura creada desde consulta correctamente')
    },
    onError: (error: any) => {
      const errorData = error?.response?.data as InvoiceDuplicateError | undefined
      
      if (errorData?.factura_existente) {
        const facturaId = errorData.factura_existente.id
        const mensaje = errorData.detail || errorData.mensaje || 'Ya existe una factura para esta consulta'
        toast.error(`Ya existe una factura para esta consulta (Factura #${facturaId}). Redirigiendo...`, { duration: 4000 })
        // Redirigir a la factura existente después de un breve delay
        setTimeout(() => {
          window.location.href = `/app/facturacion/${facturaId}`
        }, 2000)
      } else {
        toast.error(errorData?.detail || errorData?.mensaje || 'Error al crear factura desde consulta')
      }
    },
  })
}

export const useInvoiceCreateFromProductsMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: InvoiceCreateFromProductsPayload) => invoiceService.createFromProducts(payload),
    onSuccess: (invoice) => {
      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: ['products'] }) // Invalidar productos para actualizar stock
      
      // Pre-cargar la factura en caché si tenemos el ID
      if (invoice?.id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(invoice.id) })
      }
      
      // No mostrar toast aquí, se maneja en el componente
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.mensaje || 'Error al crear factura desde productos'
      toast.error(errorMessage)
    },
  })
}

export const useInvoicePayMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ invoiceId, payload }: { invoiceId: number | string; payload: PaymentInvoicePayload }) =>
      invoiceService.pay(invoiceId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(variables.invoiceId) })
      toast.success('Factura pagada correctamente')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error al pagar la factura')
    },
  })
}

export const useInvoiceCancelMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (invoiceId: number | string) => invoiceService.cancel(invoiceId),
    onSuccess: (_, invoiceId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.detail(invoiceId) })
      toast.success('Factura anulada correctamente')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error al anular la factura')
    },
  })
}

export const useInvoiceSendEmailMutation = () => {
  return useMutation({
    mutationFn: (invoiceId: number | string) => invoiceService.sendEmail(invoiceId),
    onSuccess: () => {
      toast.success('Factura enviada por correo electrónico')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error al enviar el correo')
    },
  })
}

