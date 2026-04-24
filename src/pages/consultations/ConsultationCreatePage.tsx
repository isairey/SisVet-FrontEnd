import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { ConsultationForm } from '@/pages/consultations/ConsultationForm'

export const ConsultationCreatePage = () => (
  <div className="space-y-6">
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-label">Consultas</p>
        <h1 className="text-3xl font-semibold text-[var(--color-text-heading)]">Nueva consulta</h1>
        <p className="text-description">Completa el formulario con la información del paciente y diagnóstico.</p>
      </div>
      <Button asChild variant="ghost" startIcon={<ArrowLeft size={16} className="text-gray-700" />}>
        <Link to="/app/consultas">Volver</Link>
      </Button>
    </header>

    <section className="rounded-xl bg-surface p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
      <ConsultationForm />
    </section>
  </div>
)

