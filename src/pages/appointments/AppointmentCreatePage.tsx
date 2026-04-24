import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { AppointmentForm } from '@/pages/appointments/components/AppointmentForm'

export const AppointmentCreatePage = () => (
  <div className="space-y-6">
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-label">Citas</p>
        <h1 className="text-3xl font-semibold text-[var(--color-text-heading)]">Nueva cita veterinaria</h1>
        <p className="text-description">Elige mascota, profesional, servicio y horario disponible.</p>
      </div>
      <Button asChild variant="ghost" startIcon={<ArrowLeft size={16} className="text-gray-700" />}>
        <Link to="/app/citas">Volver</Link>
      </Button>
    </header>

    <section className="rounded-xl bg-surface p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
      <AppointmentForm />
    </section>
  </div>
)
