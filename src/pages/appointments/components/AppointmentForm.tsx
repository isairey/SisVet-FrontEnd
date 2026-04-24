import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { PawPrint, User, Scissors, Clock, FileText, Plus } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { usePetsQuery } from '@/hooks/pets'
import {
  useAppointmentCreateMutation,
  useServicesQuery,
  useVeterinariansQuery,
} from '@/hooks/appointments'
import { AvailabilityPicker } from '@/pages/appointments/components/AvailabilityPicker'
import type { AppointmentPayload } from '@/api/types/appointments'

const schema = z.object({
  mascota_id: z.string().min(1, 'Selecciona una mascota'),
  veterinario_id: z.string().min(1, 'Selecciona un veterinario'),
  servicio_id: z.string().min(1, 'Selecciona un servicio'),
  fecha_hora: z.string().min(1, 'Selecciona un horario'),
  observaciones: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export const AppointmentForm = () => {
  const navigate = useNavigate()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      mascota_id: '',
      veterinario_id: '',
      servicio_id: '',
      fecha_hora: '',
      observaciones: '',
    },
  })

  // Filtros memoizados para pets (opcionalmente vacío para traer todos)
  const petsFilters = useMemo(() => ({ search: '', especie: null as number | null }), [])
  const petsQuery = usePetsQuery(petsFilters)
  
  const { data: services, isLoading: servicesLoading } = useServicesQuery()
  const { data: veterinarios, isLoading: vetsLoading } = useVeterinariansQuery()
  
  const mutation = useAppointmentCreateMutation()
  
  // Watchers para estado del formulario
  const selectedMascota = form.watch('mascota_id')
  const selectedVeterinario = form.watch('veterinario_id')
  const selectedServicio = form.watch('servicio_id')
  const selectedFecha = form.watch('fecha_hora')

  // Resetear el horario si cambia el veterinario (porque su disponibilidad es distinta)
  useEffect(() => {
    form.setValue('fecha_hora', '')
  }, [selectedVeterinario, form])

  const onSubmit = async (values: FormValues) => {
    const payload: AppointmentPayload = {
      mascota_id: parseInt(values.mascota_id),
      veterinario_id: parseInt(values.veterinario_id),
      servicio_id: parseInt(values.servicio_id),
      fecha_hora: values.fecha_hora,
      observaciones: values.observaciones,
    }
    
    await mutation.mutateAsync(payload)
    form.reset()
    // Redirigir a la lista de citas después de crear exitosamente
    navigate('/app/citas')
  }

  const selectedService = Array.isArray(services) ? services.find((s) => s.id === Number(selectedServicio)) : undefined

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* SECCIÓN INFORMACIÓN BÁSICA */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-xl bg-[var(--color-primary)]/10 p-2 text-[var(--color-primary)]">
            <PawPrint size={18} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Información básica</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Selector de Mascota */}
          <label className="space-y-2 text-sm text-[var(--color-text-heading)]">
            <div className="flex items-center justify-between">
              <span className="font-medium">Mascota *</span>
              <Link to="/app/mascotas/nueva" className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1">
                <Plus size={12} /> Añadir mascota
              </Link>
            </div>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30"
              value={selectedMascota}
              onChange={(event) => form.setValue('mascota_id', event.target.value)}
            >
              <option value="">Selecciona una mascota</option>
              {petsQuery.data?.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.nombre}
                </option>
              ))}
            </select>
            {form.formState.errors.mascota_id && (
              <p className="text-xs text-red-600">{form.formState.errors.mascota_id.message}</p>
            )}
          </label>

          {/* Selector de Veterinario */}
          <label className="space-y-2 text-sm text-[var(--color-text-heading)]">
            <span className="font-medium">Veterinario *</span>
            {vetsLoading ? (
              <div className="flex min-h-[42px] items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5">
                <Spinner size="sm" />
              </div>
            ) : (
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30"
                value={selectedVeterinario}
                onChange={(event) => form.setValue('veterinario_id', event.target.value)}
              >
                <option value="">Selecciona un veterinario</option>
                {(veterinarios ?? []).map((vet) => (
                  <option key={vet.id} value={vet.id}>
                    {vet.nombre}
                  </option>
                ))}
              </select>
            )}
            {form.formState.errors.veterinario_id && (
              <p className="text-xs text-red-600">{form.formState.errors.veterinario_id.message}</p>
            )}
          </label>
        </div>

        {/* Selector de Servicio */}
        <div className="mt-4">
          <label className="space-y-2 text-sm text-[var(--color-text-heading)]">
            <span className="font-medium">Servicio *</span>
            {servicesLoading ? (
              <div className="flex min-h-[42px] items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5">
                <Spinner size="sm" />
              </div>
            ) : (
              <select
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30"
                value={selectedServicio}
                onChange={(event) => form.setValue('servicio_id', event.target.value)}
              >
                <option value="">Selecciona un servicio</option>
                {(Array.isArray(services) ? services : []).map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.nombre} - ${Number(service.costo).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </option>
                ))}
              </select>
            )}
            {form.formState.errors.servicio_id && (
              <p className="text-xs text-red-600">{form.formState.errors.servicio_id.message}</p>
            )}
          </label>
          
          {selectedService && (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <div className="flex items-center gap-2">
                <Scissors size={16} className="text-emerald-600" />
                <p className="text-sm font-semibold text-emerald-900">Costo del servicio:</p>
                <p className="text-base font-bold text-emerald-700">
                  ${Number(selectedService.costo).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN HORARIO */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-xl bg-blue-100 p-2 text-blue-600">
            <Clock size={18} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Horario disponible</h3>
        </div>
        
        {!selectedVeterinario ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center">
            <Clock size={32} className="mx-auto mb-3 text-gray-400" />
            <p className="text-sm text-gray-600">Selecciona un veterinario para ver horarios disponibles</p>
          </div>
        ) : (
          <div className="rounded-xl bg-[var(--color-surface-200)] p-4 border border-gray-200">
            <AvailabilityPicker
              veterinarioId={selectedVeterinario}
              value={selectedFecha}
              onChange={(datetime) => form.setValue('fecha_hora', datetime)}
            />
            {form.formState.errors.fecha_hora && (
              <p className="mt-3 text-xs text-red-600">{form.formState.errors.fecha_hora.message}</p>
            )}
          </div>
        )}
      </div>

      {/* SECCIÓN OBSERVACIONES */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-xl bg-purple-100 p-2 text-purple-600">
            <FileText size={18} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Observaciones (opcional)</h3>
        </div>
        <Input
          placeholder="Motivo de la consulta, información adicional para el veterinario..."
          {...form.register('observaciones')}
          error={form.formState.errors.observaciones?.message}
        />
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={() => form.reset()}
        >
          Limpiar formulario
        </Button>
        <Button type="submit" disabled={form.formState.isSubmitting || mutation.isPending}>
          {form.formState.isSubmitting || mutation.isPending ? 'Agendando...' : 'Agendar cita'}
        </Button>
      </div>
    </form>
  )
}
