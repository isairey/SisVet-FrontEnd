import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PackageSearch } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { useProductsQuery } from '@/hooks/inventory'
import type { KardexMovementPayload } from '@/api/types/inventory'

const schema = z.object({
  tipo: z.enum(['entrada', 'salida'], {
    message: 'Selecciona el tipo de movimiento',
  }),
  producto: z.string().min(1, 'Selecciona un producto'),
  cantidad: z.string().min(1, 'La cantidad es obligatoria'),
  detalle: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface KardexMovementFormProps {
  onSubmit: (data: KardexMovementPayload) => void | Promise<void>
  isLoading?: boolean
  defaultValues?: Partial<FormValues>
}

export const KardexMovementForm = ({ onSubmit, isLoading = false, defaultValues }: KardexMovementFormProps) => {
  const { data: products, isLoading: loadingProducts } = useProductsQuery({})

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo: defaultValues?.tipo || 'entrada',
      producto: defaultValues?.producto ? String(defaultValues.producto) : '',
      cantidad: defaultValues?.cantidad ? String(defaultValues.cantidad) : '',
      detalle: defaultValues?.detalle || '',
    },
  })

  const tipo = watch('tipo')
  const productoIdStr = watch('producto')
  const productoId = productoIdStr ? Number(productoIdStr) : undefined
  const selectedProduct = productoId ? products?.find((p) => p.id === productoId) : undefined

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues)
    }
  }, [defaultValues, reset])

  const handleFormSubmit = (data: FormValues) => {
    onSubmit({
      tipo: data.tipo,
      producto: Number(data.producto),
      cantidad: Number(data.cantidad),
      detalle: data.detalle || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-heading">Información del movimiento</h2>
          <p className="text-sm text-secondary">Registra una entrada o salida de inventario</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-[var(--color-text-heading)]">
            <span className="font-medium">Tipo de movimiento *</span>
            <select
              {...register('tipo', { valueAsNumber: false })}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30"
            >
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
            </select>
            {errors.tipo && <p className="text-xs text-red-600">{errors.tipo.message}</p>}
          </label>

          <label className="space-y-2 text-sm text-[var(--color-text-heading)]">
            <span className="font-medium">Producto *</span>
            {loadingProducts ? (
              <div className="flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5">
                <Spinner size="sm" />
              </div>
            ) : (
            <select
              {...register('producto')}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30"
            >
                <option value="">Selecciona un producto</option>
                {products
                  ?.filter((p) => p.activo)
                  .map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.nombre} {product.codigo_interno && `(${product.codigo_interno})`} - Stock: {product.stock_actual}
                    </option>
                  ))}
              </select>
            )}
            {errors.producto && <p className="text-xs text-red-600">{errors.producto.message}</p>}
          </label>
        </div>

        {selectedProduct && (
          <div className="rounded-lg border border-[var(--border-subtle-color)] bg-[var(--color-surface-200)] p-4" style={{ borderWidth: 'var(--border-subtle-width)', borderStyle: 'var(--border-subtle-style)' }}>
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-gray-100 p-2 text-gray-700">
                <PackageSearch size={18} />
              </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-gray-900">{selectedProduct.nombre}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <span>Stock actual: {selectedProduct.stock_actual}</span>
                  <span>Stock mínimo: {selectedProduct.stock_minimo}</span>
                  {selectedProduct.codigo_interno && <span>Código: {selectedProduct.codigo_interno}</span>}
                </div>
                {tipo === 'salida' && selectedProduct.stock_actual < Number(watch('cantidad') || 0) && (
                  <p className="text-xs text-amber-600">⚠️ Stock insuficiente para esta cantidad</p>
                )}
                {tipo === 'salida' && selectedProduct.stock_actual <= selectedProduct.stock_minimo && (
                  <p className="text-xs text-red-600">⚠️ El stock está por debajo del mínimo</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm text-primary">
            <span>Cantidad *</span>
              <Input
              type="number"
              min="1"
              step="1"
              {...register('cantidad')}
              placeholder="Ej: 10"
              error={errors.cantidad?.message}
            />
          </label>
        </div>

          <label className="block space-y-2 text-sm text-primary">
            <span>Detalle (opcional)</span>
            <textarea
              {...register('detalle')}
              rows={3}
              placeholder="Describe el motivo del movimiento..."
              className="w-full rounded-lg border border-[var(--border-subtle-color)] bg-[var(--color-surface-200)] px-4 py-2 text-base text-primary transition-colors placeholder:text-tertiary hover:border-[var(--color-primary)]/50 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
              style={{
                borderWidth: 'var(--border-subtle-width)',
                borderStyle: 'var(--border-subtle-style)',
              }}
            />
          </label>
      </div>

      <div className="flex justify-end gap-3 border-t pt-4" style={{ borderColor: 'var(--border-subtle-color)', borderWidth: 'var(--border-subtle-width)', borderStyle: 'var(--border-subtle-style)' }}>
        <Button type="submit" disabled={isLoading || loadingProducts} startIcon={isLoading ? <Spinner size="sm" /> : null}>
          {isLoading ? 'Registrando...' : 'Registrar movimiento'}
        </Button>
      </div>
    </form>
  )
}

