import { useNavigate } from 'react-router-dom'
import { Shield, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConsentInfoCard } from './ConsentInfoCard'
import { FileText, AlertCircle } from 'lucide-react'

interface ConsentFormStateProps {
  onConfirm: () => void
  isConfirming: boolean
}

export const ConsentFormState = ({ onConfirm, isConfirming }: ConsentFormStateProps) => {
  const navigate = useNavigate()

  return (
    <Card className="p-8 sm:p-10" style={{ boxShadow: 'var(--shadow-card)' }}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse" />
            <Shield className="w-20 h-20 text-blue-600 relative z-10" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-heading)] mb-3">
          Confirmar Consentimiento Informado
        </h1>
        <p className="text-base sm:text-lg text-black leading-relaxed max-w-xl mx-auto">
          Por favor, lee la siguiente información y confirma tu consentimiento para proceder con la consulta veterinaria de tu mascota.
        </p>
      </div>

      {/* Information Cards */}
      <div className="space-y-4 mb-8">
        <ConsentInfoCard
          icon={FileText}
          title="¿Qué es el consentimiento informado?"
          description="El consentimiento informado es tu autorización explícita para que el veterinario realice los procedimientos médicos necesarios para el cuidado de tu mascota. Al confirmar, aceptas los términos y condiciones del tratamiento propuesto."
          iconColor="var(--color-primary)"
        />
        <ConsentInfoCard
          icon={AlertCircle}
          title="Tu decisión es importante"
          description="Al hacer clic en 'Confirmar Consentimiento', estás dando tu autorización explícita para el procedimiento médico descrito en la consulta. Esta acción es completamente voluntaria y puedes contactar a la clínica en cualquier momento si tienes preguntas o dudas."
          iconColor="var(--color-secondary)"
        />
      </div>

      {/* Action Buttons */}
      <div
        className="flex flex-col sm:flex-row gap-4 pt-6 justify-center items-center"
        style={{
          borderTopWidth: 'var(--border-subtle-width)',
          borderTopStyle: 'var(--border-subtle-style)',
          borderTopColor: 'var(--border-subtle-color)',
        }}
      >
        <Button
          onClick={onConfirm}
          variant="primary"
          size="lg"
          className="sm:min-w-[220px] bg-green-600 hover:bg-green-700 focus-visible:outline-green-600"
          disabled={isConfirming}
        >
          {isConfirming ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Confirmando...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Confirmar Consentimiento
            </>
          )}
        </Button>
        <Button
          onClick={() => navigate('/auth')}
          variant="danger"
          size="lg"
          className="sm:min-w-[150px]"
          disabled={isConfirming}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </Card>
  )
}

