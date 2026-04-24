import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useMemo } from 'react'

import { PlusCircle, X, Pill, FileText, Syringe, PawPrint, Info, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner' 
import { Card } from '@/components/ui/Card'

import { 
  useConsultationCreateMutation, useConsultationUpdateMutation,useConsultationDetailQuery  } from '@/hooks/consultations'
import { usePetsQuery } from '@/hooks/pets'
import { useProductsQuery } from '@/hooks/inventory'
import { useProfileQuery } from '@/hooks/auth'

interface Product {
  id: number
  nombre: string
  stock?: number
}

const schema = z.object({
  mascota: z.string().min(1, 'Selecciona una mascota'),
  fecha_consulta: z.string().min(1, 'Selecciona una fecha'),
  descripcion_consulta: z.string().min(10, 'Describe la consulta'),
  diagnostico: z.string().min(4, 'Ingrese un diagnóstico'),
  notas_adicionales: z.string().optional(),
  servicio: z.string().optional(),
  cita: z.string().optional(),

  prescripciones: z
    .array(
      z.object({
        medicamento: z.string().min(1, 'Selecciona un medicamento'),
        cantidad: z.string().min(1, 'Indique la cantidad'),        
        indicaciones: z.string().min(1, 'Escriba las indicaciones'),
      }),
    )
    .optional(),
    
  examenes: z
    .array(
      z.object({
        tipo_examen: z.string().min(1, 'Selecciona un tipo de examen'),
        descripcion: z.string().optional(),
      }),
    )
    .optional(),
    
  vacunas: z.object({
    estado: z.string().min(1, 'Selecciona el estado de vacunación'),
    vacunas_descripcion: z.string().optional(),
  }).optional(),
}).refine((data) => {
  if (data.vacunas?.estado === 'PENDIENTE' || data.vacunas?.estado === 'EN_PROCESO') {
    return !!data.vacunas?.vacunas_descripcion && data.vacunas.vacunas_descripcion.trim().length > 0
  }
  return true
}, {
  message: 'Debe especificar las vacunas cuando el estado es Pendiente o En proceso',
  path: ['vacunas', 'vacunas_descripcion']
})

type FormValues = z.infer<typeof schema>

const TIPOS_EXAMEN = [
  { value: 'HEMOGRAMA', label: 'Hemograma completo' },
  { value: 'QUIMICA_SANGUINEA', label: 'Química sanguínea' },
  { value: 'URINALISIS', label: 'Urianálisis' },
  { value: 'COPROLOGICO', label: 'Coprológico' },
  { value: 'RAYOS_X', label: 'Rayos X' },
  { value: 'ECOGRAFIA', label: 'Ecografía' },
  { value: 'CITOLOGIA', label: 'Citología' },
  { value: 'BIOPSIA', label: 'Biopsia' },
  { value: 'ELECTROCARDIOGRAMA', label: 'Electrocardiograma' },
  { value: 'OTRO', label: 'Otro' },
]

const ESTADOS_VACUNACION = [
  { value: 'AL_DIA', label: 'Al día' },
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'EN_PROCESO', label: 'En proceso' },
  { value: 'NINGUNA', label: 'Ninguna' },
]

export const ConsultationForm = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id

  const { data: consultationData, isLoading: isLoadingConsultation } = useConsultationDetailQuery(
  id || '',  // ← Aseguramos que siempre sea string
  { enabled: isEditing }
)

  const preMascotaId = searchParams.get('mascota') || ''
  const preServicioId = searchParams.get('servicio') || ''
  const preCitaId = searchParams.get('cita') || ''
  const preNombreServicio = searchParams.get('nombre_servicio') || ''

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      mascota: preMascotaId,
      servicio: preServicioId,
      cita: preCitaId,
      fecha_consulta: new Date().toISOString().slice(0, 10),
      descripcion_consulta: '',
      diagnostico: '',
      notas_adicionales: '',
      prescripciones: [],
      examenes: [],
      vacunas: {
        estado: '',
        vacunas_descripcion: '',
      },
    },
  })

useEffect(() => {
  if (isEditing && consultationData) {
    const data = consultationData as any; // Cast temporal
    
    form.reset({
      mascota: data?.mascota ? String(data.mascota) : '',
      servicio: data?.servicio_id ? String(data.servicio_id) : '',
      cita: data?.cita_id ? String(data.cita_id) : '',
      fecha_consulta: data?.fecha_consulta 
        ? data.fecha_consulta.split('T')[0]
        : new Date().toISOString().slice(0, 10),
      descripcion_consulta: data?.descripcion_consulta || '',
      diagnostico: data?.diagnostico || '',
      notas_adicionales: data?.notas_adicionales || '',
      prescripciones: Array.isArray(data?.prescripciones)
        ? data.prescripciones.map((p: any) => ({
            medicamento: p?.producto_id ? String(p.producto_id) : (p?.medicamento ? String(p.medicamento) : ''),
            cantidad: p?.cantidad ? String(p.cantidad) : '',
            indicaciones: p?.indicaciones || '',
          }))
        : [],
      examenes: Array.isArray(data?.examenes)
        ? data.examenes.map((e: any) => ({
            tipo_examen: e?.tipo_examen || '',
            descripcion: e?.descripcion || '',
          }))
        : [],
      vacunas: {
        estado: data?.vacunas?.estado || '',
        vacunas_descripcion: data?.vacunas?.vacunas_descripcion || '',
      },
    })
  }
}, [isEditing, consultationData, form])


  const {
    fields: prescriptionFields,
    append: addPrescription,
    remove: removePrescription,
  } = useFieldArray({
    control: form.control,
    name: 'prescripciones',
  })

  const {
    fields: examenFields,
    append: addExamen,
    remove: removeExamen,
  } = useFieldArray({
    control: form.control,
    name: 'examenes',
  })

  const { data: pets } = usePetsQuery({ search: '', especie: null })

  const { data: productsData, isLoading: isLoadingProducts } = useProductsQuery()

  const productos: Product[] = Array.isArray(productsData)
    ? productsData
    : (productsData as any)?.results || []

  // Obtener el perfil del usuario actual para validar que tenga licencia y especialidad
  const { data: userProfile } = useProfileQuery()

  const mutation = useConsultationCreateMutation()
  const updateMutation = useConsultationUpdateMutation()

  // Validar que el veterinario tenga licencia y especialidad
  const canCreateConsultation = useMemo(() => {
    if (!userProfile?.perfil_veterinario) {
      return false
    }
    const vetProfile = userProfile.perfil_veterinario
    return Boolean(vetProfile.licencia && vetProfile.licencia.trim() !== '' && 
                   vetProfile.especialidad && vetProfile.especialidad.trim() !== '')
  }, [userProfile])

  // Limpiar vacunas_descripcion cuando el estado es AL_DIA o NINGUNA
  const estadoVacunas = form.watch('vacunas.estado')
  useEffect(() => {
    if (estadoVacunas === 'AL_DIA' || estadoVacunas === 'NINGUNA') {
      form.setValue('vacunas.vacunas_descripcion', '')
    }
  }, [estadoVacunas, form])

  const onSubmit = async (values: FormValues) => {
    // Validar que el veterinario tenga licencia y especialidad antes de crear la consulta
    if (!canCreateConsultation) {
      form.setError('root', {
        type: 'manual',
        message: 'No puedes generar consultas. Tu perfil de veterinario debe tener licencia y especialidad registradas.',
      })
      return
    }

    const payload = {
      mascota: Number(values.mascota),
      fecha_consulta: values.fecha_consulta.includes('T')
      ? values.fecha_consulta.split('T')[0]
      : values.fecha_consulta, 
      descripcion_consulta: values.descripcion_consulta,
      diagnostico: values.diagnostico,
      notas_adicionales: values.notas_adicionales,
      servicio: values.servicio ? Number(values.servicio) : null,
      cita: values.cita ? Number(values.cita) : null,
      
      prescripciones: values.prescripciones?.map((pres) => ({
        medicamento: pres.medicamento ? Number(pres.medicamento) : null,
        cantidad: Number(pres.cantidad),
        indicaciones: pres.indicaciones,
      })),
      
      examenes: values.examenes?.map((examen) => ({
        tipo_examen: examen.tipo_examen,
        descripcion: examen.descripcion || '',
      })),
      
      vacunas: values.vacunas?.estado ? {
        estado: values.vacunas.estado,
        vacunas_descripcion: values.vacunas.vacunas_descripcion || '',
      } : undefined
    }  

try {
    if (isEditing && id) {
      await updateMutation.mutateAsync({ id: Number(id), data: payload as any })
    } else {
      await mutation.mutateAsync(payload as any)
    }
    
    form.reset()
    navigate('/app/historias')
  } catch (error: any) {
    console.error('Error:', error)
    console.error('Respuesta del servidor:', error.response?.data)
  }
}

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      
      <input type="hidden" {...form.register('cita')} />
      <input type="hidden" {...form.register('servicio')} />

      {/* Alerta si el veterinario no tiene licencia y especialidad */}
      {!canCreateConsultation && !isEditing && (
        <Card className="border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900">No puedes generar consultas</p>
              <p className="text-sm text-red-700 mt-1">
                Tu perfil de veterinario debe tener licencia y especialidad registradas. 
                Por favor, actualiza tu perfil en la sección de usuarios.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Mostrar error del formulario si existe */}
      {form.formState.errors.root && (
        <Card className="border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{form.formState.errors.root.message}</p>
          </div>
        </Card>
      )}

      {/* --- SECCIÓN DATOS GENERALES --- */}
{preCitaId && (
        <Card className="border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900">Atendiendo cita</p>
              <p className="text-sm text-blue-700">
                Se ha seleccionado automáticamente la mascota y el servicio 
                {preNombreServicio ? ` (${preNombreServicio})` : ''}.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className="rounded-xl bg-[var(--color-primary)]/10 p-2 text-[var(--color-primary)]">
          <PawPrint size={18} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Datos Generales</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-[var(--color-text-heading)]">
          <span className="font-medium">Mascota *</span>
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30 disabled:opacity-70 disabled:bg-gray-100"
            disabled={!!preMascotaId}
            value={form.watch('mascota')}
            onChange={(event) => form.setValue('mascota', event.target.value)}
          >
            <option value="">Selecciona una mascota</option>
            {pets?.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.nombre}
              </option>
            ))}
          </select>
          {form.formState.errors.mascota && (
            <p className="text-xs text-red-600">{form.formState.errors.mascota.message}</p>
          )}
        </label>

        <Input
          type="date"
          label="Fecha de consulta *"
          {...form.register('fecha_consulta')}
          error={form.formState.errors.fecha_consulta?.message}
        />
      </div>

      <div className="mt-4">
        <Input
          label="Descripción *"
          placeholder="Motivo de la consulta, síntomas observados..."
          {...form.register('descripcion_consulta')}
          error={form.formState.errors.descripcion_consulta?.message}
        />
      </div>

      <div className="mt-4">
        <Input
          label="Diagnóstico *"
          placeholder="Resultado principal de la consulta"
          {...form.register('diagnostico')}
          error={form.formState.errors.diagnostico?.message}
        />
      </div>

            {/* --- SECCIÓN VACUNAS --- */}
      <div className="flex items-center gap-3 mb-6 pt-6 border-t border-gray-100">
        <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
          <Syringe size={18} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Estado de Vacunación</h3>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-900">Estado *</label>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {ESTADOS_VACUNACION.map((estado) => (
              <label
                key={estado.value}
                className={`flex cursor-pointer items-center justify-center rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                  form.watch('vacunas.estado') === estado.value
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-[var(--color-primary)]/50'
                }`}
              >
                <input
                  type="radio"
                  value={estado.value}
                  {...form.register('vacunas.estado')}
                  className="sr-only"
                />
                {estado.label}
              </label>
            ))}
          </div>
          {form.formState.errors.vacunas?.estado && (
            <p className="mt-2 text-xs text-red-600">{form.formState.errors.vacunas.estado.message}</p>
          )}
        </div>

        {(form.watch('vacunas.estado') === 'PENDIENTE' || form.watch('vacunas.estado') === 'EN_PROCESO') && (
          <div>
            <label className="space-y-2 text-sm text-[var(--color-text-heading)]">
              <span className="font-medium">Descripción de vacunas *</span>
              <textarea
                className="min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                {...form.register('vacunas.vacunas_descripcion')}
                placeholder="Especifique las vacunas pendientes o en proceso..."
              />
              {form.formState.errors.vacunas?.vacunas_descripcion && (
                <p className="text-xs text-red-600">{form.formState.errors.vacunas.vacunas_descripcion.message}</p>
              )}
            </label>
          </div>
        )}

        {(form.watch('vacunas.estado') === 'AL_DIA' || form.watch('vacunas.estado') === 'NINGUNA') && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-sm text-gray-700">
              {form.watch('vacunas.estado') === 'AL_DIA' 
                ? '✓ La mascota tiene sus vacunas al día.' 
                : 'No se han aplicado vacunas.'}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-6 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-100 p-2 text-blue-600">
            <Pill size={18} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Prescripciones</h3>
        </div>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm"
          startIcon={<PlusCircle size={16} />}
          onClick={() => addPrescription({ medicamento: '', cantidad: '', indicaciones: '' })}
        >
          Agregar
        </Button>
      </div>
      
      {prescriptionFields.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center">
          <Pill size={32} className="mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-600">No se han agregado prescripciones</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptionFields.map((field, index) => (
            <div key={field.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-900">Prescripción #{index + 1}</p>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  startIcon={<X size={14} />}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removePrescription(index)}
                >
                  Eliminar
                </Button>
              </div>
              
              <div className="space-y-4">
                <label className="space-y-2 text-sm text-[var(--color-text-heading)]">
                  <span className="font-medium">Medicamento *</span>
                  {isLoadingProducts ? (
                    <div className="flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5">
                      <Spinner size="sm" />
                    </div>
                  ) : (
                    <select
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30"
                      {...form.register(`prescripciones.${index}.medicamento`)}
                    >
                      <option value="">Selecciona un medicamento</option>
                      {Array.isArray(productos) && productos.map((prod) => (
                        <option key={prod.id} value={String(prod.id)}>
                          {prod.nombre} {prod.stock !== undefined ? `(Stock: ${prod.stock})` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                  {form.formState.errors.prescripciones?.[index]?.medicamento && (
                    <p className="text-xs text-red-600">
                      {form.formState.errors.prescripciones[index]?.medicamento?.message}
                    </p>
                  )}
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input 
                    type="number" 
                    label="Cantidad *" 
                    min="1"
                    placeholder="Ej: 10"
                    {...form.register(`prescripciones.${index}.cantidad`)}
                    error={form.formState.errors.prescripciones?.[index]?.cantidad?.message}
                  />
                  <Input 
                    label="Indicaciones *" 
                    placeholder="Ej: 1 cada 8 horas, con comida..."
                    {...form.register(`prescripciones.${index}.indicaciones`)}
                    error={form.formState.errors.prescripciones?.[index]?.indicaciones?.message}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- SECCIÓN EXÁMENES --- */}
      <div className="flex items-center justify-between mb-6 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-purple-100 p-2 text-purple-600">
            <FileText size={18} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Exámenes</h3>
        </div>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm"
          startIcon={<PlusCircle size={16} />}
          onClick={() => addExamen({ tipo_examen: '', descripcion: '' })}
        >
          Agregar
        </Button>
      </div>
      
      {examenFields.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center">
          <FileText size={32} className="mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-600">No se han agregado exámenes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {examenFields.map((field, index) => (
            <div key={field.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-900">Examen #{index + 1}</p>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  startIcon={<X size={14} />}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => removeExamen(index)}
                >
                  Eliminar
                </Button>
              </div>
              
              <div className="space-y-4">
                <label className="space-y-2 text-sm text-[var(--color-text-heading)]">
                  <span className="font-medium">Tipo de examen *</span>
                  <select
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30"
                    {...form.register(`examenes.${index}.tipo_examen`)}
                  >
                    <option value="">Selecciona un tipo de examen</option>
                    {TIPOS_EXAMEN.map((tipo) => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.examenes?.[index]?.tipo_examen && (
                    <p className="text-xs text-red-600">
                      {form.formState.errors.examenes[index]?.tipo_examen?.message}
                    </p>
                  )}
                </label>
                
                <Input 
                  label="Descripción adicional" 
                  placeholder="Detalles específicos del examen..."
                  {...form.register(`examenes.${index}.descripcion`)} 
                />
              </div>
            </div>
          ))}
        </div>
      )}

            <div className="mt-4">
        <label className="space-y-2 text-sm text-[var(--color-text-heading)]">
          <span className="font-medium">Notas adicionales</span>
          <textarea
            className="min-h-[100px] w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
            {...form.register('notas_adicionales')}
            placeholder="Tratamiento recomendado, observaciones adicionales..."
          />
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={() => navigate('/app/consultas')}
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={form.formState.isSubmitting || mutation.isPending || (!canCreateConsultation && !isEditing)}
        >
          {form.formState.isSubmitting || mutation.isPending || updateMutation.isPending
          ? 'Guardando...' 
          : isEditing 
            ? 'Actualizar consulta' 
            : 'Registrar consulta'}
        </Button>
      </div>
    </form>
  )
}