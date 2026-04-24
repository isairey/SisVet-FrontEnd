import { useNavigate } from 'react-router-dom'
import { XCircle, ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export const ConsentInvalidTokenState = () => {
  const navigate = useNavigate()

  return (
    <Card className="p-8 text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping opacity-75" />
          <XCircle className="w-20 h-20 text-red-500 relative z-10" />
        </div>
      </div>
      <h1 className="text-2xl font-bold text-[var(--color-text-heading)] mb-3">
        Enlace Inválido
      </h1>
      <p className="text-base text-[var(--color-text-secondary)] mb-8 leading-relaxed">
        El enlace de confirmación no contiene un token válido o ha expirado.
        <br />
        <span className="text-sm mt-2 block">
          Por favor, verifica el enlace que recibiste por correo electrónico o solicita uno nuevo.
        </span>
      </p>
      <Button
        onClick={() => navigate('/auth')}
        variant="primary"
        size="lg"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver al inicio
      </Button>
    </Card>
  )
}

