import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { paymentService } from '@/services/billing/payment.service'
import type { Payment, PaymentCreatePayload, PaymentMethod, PaymentMethodCreatePayload } from '@/api/types/billing'
import toast from 'react-hot-toast'

interface PaymentFilters {
  factura?: number
  page?: number
}

const QUERY_KEYS = {
  all: ['payments'] as const,
  lists: () => [...QUERY_KEYS.all, 'list'] as const,
  list: (filters?: PaymentFilters) => [...QUERY_KEYS.lists(), filters] as const,
  methods: () => [...QUERY_KEYS.all, 'methods'] as const,
}

export const usePaymentsQuery = (filters?: PaymentFilters) => {
  return useQuery({
    queryKey: QUERY_KEYS.list(filters),
    queryFn: () => paymentService.list(filters),
  })
}

export const usePaymentMethodsQuery = () => {
  return useQuery<PaymentMethod[], Error>({
    queryKey: QUERY_KEYS.methods(),
    queryFn: async () => {
      try {
        const methods = await paymentService.getPaymentMethods()
        // Asegurar que siempre retornamos un array
        const result = Array.isArray(methods) ? methods : []
        return result
      } catch (error) {
        console.error('Error al obtener métodos de pago:', error)
        return []
      }
    },
  })
}

export const usePaymentCreateMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: PaymentCreatePayload) => paymentService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.lists() })
    },
  })
}

export const usePaymentMethodCreateMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: PaymentMethodCreatePayload) => paymentService.createPaymentMethod(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.methods() })
      toast.success('Método de pago creado correctamente')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.nombre?.[0] || 
                          error?.response?.data?.codigo?.[0] || 
                          error?.response?.data?.detail || 
                          'Error al crear el método de pago'
      toast.error(errorMessage)
    },
  })
}

export const usePaymentMethodUpdateMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: PaymentMethodCreatePayload }) => 
      paymentService.updatePaymentMethod(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.methods() })
      toast.success('Método de pago actualizado correctamente')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.nombre?.[0] || 
                          error?.response?.data?.codigo?.[0] || 
                          error?.response?.data?.detail || 
                          'Error al actualizar el método de pago'
      toast.error(errorMessage)
    },
  })
}

export const usePaymentMethodDeleteMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number | string) => paymentService.deletePaymentMethod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.methods() })
      toast.success('Método de pago eliminado correctamente')
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || 
                          'Error al eliminar el método de pago'
      toast.error(errorMessage)
    },
  })
}

