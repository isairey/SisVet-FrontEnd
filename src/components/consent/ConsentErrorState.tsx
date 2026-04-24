import { useNavigate } from 'react-router-dom'
import { XCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface ConsentErrorStateProps {
  error: string
  onRetry: () => void
  isRetrying: boolean
}

export const ConsentErrorState = ({ error, onRetry, isRetrying }: ConsentErrorStateProps) => {
  const navigate = useNavigate()

  return (
    <Card className="p-10 text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping opacity-75" />
          <XCircle className="w-24 h-24 text-red-500 relative z-10" />
        </div>
      </div>
      <h1 className="text-3xl font-bold text-[var(--color-text-heading)] mb-4">
        No se pudo confirmar el consentimiento
      </h1>
      <p className="text-lg text-[var(--color-text-secondary)] mb-8 leading-relaxed max-w-md mx-auto">
        {error}
        <br />
        <span className="text-sm mt-2 block">
          Por favor, intenta nuevamente o contacta a la clínica si el problema persiste.
        </span>
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button
          onClick={onRetry}
          variant="primary"
          size="lg"
          disabled={isRetrying}
        >
          {isRetrying ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Intentando...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Intentar de nuevo
            </>
          )}
        </Button>
        <Button
          onClick={() => navigate('/auth')}
          variant="danger"
          size="lg"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver al inicio
        </Button>
      </div>
    </Card>
  )
}

