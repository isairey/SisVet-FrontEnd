import { useState } from 'react'
import { PlusCircle, Pencil, Trash2, Award } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useBrandsConfigQuery, useBrandConfigCreateMutation, useBrandConfigUpdateMutation, useBrandConfigDeleteMutation } from '@/hooks/clinic-config'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const brandSchema = z.object({
  descripcion: z.string().min(1, 'La descripción es requerida').max(100, 'La descripción no puede exceder 100 caracteres'),
})

type BrandFormValues = z.infer<typeof brandSchema>

export const BrandsConfigTab = () => {
  const { data: brands, isLoading } = useBrandsConfigQuery()
  const createModal = useDisclosure()
  const editModal = useDisclosure()
  const deleteModal = useDisclosure()
  const [selectedBrand, setSelectedBrand] = useState<{ id: number; descripcion: string } | null>(null)

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: { descripcion: '' },
  })

  const editForm = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: { descripcion: '' },
  })

  const createMutation = useBrandConfigCreateMutation()
  const updateMutation = useBrandConfigUpdateMutation()
  const deleteMutation = useBrandConfigDeleteMutation()

  const handleCreate = async (values: BrandFormValues) => {
    try {
      await createMutation.mutateAsync({ descripcion: values.descripcion })
      form.reset()
      createModal.close()
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleEdit = (brand: { id: number; descripcion: string }) => {
    setSelectedBrand(brand)
    editForm.reset({ descripcion: brand.descripcion })
    editModal.open()
  }

  const handleUpdate = async (values: BrandFormValues) => {
    if (!selectedBrand) return
    try {
      await updateMutation.mutateAsync({
        id: selectedBrand.id,
        payload: { descripcion: values.descripcion },
      })
      editModal.close()
      setSelectedBrand(null)
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleDelete = (brand: { id: number; descripcion: string }) => {
    setSelectedBrand(brand)
    deleteModal.open()
  }

  const confirmDelete = async () => {
    if (!selectedBrand) return
    try {
      await deleteMutation.mutateAsync(selectedBrand.id)
      deleteModal.close()
      setSelectedBrand(null)
    } catch (error) {
      // Error handled by mutation
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-text-heading)]">Marcas de Productos</h2>
          <p className="text-sm text-[var(--color-text-muted)]">Gestiona las marcas disponibles para los productos del inventario</p>
        </div>
        <Button startIcon={<PlusCircle size={16} />} onClick={createModal.open}>
          Nueva Marca
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : brands && brands.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left">
            <thead>
              <tr className="text-sm uppercase tracking-wide text-subtle">
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle-color)' }}>
              {brands.map((brand) => (
                <tr
                  key={brand.id}
                  className="text-sm text-secondary hover:bg-[var(--color-surface-200)]/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                        <Award size={16} />
                      </div>
                      <span className="font-semibold text-heading">{brand.descripcion}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(brand)}
                        className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(brand)}
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
          <Award size={48} className="mx-auto mb-4 opacity-40" />
          <p>No hay marcas registradas</p>
        </div>
      )}

      {/* Modal Crear */}
      <Modal isOpen={createModal.isOpen} onClose={createModal.close} title="Nueva Marca" size="md">
        <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
          <Input
            label="Nombre de la Marca"
            placeholder="Ej: Royal Canin, Hill's"
            {...form.register('descripcion')}
            error={form.formState.errors.descripcion?.message}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={createModal.close}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creando...' : 'Crear Marca'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar */}
      <Modal isOpen={editModal.isOpen} onClose={editModal.close} title="Editar Marca" size="md">
        <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
          <Input
            label="Nombre de la Marca"
            placeholder="Ej: Royal Canin, Hill's"
            {...editForm.register('descripcion')}
            error={editForm.formState.errors.descripcion?.message}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={editModal.close}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Actualizando...' : 'Actualizar Marca'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Eliminar */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.close} title="Confirmar Eliminación" size="md">
        <div className="space-y-4">
          <p className="text-[var(--color-text-secondary)]">
            ¿Estás seguro de que deseas eliminar la marca <strong>{selectedBrand?.descripcion}</strong>?
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

