import { useState } from 'react'
import { PlusCircle, Pencil, Trash2, DollarSign, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useServicesQuery, useServiceCreateMutation, useServiceUpdateMutation, useServiceDeleteMutation } from '@/hooks/clinic-config'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const serviceSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
  costo: z.string().refine((val) => {
    const num = Number(val)
    return !isNaN(num) && num >= 0
  }, 'El costo debe ser un número válido mayor o igual a 0'),
})

type ServiceFormValues = z.infer<typeof serviceSchema>

export const ServicesConfigTab = () => {
  const { data: services, isLoading } = useServicesQuery()
  const createModal = useDisclosure()
  const editModal = useDisclosure()
  const deleteModal = useDisclosure()
  const [selectedService, setSelectedService] = useState<{ id: number; nombre: string; costo: string | number } | null>(null)

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { nombre: '', costo: '0' },
  })

  const editForm = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { nombre: '', costo: '0' },
  })

  const createMutation = useServiceCreateMutation()
  const updateMutation = useServiceUpdateMutation()
  const deleteMutation = useServiceDeleteMutation()

  const handleCreate = async (values: ServiceFormValues) => {
    try {
      await createMutation.mutateAsync({
        nombre: values.nombre,
        costo: Number(values.costo),
      })
      form.reset()
      createModal.close()
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleEdit = (service: { id: number; nombre: string; costo: string | number }) => {
    setSelectedService(service)
    editForm.reset({
      nombre: service.nombre,
      costo: String(service.costo),
    })
    editModal.open()
  }

  const handleUpdate = async (values: ServiceFormValues) => {
    if (!selectedService) return
    try {
      await updateMutation.mutateAsync({
        id: selectedService.id,
        payload: {
          nombre: values.nombre,
          costo: Number(values.costo),
        },
      })
      editModal.close()
      setSelectedService(null)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleDelete = (service: { id: number; nombre: string }) => {
    setSelectedService(service)
    deleteModal.open()
  }

  const confirmDelete = async () => {
    if (!selectedService) return
    try {
      await deleteMutation.mutateAsync(selectedService.id)
      deleteModal.close()
      setSelectedService(null)
    } catch (error) {
      // Error handled by mutation
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-text-heading)]">Servicios</h2>
          <p className="text-sm text-[var(--color-text-muted)]">Gestiona los servicios disponibles de la clínica y sus precios</p>
        </div>
        <Button startIcon={<PlusCircle size={16} />} onClick={createModal.open}>
          Nuevo Servicio
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : services && services.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="text-sm uppercase tracking-wide text-subtle">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Costo</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle-color)' }}>
              {services.map((service) => (
                <tr
                  key={service.id}
                  className="text-sm text-secondary hover:bg-[var(--color-surface-200)]/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-heading">{service.nombre}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-[var(--color-primary)]" />
                      <span className="font-semibold text-heading">
                        ${Number(service.costo).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(service)}
                        className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(service)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 text-[var(--color-text-muted)]">
          <Briefcase size={48} className="mx-auto mb-4 opacity-40" />
          <p>No hay servicios registrados</p>
        </div>
      )}

      {/* Modal Crear */}
      <Modal isOpen={createModal.isOpen} onClose={createModal.close} title="Nuevo Servicio" size="md">
        <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
          <Input
            label="Nombre del Servicio"
            placeholder="Ej: Consulta General"
            {...form.register('nombre')}
            error={form.formState.errors.nombre?.message}
          />
          <Input
            label="Costo"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...form.register('costo')}
            error={form.formState.errors.costo?.message}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={createModal.close}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creando...' : 'Crear Servicio'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar */}
      <Modal isOpen={editModal.isOpen} onClose={editModal.close} title="Editar Servicio" size="md">
        <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
          <Input
            label="Nombre del Servicio"
            placeholder="Ej: Consulta General"
            {...editForm.register('nombre')}
            error={editForm.formState.errors.nombre?.message}
          />
          <Input
            label="Costo"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...editForm.register('costo')}
            error={editForm.formState.errors.costo?.message}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={editModal.close}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Actualizando...' : 'Actualizar Servicio'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Eliminar */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.close} title="Confirmar Eliminación" size="md">
        <div className="space-y-4">
          <p className="text-[var(--color-text-secondary)]">
            ¿Estás seguro de que deseas eliminar el servicio <strong>{selectedService?.nombre}</strong>?
          </p>
          <p className="text-sm text-red-600">Esta acción no se puede deshacer.</p>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={deleteModal.close}>
              Cancelar
            </Button>
            <Button type="button" variant="danger" onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

