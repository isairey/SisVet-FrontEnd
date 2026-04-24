import { CreditCard, Wallet, Plus, X, Edit, Trash2, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { usePaymentMethodsQuery, usePaymentMethodCreateMutation, usePaymentMethodUpdateMutation, usePaymentMethodDeleteMutation } from '@/hooks/billing/usePayments'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { PaymentMethod } from '@/api/types/billing'

const paymentMethodSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(50, 'El nombre no puede exceder 50 caracteres'),
  codigo: z.string().min(1, 'El código es requerido').max(30, 'El código no puede exceder 30 caracteres'),
})

type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>

export const PaymentMethodsConfigTab = () => {
  const { data: paymentMethods, isLoading, error } = usePaymentMethodsQuery()
  const createMutation = usePaymentMethodCreateMutation()
  const updateMutation = usePaymentMethodUpdateMutation()
  const deleteMutation = usePaymentMethodDeleteMutation()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; nombre: string } | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      nombre: '',
      codigo: '',
    },
  })

  const onSubmit = async (values: PaymentMethodFormValues) => {
    try {
      await createMutation.mutateAsync(values)
      reset()
      setShowForm(false)
    } catch (error) {
      // El error ya se maneja en el hook
    }
  }

  const onEdit = (method: PaymentMethod) => {
    setEditingId(method.id)
    reset({
      nombre: method.nombre,
      codigo: method.codigo,
    })
  }

  const onUpdate = async (id: number, values: PaymentMethodFormValues) => {
    try {
      await updateMutation.mutateAsync({ id, payload: values })
      setEditingId(null)
      reset()
    } catch (error) {
      // El error ya se maneja en el hook
    }
  }

  const onDeleteClick = (id: number, nombre: string) => {
    setDeleteConfirm({ id, nombre })
  }

  const onDeleteConfirm = async () => {
    if (!deleteConfirm) return
    try {
      await deleteMutation.mutateAsync(deleteConfirm.id)
      setDeleteConfirm(null)
    } catch (error) {
      // El error ya se maneja en el hook
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[var(--color-text-heading)]">Métodos de Pago</h2>
          <p className="text-sm text-[var(--color-text-muted)]">Gestiona los métodos de pago disponibles en el sistema</p>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            startIcon={<Plus size={18} />}
            className="w-full sm:w-auto"
          >
            Agregar método de pago
          </Button>
        )}
      </div>

      {/* Formulario de creación */}
      {showForm && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[var(--color-text-heading)]">Nuevo método de pago</h3>
            <Button
              variant="ghost"
              onClick={() => {
                setShowForm(false)
                reset()
              }}
              startIcon={<X size={18} />}
            >
              Cancelar
            </Button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Nombre"
                placeholder="Ej: EFECTIVO, TARJETA, TRANSFERENCIA"
                {...register('nombre')}
                error={errors.nombre?.message}
              />
              <Input
                label="Código"
                placeholder="Ej: 1, PSE, PAYU"
                {...register('codigo')}
                error={errors.codigo?.message}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle-color)' }}>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowForm(false)
                  reset()
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creando...' : 'Crear método de pago'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-600">
          <Wallet size={48} className="mx-auto mb-4 opacity-40" />
          <p>Error al cargar métodos de pago</p>
          <p className="text-sm text-[var(--color-text-muted)] mt-2">
            {error instanceof Error ? error.message : 'Error desconocido'}
          </p>
        </div>
      ) : paymentMethods && Array.isArray(paymentMethods) && paymentMethods.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paymentMethods.map((method) => (
            <Card key={method.id} className="p-5 transition-all hover:shadow-lg" style={{ boxShadow: 'var(--shadow-card)' }}>
              {editingId === method.id ? (
                <form
                  onSubmit={handleSubmit((values) => onUpdate(method.id, values))}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-black">Editar método de pago</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(null)
                        reset()
                      }}
                      startIcon={<X size={16} />}
                    >
                      Cancelar
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <Input
                      label="Nombre"
                      placeholder="Ej: EFECTIVO, TARJETA, TRANSFERENCIA"
                      {...register('nombre')}
                      error={errors.nombre?.message}
                    />
                    <Input
                      label="Código"
                      placeholder="Ej: 1, PSE, PAYU"
                      {...register('codigo')}
                      error={errors.codigo?.message}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--border-subtle-color)' }}>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(null)
                        reset()
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={updateMutation.isPending}
                      className="bg-[var(--color-secondary)] text-white hover:opacity-90 focus-visible:outline-[var(--color-secondary)]"
                    >
                      {updateMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-primary)]/10 text-[var(--color-primary)] flex-shrink-0">
                      <CreditCard size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-black mb-1">{method.nombre}</h3>
                      {method.codigo && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-surface-200)]">
                          <span className="text-xs font-medium text-[var(--color-text-muted)]">Código:</span>
                          <span className="text-sm font-semibold text-[var(--color-text-heading)]">{method.codigo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-3 border-t" style={{ borderColor: 'var(--border-subtle-color)' }}>
                    <Button
                      variant="ghost"
                      onClick={() => onEdit(method)}
                      startIcon={<Edit size={16} />}
                      className="text-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/10 border border-[var(--color-secondary)]/20"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => onDeleteClick(method.id, method.nombre)}
                      startIcon={<Trash2 size={16} />}
                      className="text-red-600 hover:bg-red-50 border border-red-200"
                      disabled={deleteMutation.isPending}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-[var(--color-text-muted)]">
          <Wallet size={48} className="mx-auto mb-4 opacity-40" />
          <p>No hay métodos de pago registrados</p>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirmar eliminación"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-100 text-red-600 flex-shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-[var(--color-text-secondary)]">
                ¿Estás seguro de que deseas eliminar el método de pago <strong className="text-black">"{deleteConfirm?.nombre}"</strong>?
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-2">
                Esta acción no se puede deshacer.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--border-subtle-color)' }}>
            <Button
              variant="ghost"
              onClick={() => setDeleteConfirm(null)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={onDeleteConfirm}
              disabled={deleteMutation.isPending}
              startIcon={<Trash2 size={16} />}
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

