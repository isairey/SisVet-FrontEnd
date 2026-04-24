import { ArrowLeft, ClipboardList, Edit3, Package, DollarSign, Hash } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { InventoryProductForm } from '@/pages/inventory/components/InventoryProductForm'
import { useProductDetailQuery } from '@/hooks/inventory'

export const InventoryDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useProductDetailQuery(id)

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const stockTone = data.stock_actual <= data.stock_minimo 
    ? 'danger' 
    : data.stock_actual <= data.stock_minimo * 1.5 
      ? 'warning' 
      : 'success'

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-label">Inventario</p>
          <h1 className="text-3xl font-semibold text-[var(--color-text-heading)]">{data.nombre}</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">{data.descripcion || 'Sin descripción'}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="ghost" startIcon={<ClipboardList size={16} className="text-gray-700" />}>
            <Link to="/app/inventario/kardex">Ver Kardex</Link>
          </Button>
          <Button asChild variant="ghost" startIcon={<ArrowLeft size={16} className="text-gray-700" />}>
            <Link to="/app/inventario">Volver</Link>
          </Button>
        </div>
      </header>

      {/* Información principal */}
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-[var(--color-primary)]/10 p-2.5 text-[var(--color-primary)]">
              <Package size={20} />
            </div>
            <p className="text-label font-medium">Stock</p>
          </div>
          <p className="text-3xl font-semibold text-[var(--color-text-heading)] mb-2">{data.stock_actual} u.</p>
          <div className="flex items-center gap-2">
            <Badge tone={stockTone}>
              Mínimo: {data.stock_minimo} u.
            </Badge>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-600">
              <DollarSign size={20} />
            </div>
            <p className="text-label font-medium">Precios</p>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-1">Compra</p>
              <p className="text-lg font-semibold text-[var(--color-text-heading)]">
                ${Number(data.precio_compra).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-1">Venta</p>
              <p className="text-lg font-semibold text-[var(--color-text-heading)]">
                ${Number(data.precio_venta).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600">
              <Hash size={20} />
            </div>
            <p className="text-label font-medium">Identificadores</p>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-1">Código interno</p>
              <p className="text-sm font-medium text-[var(--color-text-heading)]">
                {data.codigo_interno || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)] mb-1">Código de barras</p>
              <p className="text-sm font-medium text-[var(--color-text-heading)]">
                {data.codigo_barras || '—'}
              </p>
            </div>
            {data.categoria && (
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Categoría</p>
                <p className="text-sm font-medium text-[var(--color-text-heading)]">
                  {data.categoria.descripcion}
                </p>
              </div>
            )}
            {data.marca && (
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Marca</p>
                <p className="text-sm font-medium text-[var(--color-text-heading)]">
                  {data.marca.descripcion}
                </p>
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* Formulario de edición */}
      <section className="rounded-xl bg-surface p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-[var(--color-primary)]/10 p-2 text-[var(--color-primary)]">
            <Edit3 size={18} />
          </div>
          <p className="text-lg font-semibold text-[var(--color-text-heading)]">Actualizar información</p>
        </div>
        <InventoryProductForm mode="edit" product={data} />
      </section>
    </div>
  )
}
