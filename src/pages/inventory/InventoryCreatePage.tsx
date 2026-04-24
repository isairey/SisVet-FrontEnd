import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { InventoryProductForm } from '@/pages/inventory/components/InventoryProductForm'

export const InventoryCreatePage = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-label">Inventario</p>
        <h1 className="text-3xl font-semibold text-heading">Registrar producto</h1>
        <p className="text-description">Define el stock mínimo, precios y códigos de referencia.</p>
      </div>
      <Button asChild variant="ghost" startIcon={<ArrowLeft size={16} className="text-gray-700" />}>
        <Link to="/app/inventario">Volver</Link>
      </Button>
    </div>

    <section className="rounded-3xl bg-surface p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
      <InventoryProductForm mode="create" />
    </section>
  </div>
)

