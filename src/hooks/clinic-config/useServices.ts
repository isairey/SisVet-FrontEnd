import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'
import { serviceConfigService } from '@/services/clinic-config'
import type { ServicePayload } from '@/api/types/clinic-config'

const getErrorMessage = (error: AxiosError<any>) => {
  const data = error.response?.data
  if (data) {
    if (typeof data.detail === 'string') return data.detail
    if (typeof data.mensaje === 'string') return data.mensaje
    if (typeof data.message === 'string') return data.message
  }
  return 'Ocurrió un error al procesar la solicitud.'
}

export const useServicesQuery = () =>
  useQuery({
    queryKey: ['clinic-config', 'services'],
    queryFn: serviceConfigService.list,
    staleTime: 5 * 60 * 1000,
  })

export const useServiceDetailQuery = (id?: number | string) =>
  useQuery({
    queryKey: ['clinic-config', 'services', id],
    queryFn: () => serviceConfigService.detail(id!),
    enabled: Boolean(id),
  })

export const useServiceCreateMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ServicePayload) => serviceConfigService.create(payload),
    onSuccess: () => {
      toast.success('Servicio creado correctamente')
      queryClient.invalidateQueries({ queryKey: ['clinic-config', 'services'] })
      queryClient.invalidateQueries({ queryKey: ['appointment-services'] })
    },
    onError: (error: AxiosError) => toast.error(getErrorMessage(error)),
  })
}

export const useServiceUpdateMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number | string; payload: Partial<ServicePayload> }) =>
      serviceConfigService.update(id, payload),
    onSuccess: () => {
      toast.success('Servicio actualizado correctamente')
      queryClient.invalidateQueries({ queryKey: ['clinic-config', 'services'] })
      queryClient.invalidateQueries({ queryKey: ['appointment-services'] })
    },
    onError: (error: AxiosError) => toast.error(getErrorMessage(error)),
  })
}

export const useServiceDeleteMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => serviceConfigService.remove(id),
    onSuccess: () => {
      toast.success('Servicio eliminado correctamente')
      queryClient.invalidateQueries({ queryKey: ['clinic-config', 'services'] })
      queryClient.invalidateQueries({ queryKey: ['appointment-services'] })
    },
    onError: (error: AxiosError) => toast.error(getErrorMessage(error)),
  })
}

