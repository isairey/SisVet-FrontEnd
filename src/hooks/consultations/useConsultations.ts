import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'

import type { ConsultationPayload } from '@/api/types/consultations'
import { consultationService } from '@/services/consultations'

const getError = (error: AxiosError<any>) => {
  const data = error.response?.data
  if (data) {
    if (typeof data.detail === 'string') return data.detail
    if (typeof data.message === 'string') return data.message
  }
  return 'Ocurrió un error al procesar la consulta.'
}

export const useConsultationsQuery = (params: { mascota?: number; veterinario?: number; search?: string }) =>
  useQuery({
    queryKey: ['consultations', params],
    queryFn: () => consultationService.list(params),
  })

export const useConsultationDetailQuery = (
  id: string | undefined,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['consultations', 'detail', id],
    queryFn: () => consultationService.detail(id!), // o .get(id!)
    enabled: options?.enabled !== false && !!id,
  })
}

export const useConsultationCreateMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ConsultationPayload) => consultationService.create(payload),
    onSuccess: () => {
      toast.success('Consulta registrada')
      queryClient.invalidateQueries({ queryKey: ['consultations'] })
    },
    onError: (error: AxiosError) => toast.error(getError(error)),
  })
}

export const useConsultationUpdateMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number | string, data: Partial<ConsultationPayload> }) => 
      consultationService.update(id, data),
    onSuccess: (_, variables) => {
      toast.success('Consulta actualizada')
      queryClient.invalidateQueries({ queryKey: ['consultations'] })
      queryClient.invalidateQueries({ queryKey: ['consultations', 'detail', String(variables.id)] })
    },
    onError: (error: AxiosError) => toast.error(getError(error)),
  })
}

export const useConsultationDeleteMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => consultationService.remove(id),
    onSuccess: () => {
      toast.success('Consulta eliminada')
      queryClient.invalidateQueries({ queryKey: ['consultations'] })
    },
    onError: (error: AxiosError) => toast.error(getError(error)),
  })
}

export const useConsultationsByPetQuery = (petId?: number | string) =>
  useQuery({
    queryKey: ['consultations', 'pet', petId],
    queryFn: () => consultationService.byPet(petId!),
    enabled: Boolean(petId),
  })

export const useConsultationsByVetQuery = (vetId?: number | string) =>
  useQuery({
    queryKey: ['consultations', 'vet', vetId],
    queryFn: () => consultationService.byVet(vetId!),
    enabled: Boolean(vetId),
  })

export const useConsultationConsentMutation = () =>
  useMutation({
    mutationFn: (id: number | string) => consultationService.sendConsent(id),
    onSuccess: () => toast.success('Consentimiento enviado'),
    onError: (error: AxiosError) => toast.error(getError(error)),
  })

export const useConfirmConsentMutation = () =>
  useMutation({
    mutationFn: (token: string) => consultationService.confirmConsent(token),
  })

export const useConsultationStatsQuery = () =>
  useQuery({
    queryKey: ['consultations', 'stats'],
    queryFn: consultationService.stats,
    staleTime: 5 * 60 * 1000,
  })

export const useConsultationsAvailableForInvoiceQuery = (enabled = true) =>
  useQuery({
    queryKey: ['consultations', 'available-for-invoice'],
    queryFn: consultationService.availableForInvoice,
    enabled,
    retry: 1,
    staleTime: 30 * 1000, // 30 segundos
    onError: (error) => {
      console.error('Error al cargar consultas disponibles para facturar:', error)
    },
  })

