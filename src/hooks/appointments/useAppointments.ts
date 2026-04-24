import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'

import type { AppointmentPayload, ValidationErrorResponse } from '@/api/types/appointments'
import { appointmentService } from '@/services/appointments'
import { userService } from '@/services/users'

// Helper mejorado para extraer errores de DRF
const getErrorMessage = (error: AxiosError<ValidationErrorResponse>) => {
  const data = error.response?.data
  
  if (!data) return 'Ocurrió un error inesperado.'

  // 1. Error general ("detail": "Horario ocupado")
  if (data.detail) return data.detail

  // 2. Errores de validación por campo (ej: fecha_hora: ["No puede ser en el pasado"])
  // Retornamos el primer error encontrado
  const firstErrorKey = Object.keys(data)[0]
  if (firstErrorKey && Array.isArray(data[firstErrorKey])) {
    return `${firstErrorKey}: ${data[firstErrorKey][0]}`
  }

  return 'Error en la solicitud.'
}

export const useAppointmentsQuery = () =>
  useQuery({
    queryKey: ['appointments'],
    queryFn: appointmentService.list,
  })

export const useAppointmentDetailQuery = (id?: string) =>
  useQuery({
    queryKey: ['appointments', 'detail', id],
    queryFn: () => appointmentService.detail(id!),
    enabled: Boolean(id),
  })

export const useAppointmentCreateMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: AppointmentPayload) => appointmentService.create(payload),
    onSuccess: () => {
      toast.success('Cita agendada correctamente') // Éxito CP-020
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['availability'] }) // Actualizar cupos
      // Forzar refetch inmediato de disponibilidad
      queryClient.refetchQueries({ queryKey: ['availability'] })
    },
    onError: (error: AxiosError<ValidationErrorResponse>) => {
      // Maneja CP-Failure (Fecha pasada o Horario ocupado)
      toast.error(getErrorMessage(error))
    },
  })
}

export const useAppointmentCancelMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number | string) => appointmentService.cancel(id),
    onSuccess: () => {
      toast.success('Cita cancelada')
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['availability'] })
    },
    onError: (error: AxiosError<ValidationErrorResponse>) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export const useAppointmentRescheduleMutation = (id: number | string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (fecha_hora: string) => appointmentService.reschedule(id, fecha_hora),
    onSuccess: () => {
      toast.success('Cita reagendada')
      // Invalidar todas las queries relacionadas para forzar refresh
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      queryClient.invalidateQueries({ queryKey: ['appointments', 'detail', String(id)] })
      queryClient.invalidateQueries({ queryKey: ['availability'] })
      // Forzar refetch inmediato de disponibilidad
      queryClient.refetchQueries({ queryKey: ['availability'] })
    },
    onError: (error: AxiosError<ValidationErrorResponse>) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export const useServicesQuery = () =>
  useQuery({
    queryKey: ['appointment-services'],
    queryFn: appointmentService.services,
    staleTime: 5 * 60 * 1000,
  })

export const useAvailabilityQuery = (veterinarioId?: number | string, fecha?: string) =>
  useQuery({
    queryKey: ['availability', veterinarioId, fecha],
    queryFn: () => appointmentService.availability(veterinarioId!, fecha!),
    enabled: Boolean(veterinarioId && fecha),
  })

export const useVeterinariansQuery = () =>
  useQuery({
    queryKey: ['veterinarians'],
    queryFn: async () => {
      const response = await userService.list({ rol: 'veterinario', estado: 'activo' })
      const list = response?.results ?? []
      return list.map((usuario) => ({
        id: usuario.id,
        nombre: usuario.nombre && usuario.apellido ? `${usuario.nombre} ${usuario.apellido}` : usuario.username,
      }))
    },
    staleTime: 5 * 60 * 1000,
  })

export const useAppointmentsAvailableForInvoiceQuery = (enabled = true) =>
  useQuery({
    queryKey: ['appointments', 'available-for-invoice'],
    queryFn: appointmentService.availableForInvoice,
    enabled,
    retry: 1,
    staleTime: 30 * 1000, // 30 segundos
    onError: (error) => {
      console.error('Error al cargar citas disponibles para facturar:', error)
    },
  })