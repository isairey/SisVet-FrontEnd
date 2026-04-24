import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useBrandsQuery, useCategoriesQuery, useProductCreateMutation, useProductUpdateMutation } from '@/hooks/inventory'
import type { InventoryProduct, InventoryProductPayload, InventoryCategory, InventoryBrand } from '@/api/types/inventory'

const schema = z.object({
  nombre: z.string().min(3, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
  categoria: z.string().min(1, 'Selecciona una categoria'),
  marca: z.string().min(1, 'Selecciona una categoria'),
  stock: z.string().optional(),
  stock_minimo: z.string().optional(),
  precio_compra: z.string().optional(),
  precio_venta: z.string().optional(),
  codigo_barras: z.string().optional(),
  codigo_interno: z.string().optional(),
  fecha_vencimiento: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface InventoryProductFormProps {
  mode: 'create' | 'edit'
  product?: InventoryProduct
}

export const InventoryProductForm = ({ mode, product }: InventoryProductFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: product?.nombre ?? '',
      descripcion: product?.descripcion ?? '',
      categoria: product?.categoria?.id ? String(product.categoria.id) : '',
      marca: product?.marca?.id ? String(product.marca.id) : '',
      stock: product?.stock !== undefined ? String(product.stock) : '',
      stock_minimo: product?.stock_minimo ? String(product.stock_minimo) : '',
      precio_compra: product?.precio_compra ?? '',
      precio_venta: product?.precio_venta ?? '',
      codigo_barras: product?.codigo_barras ?? '',
      codigo_interno: product?.codigo_interno ?? '',
      fecha_vencimiento: product?.fecha_vencimiento ?? ''
    },
  })

  const { data: categories } = useCategoriesQuery()
  const { data: brands } = useBrandsQuery()

  const createMutation = useProductCreateMutation()
  const updateMutation = useProductUpdateMutation(product?.id ?? 0)
  const isEditing = mode === 'edit'
  const isSubmitting = form.formState.isSubmitting || createMutation.isPending || updateMutation.isPending

  const payloadFromValues = (values: FormValues): InventoryProductPayload => ({
    nombre: values.nombre,
    descripcion: values.descripcion,
    categoria_id: Number(values.categoria),
    marca_id: Number(values.marca),
    stock: values.stock ? Number(values.stock) : 0,
    stock_minimo: values.stock_minimo ? Number(values.stock_minimo) : undefined,
    precio_compra: values.precio_compra ? Number(values.precio_compra) : undefined,
    precio_venta: values.precio_venta ? Number(values.precio_venta) : undefined,
    codigo_barras: values.codigo_barras,
    codigo_interno: values.codigo_interno,
    fecha_vencimiento: values.fecha_vencimiento
  })


  const onSubmit = async (values: FormValues) => {
    const payload = payloadFromValues(values)
    try {
      if (isEditing && product) {
        await updateMutation.mutateAsync(payload)
      } else {
        await createMutation.mutateAsync(payload)
        form.reset()
      }
    } catch (error) {
      console.error('Error al guardar:', error)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Nombre" {...form.register('nombre')} error={form.formState.errors.nombre?.message} />
        <Input label="Código interno" {...form.register('codigo_interno')} />
        <Input label="Código de barras" {...form.register('codigo_barras')} />
        <Input label="Stock inicial" type="number" min="0" {...form.register('stock')} error={form.formState.errors.stock?.message}/>
        <Input label="Stock mínimo" type="number" min="0" {...form.register('stock_minimo')} />
        <Input label="Precio compra" type="number" step="0.01" {...form.register('precio_compra')} />
        <Input label="Precio venta" type="number" step="0.01" {...form.register('precio_venta')} />
        <Input label="Fecha vencimiento" type="date" {...form.register('fecha_vencimiento')} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm text-[var(--color-text-heading)]">
          <span className="font-medium">Categoría *</span>
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30"
            value={form.watch('categoria')}
            onChange={(event) => form.setValue('categoria', event.target.value)}
          >
            <option value="">Selecciona categoría</option>
            {categories?.map((category: InventoryCategory) => (
              <option key={category.id} value={category.id}>
                {category.descripcion}
              </option>
            ))}
          </select>
          {form.formState.errors.categoria && (
            <p className="text-xs text-red-600">{form.formState.errors.categoria.message}</p>
          )}
        </label>

        <label className="space-y-2 text-sm text-[var(--color-text-heading)]">
          <span className="font-medium">Marca *</span>
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30"
            value={form.watch('marca')}
            onChange={(event) => form.setValue('marca', event.target.value)}
          >
            <option value="">Selecciona marca</option>
            {brands?.map((brand: InventoryBrand) => (
              <option key={brand.id} value={brand.id}>
                {brand.descripcion}
              </option>
            ))}
          </select>
          {form.formState.errors.marca && (
            <p className="text-xs text-red-600">{form.formState.errors.marca.message}</p>
          )}
        </label>
      </div>

      <label className="space-y-2 text-sm text-primary">
        <span>Descripción</span>
        <textarea
          className="min-h-[120px] w-full rounded-xl border border-[var(--border-subtle-color)] bg-[var(--color-surface-200)] px-4 py-3 text-sm text-primary placeholder:text-tertiary focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30"
          style={{
            borderWidth: 'var(--border-subtle-width)',
            borderStyle: 'var(--border-subtle-style)',
          }}
          {...form.register('descripcion')}
          placeholder="Notas sobre el producto, proveedor, presentaciones..."
        />
      </label>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Registrar producto'}
      </Button>
    </form>
  )
}

