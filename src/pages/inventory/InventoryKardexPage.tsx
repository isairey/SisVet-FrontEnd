import { useState } from 'react'
import { ArrowLeft, History, PackageOpen, PlusCircle, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useKardexQuery, useKardexAnularMutation } from '@/hooks/inventory'
import { formatDateTime } from '@/utils/datetime'
import { useDisclosure } from '@/hooks/useDisclosure'

export const InventoryKardexPage = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { data, isLoading } = useKardexQuery(search || undefined)
  const anularMutation = useKardexAnularMutation()
  const { isOpen: isConfirming, open: openConfirm, close: closeConfirm } = useDisclosure()
  const [movementToAnular, setMovementToAnular] = useState<number | null>(null)

  const handleAnular = (id: number) => {
    setMovementToAnular(id)
    openConfirm()
  }

  const confirmAnular = () => {
    if (movementToAnular) {
      anularMutation.mutate(movementToAnular, {
        onSuccess: () => {
          closeConfirm()
          setMovementToAnular(null)
        },
      })
    }
  }

  const isAnulado = (detalle: string) => detalle && detalle.includes('ANULADO')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-label">Inventario</p>
          <h1 className="text-3xl font-semibold text-heading">Kardex general</h1>
          <p className="text-description">Movimientos de entrada, salida y ajustes de inventario.</p>
        </div>
        <div className="flex gap-2">
          <Button startIcon={<PlusCircle size={16} />} onClick={() => navigate('/app/inventario/movimientos/nuevo')}>
            Registrar movimiento
          </Button>
          <Button asChild variant="ghost" startIcon={<ArrowLeft size={16} />}>
            <Link to="/app/inventario">Volver</Link>
          </Button>
        </div>
      </div>

      <section className="rounded-3xl bg-surface p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <Input label="Buscar" placeholder="Producto o detalle..." value={search} onChange={(event) => setSearch(event.target.value)} />
      </section>

      <section>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner size="lg" />
          </div>
        ) : data && data.length > 0 ? (
          <div className="space-y-3">
            {data.map((movement) => {
              const isEntry = movement.tipo === 'entrada'
              const anulado = isAnulado(movement.detalle)
              const color = anulado ? 'text-gray-400 bg-gray-500/10' : isEntry ? 'text-emerald-200 bg-emerald-500/10' : 'text-red-200 bg-red-500/10'

              return (
                <Card key={movement.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`rounded-2xl p-3 ${anulado ? 'bg-gray-500/15 text-gray-400' : isEntry ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-200'}`}
                    >
                      {isEntry ? <PackageOpen size={18} /> : <History size={18} />}
                    </div>
                    <div>
                      <p className="text-sm text-tertiary">{formatDateTime(movement.fecha)}</p>
                      <h3 className={`text-lg font-semibold ${anulado ? 'text-tertiary line-through' : 'text-heading'}`}>{movement.producto_nombre}</h3>
                      <p className={`text-sm ${anulado ? 'text-subtle' : 'text-secondary'}`}>{movement.detalle}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-sm text-secondary">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold border ${color}`} style={{ borderWidth: 'var(--border-subtle-width)' }}>
                        {anulado ? 'Anulado' : movement.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                      </span>
                      {!anulado && (
                        <Button
                          variant="ghost"
                          startIcon={<X size={14} />}
                          onClick={() => handleAnular(movement.id)}
                          disabled={anularMutation.isPending}
                          className="text-red-600 hover:text-red-700 text-xs px-2 py-1"
                        >
                          Anular
                        </Button>
                      )}
                    </div>
                    <span className={anulado ? 'text-subtle' : 'text-primary'}>Cantidad: {movement.cantidad} u.</span>
                    {movement.usuario && <span className="text-xs text-tertiary">Por: {movement.usuario}</span>}
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--border-subtle-color)] px-6 py-12 text-center text-secondary" style={{ borderWidth: 'var(--border-subtle-width)', borderStyle: 'dashed' }}>
            Sin movimientos registrados.
          </div>
        )}
      </section>

      {/* Modal de confirmación */}
      {isConfirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-w-md space-y-4 p-6">
            <h3 className="text-xl font-semibold text-heading">Anular movimiento</h3>
            <p className="text-sm text-secondary">¿Estás seguro de que deseas anular este movimiento? Esta acción revertirá los cambios en el stock.</p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={closeConfirm} disabled={anularMutation.isPending}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={confirmAnular} disabled={anularMutation.isPending} startIcon={<X size={16} />}>
                {anularMutation.isPending ? 'Anulando...' : 'Anular movimiento'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

