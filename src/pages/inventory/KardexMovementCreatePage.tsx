import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { KardexMovementForm } from './components/KardexMovementForm'
import { useKardexCreateMutation } from '@/hooks/inventory'

export const KardexMovementCreatePage = () => {
  const navigate = useNavigate()
  const createMutation = useKardexCreateMutation()

  const handleSubmit = async (data: Parameters<typeof createMutation.mutateAsync>[0]) => {
    await createMutation.mutateAsync(data, {
      onSuccess: () => {
        navigate('/app/inventario')
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-label">Inventario</p>
          <h1 className="text-3xl font-semibold text-heading">Registrar movimiento</h1>
          <p className="text-description">Registra una entrada o salida de inventario manualmente.</p>
        </div>
        <Button variant="ghost" startIcon={<ArrowLeft size={16} className="text-gray-700" />} onClick={() => navigate('/app/inventario')}>
          Volver
        </Button>
      </div>

      <KardexMovementForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
    </div>
  )
}

