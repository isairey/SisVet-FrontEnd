import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Heart } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export const ConsentSuccessState = () => {
  const navigate = useNavigate()

  return (
    <Card className="p-10 text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-75" />
          <div className="absolute inset-0 bg-green-500/10 rounded-full animate-pulse" />
          <CheckCircle2 className="w-24 h-24 text-green-500 relative z-10" />
        </div>
      </div>
      <h1 className="text-3xl font-bold text-[var(--color-text-heading)] mb-4">
        ¡Consentimiento Confirmado!
      </h1>
      <p className="text-lg text-[var(--color-text-secondary)] mb-8 leading-relaxed max-w-md mx-auto">
        Tu consentimiento ha sido registrado exitosamente. El veterinario podrá proceder con el tratamiento de tu mascota. 
        <br />
        <span className="font-medium text-[var(--color-text-heading)]">¡Gracias por tu confianza!</span>
      </p>
      <Button
        onClick={() => navigate('/auth')}
        variant="primary"
        size="lg"
        className="bg-blue-600 hover:bg-blue-700 focus-visible:outline-blue-600"
      >
        <Heart className="w-4 h-4 mr-2" />
        Volver al inicio
      </Button>
    </Card>
  )
}

