import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'
import { brandConfigService } from '@/services/clinic-config'
import type { BrandPayload } from '@/api/types/clinic-config'

const getErrorMessage = (error: AxiosError<any>) => {
  const data = error.response?.data
  if (data) {
    if (typeof data.detail === 'string') return data.detail
    if (typeof data.mensaje === 'string') return data.mensaje
    if (typeof data.message === 'string') return data.message
  }
  return 'Ocurrió un error al procesar la solicitud.'
}

export const useBrandsConfigQuery = (search?: string) =>
  useQuery({
    queryKey: ['clinic-config', 'brands', search],
    queryFn: () => brandConfigService.list(search),
    staleTime: 5 * 60 * 1000,
  })

export const useBrandConfigDetailQuery = (id?: number | string) =>
  useQuery({
    queryKey: ['clinic-config', 'brands', id],
    queryFn: () => brandConfigService.detail(id!),
    enabled: Boolean(id),
  })

export const useBrandConfigCreateMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: BrandPayload) => brandConfigService.create(payload),
    onSuccess: () => {
      toast.success('Marca creada correctamente')
      queryClient.invalidateQueries({ queryKey: ['clinic-config', 'brands'] })
      queryClient.invalidateQueries({ queryKey: ['inventory', 'brands'] })
    },
    onError: (error: AxiosError) => toast.error(getErrorMessage(error)),
  })
}

export const useBrandConfigUpdateMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Partial<BrandPayload> }) =>
      brandConfigService.update(id, payload),
    onSuccess: () => {
      toast.success('Marca actualizada correctamente')
      queryClient.invalidateQueries({ queryKey: ['clinic-config', 'brands'] })
      queryClient.invalidateQueries({ queryKey: ['inventory', 'brands'] })
    },
    onError: (error: AxiosError) => toast.error(getErrorMessage(error)),
  })
}

export const useBrandConfigDeleteMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => brandConfigService.remove(id),
    onSuccess: () => {
      toast.success('Marca eliminada correctamente')
      queryClient.invalidateQueries({ queryKey: ['clinic-config', 'brands'] })
      queryClient.invalidateQueries({ queryKey: ['inventory', 'brands'] })
    },
    onError: (error: AxiosError) => toast.error(getErrorMessage(error)),
  })
}

