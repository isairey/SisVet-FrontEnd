import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'
import { categoryConfigService } from '@/services/clinic-config'
import type { CategoryPayload } from '@/api/types/clinic-config'

const getErrorMessage = (error: AxiosError<any>) => {
  const data = error.response?.data
  if (data) {
    if (typeof data.detail === 'string') return data.detail
    if (typeof data.mensaje === 'string') return data.mensaje
    if (typeof data.message === 'string') return data.message
  }
  return 'Ocurrió un error al procesar la solicitud.'
}

export const useCategoriesConfigQuery = (search?: string) =>
  useQuery({
    queryKey: ['clinic-config', 'categories', search],
    queryFn: () => categoryConfigService.list(search),
    staleTime: 5 * 60 * 1000,
  })

export const useCategoryConfigDetailQuery = (id?: number | string) =>
  useQuery({
    queryKey: ['clinic-config', 'categories', id],
    queryFn: () => categoryConfigService.detail(id!),
    enabled: Boolean(id),
  })

export const useCategoryConfigCreateMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CategoryPayload) => categoryConfigService.create(payload),
    onSuccess: () => {
      toast.success('Categoría creada correctamente')
      queryClient.invalidateQueries({ queryKey: ['clinic-config', 'categories'] })
      queryClient.invalidateQueries({ queryKey: ['inventory', 'categories'] })
    },
    onError: (error: AxiosError) => toast.error(getErrorMessage(error)),
  })
}

export const useCategoryConfigUpdateMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Partial<CategoryPayload> }) =>
      categoryConfigService.update(id, payload),
    onSuccess: () => {
      toast.success('Categoría actualizada correctamente')
      queryClient.invalidateQueries({ queryKey: ['clinic-config', 'categories'] })
      queryClient.invalidateQueries({ queryKey: ['inventory', 'categories'] })
    },
    onError: (error: AxiosError) => toast.error(getErrorMessage(error)),
  })
}

export const useCategoryConfigDeleteMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => categoryConfigService.remove(id),
    onSuccess: () => {
      toast.success('Categoría eliminada correctamente')
      queryClient.invalidateQueries({ queryKey: ['clinic-config', 'categories'] })
      queryClient.invalidateQueries({ queryKey: ['inventory', 'categories'] })
    },
    onError: (error: AxiosError) => toast.error(getErrorMessage(error)),
  })
}

