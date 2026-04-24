import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PackageSearch, PlusCircle, TrendingDown, TrendingUp, History, X, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  useProductsQuery,
  useCategoriesQuery,
  useBrandsQuery,
  useProductDeactivateMutation,
  useKardexQuery,
  useKardexAnularMutation,
} from '@/hooks/inventory'
import { useDisclosure } from '@/hooks/useDisclosure'
import { formatDateTime } from '@/utils/datetime'
import type { InventoryCategory, InventoryBrand } from '@/api/types/inventory'

export const InventoryListPage = () => {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [brand, setBrand] = useState('')
  const [kardexSearch, setKardexSearch] = useState('')

  const { isOpen: isProductsExpanded, toggle: toggleProducts } = useDisclosure(true)
  const { isOpen: isKardexExpanded, toggle: toggleKardex } = useDisclosure(true)
  const { isOpen: isConfirming, open: openConfirm, close: closeConfirm } = useDisclosure()
  const [movementToAnular, setMovementToAnular] = useState<number | null>(null)

  const { data: categories } = useCategoriesQuery()
  const { data: brands } = useBrandsQuery()
  const { data: products, isLoading, error } = useProductsQuery({
    buscador: search || undefined,
    categoria: category || undefined,
    marca: brand || undefined,
  })
  const { data: kardexMovements, isLoading: isLoadingKardex } = useKardexQuery(kardexSearch || undefined)
  const deactivateMutation = useProductDeactivateMutation()
  const anularKardexMutation = useKardexAnularMutation()

  const handleAnular = (id: number) => {
    setMovementToAnular(id)
    openConfirm()
  }

  const confirmAnular = () => {
    if (movementToAnular) {
      anularKardexMutation.mutate(movementToAnular, {
        onSuccess: () => {
          closeConfirm()
          setMovementToAnular(null)
        },
      })
    }
  }

  const isAnulado = (detalle: string) => detalle && detalle.includes('ANULADO')

  const getStockBadgeTone = (stockActual: number, stockMinimo: number): 'danger' | 'warning' | 'success' => {
    if (stockActual <= stockMinimo) return 'danger'
    if (stockActual <= stockMinimo * 1.5) return 'warning'
    return 'success'
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-label">Inventario</p>
          <h1 className="text-3xl font-semibold text-heading">Control de insumos</h1>
          <p className="text-description">Monitorea stock, entradas y consumos en tiempo real.</p>
        </div>
        <Button startIcon={<PlusCircle size={18} />} asChild>
          <Link to="/app/inventario/nuevo">Registrar producto</Link>
        </Button>
      </header>

      {/* Filtros */}
      <section className="rounded-xl bg-surface p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="grid gap-4 md:grid-cols-3">
          <Input 
            label="Buscar producto" 
            placeholder="Nombre, código interno..." 
            value={search} 
            onChange={(event) => setSearch(event.target.value)} 
          />
          <label className="space-y-2 text-sm text-[var(--color-text-heading)]">
            <span className="font-medium">Categoría</span>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories?.map((cat: InventoryCategory) => (
                <option key={cat.id} value={cat.id}>
                  {cat.descripcion}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-[var(--color-text-heading)]">
            <span className="font-medium">Marca</span>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-base text-gray-900 transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/30"
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
            >
              <option value="">Todas las marcas</option>
              {brands?.map((brandItem: InventoryBrand) => (
                <option key={brandItem.id} value={brandItem.id}>
                  {brandItem.descripcion}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {/* Productos */}
      <section className="space-y-4">
        <button
          onClick={toggleProducts}
          className="flex w-full items-center justify-between rounded-xl bg-surface px-5 py-4 text-left transition-colors hover:bg-[var(--color-surface-200)]"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <span className="text-base font-semibold text-gray-900">
            Productos ({products?.length || 0})
          </span>
          {isProductsExpanded ? <ChevronUp size={20} className="text-gray-600" /> : <ChevronDown size={20} className="text-gray-600" />}
        </button>

        {isProductsExpanded && (
          <>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-400/50 bg-red-50 px-6 py-8 text-center">
                <p className="font-semibold text-red-800">Error al cargar productos</p>
                <p className="mt-1 text-sm text-red-600">Verifica la conexión con el servidor e intenta nuevamente.</p>
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid gap-4">
                {products.map((product) => {
                  const stockTone = getStockBadgeTone(product.stock_actual, product.stock_minimo)
                  
                  return (
                    <Card
                      key={product.id}
                      className="p-5 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="rounded-xl bg-[var(--color-primary)]/10 p-3 text-[var(--color-primary)] flex-shrink-0">
                            <PackageSearch size={22} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-[var(--color-text-heading)] mb-1">{product.nombre}</h3>
                            <p className="text-sm text-[var(--color-text-secondary)] mb-3">{product.descripcion || 'Sin descripción'}</p>
                            <div className="flex flex-wrap gap-3 text-xs text-[var(--color-text-muted)]">
                              {product.categoria?.descripcion && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-surface-200)]">
                                  {product.categoria.descripcion}
                                </span>
                              )}
                              {product.marca?.descripcion && (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-surface-200)]">
                                  {product.marca.descripcion}
                                </span>
                              )}
                              {product.codigo_interno && (
                                <span className="text-[var(--color-text-muted)]">
                                  Código: {product.codigo_interno}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3 md:ml-6">
                          <Badge tone={stockTone}>
                            {product.stock_actual} / {product.stock_minimo} mín.
                          </Badge>
                          <div className="flex gap-2">
                            <Button asChild variant="ghost" startIcon={<ArrowRight size={16} className="text-gray-700" />}>
                              <Link to={`/app/inventario/${product.id}`}>Ver detalle</Link>
                            </Button>
                            <Button
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              startIcon={<TrendingDown size={14} />}
                              disabled={deactivateMutation.isPending}
                              onClick={() => deactivateMutation.mutate(product.id)}
                            >
                              Desactivar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--border-subtle-color)] bg-[var(--color-surface-200)]/30 px-6 py-12 text-center">
                <PackageSearch size={48} className="mx-auto mb-4 text-[var(--color-text-muted)] opacity-40" />
                <p className="text-[var(--color-text-secondary)] font-medium">No se encontraron productos</p>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">Intenta ajustar los filtros de búsqueda.</p>
              </div>
            )}
          </>
        )}
      </section>

      {/* Historial de movimientos */}
      <section className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--color-text-heading)]">Historial de movimientos</h2>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">Registro de entradas, salidas y ajustes de inventario.</p>
          </div>
          <Button startIcon={<PlusCircle size={16} />} asChild>
            <Link to="/app/inventario/movimientos/nuevo">Registrar movimiento</Link>
          </Button>
        </div>

        <div className="rounded-xl bg-surface p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
          <Input
            label="Buscar movimientos"
            placeholder="Producto o detalle..."
            value={kardexSearch}
            onChange={(event) => setKardexSearch(event.target.value)}
          />
        </div>

        <button
          onClick={toggleKardex}
          className="flex w-full items-center justify-between rounded-xl bg-surface px-5 py-4 text-left transition-colors hover:bg-[var(--color-surface-200)]"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <span className="text-base font-semibold text-gray-900">
            Movimientos ({kardexMovements?.length || 0})
          </span>
          {isKardexExpanded ? <ChevronUp size={20} className="text-gray-600" /> : <ChevronDown size={20} className="text-gray-600" />}
        </button>

        {isKardexExpanded && (
          <>
            {isLoadingKardex ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : kardexMovements && kardexMovements.length > 0 ? (
              <div className="space-y-3">
                {kardexMovements.slice(0, 10).map((movement) => {
                  const isEntry = movement.tipo === 'entrada'
                  const anulado = isAnulado(movement.detalle)
                  const badgeTone = anulado ? 'neutral' : isEntry ? 'success' : 'danger'

                  return (
                    <Card
                      key={movement.id}
                      className="p-5 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div
                            className={`rounded-xl p-3 flex-shrink-0 ${
                              anulado
                                ? 'bg-gray-100 text-gray-500'
                                : isEntry
                                  ? 'bg-emerald-100 text-emerald-600'
                                  : 'bg-red-100 text-red-600'
                            }`}
                          >
                            {isEntry ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`text-base font-semibold ${anulado ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                {movement.producto_nombre}
                              </h3>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{movement.detalle}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-600">
                              <span>{formatDateTime(movement.fecha)}</span>
                              {movement.usuario && (
                                <>
                                  <span>•</span>
                                  <span>Por: {movement.usuario}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3 md:ml-6">
                          <div className="flex items-center gap-2">
                            <Badge tone={badgeTone}>
                              {anulado ? 'Anulado' : isEntry ? 'Entrada' : 'Salida'}
                            </Badge>
                            <span className="text-sm font-semibold text-gray-900">
                              {movement.cantidad} u.
                            </span>
                          </div>
                          {!anulado && (
                            <Button
                              variant="ghost"
                              startIcon={<X size={14} />}
                              onClick={() => handleAnular(movement.id)}
                              disabled={anularKardexMutation.isPending}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Anular
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
                {kardexMovements.length > 10 && (
                  <div className="text-center pt-2">
                    <Button variant="ghost" asChild>
                      <Link to="/app/inventario/kardex">Ver todos los movimientos ({kardexMovements.length})</Link>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[var(--border-subtle-color)] bg-[var(--color-surface-200)]/30 px-6 py-12 text-center">
                <History size={48} className="mx-auto mb-4 text-[var(--color-text-muted)] opacity-40" />
                <p className="text-[var(--color-text-secondary)] font-medium">Sin movimientos registrados</p>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">Haz clic en "Registrar movimiento" para comenzar.</p>
              </div>
            )}
          </>
        )}
      </section>

      {/* Modal de confirmación de anulación */}
      {isConfirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-w-md space-y-4 p-6">
            <h3 className="text-xl font-semibold text-[var(--color-text-heading)]">Anular movimiento</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              ¿Estás seguro de que deseas anular este movimiento? Esta acción revertirá los cambios en el stock.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="ghost" onClick={closeConfirm} disabled={anularKardexMutation.isPending}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={confirmAnular} disabled={anularKardexMutation.isPending} startIcon={<X size={16} />}>
                {anularKardexMutation.isPending ? 'Anulando...' : 'Anular movimiento'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
