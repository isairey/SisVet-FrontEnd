import { ArrowLeft, Stethoscope, Calendar, User, FileText, Pill, Syringe, ClipboardList, Mail, Phone, MapPin,Send,Activity } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { useConsultationConsentMutation, useConsultationDetailQuery } from '@/hooks/consultations'
import { formatDateTime } from '@/utils/datetime'

export const ConsultationDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useConsultationDetailQuery(id)
  const consentMutation = useConsultationConsentMutation()

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* --- HEADER --- */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              Consulta #{data.id}
            </span>
            <div className="flex items-center text-sm text-secondary">
              <Calendar size={14} className="mr-1" />
              {formatDateTime(data.fecha_consulta)}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-heading flex items-center gap-2">
            {data.mascota}
          </h1>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="ghost" 
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={() => consentMutation.mutate(data.id)}
            startIcon={<Send size={16} />}
            disabled={consentMutation.isPending}
          >
            {consentMutation.isPending ? 'Enviando...' : 'Enviar consentimiento'}
          </Button>
          <Button asChild variant="ghost" startIcon={<ArrowLeft size={16} />}>
            <Link to="/app/consultas">Volver</Link>
          </Button>
        </div>
      </div>

      {/* --- SECCIÓN PRINCIPAL DE DATOS --- */}
      <section className="grid gap-6 md:grid-cols-3">
        {/* Diagnóstico */}
        <Card className="relative overflow-hidden border-l-4 border-l-[var(--color-primary)]">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-[var(--color-primary)]/10 p-2 text-[var(--color-primary)]">
              <Activity size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-label">Diagnóstico</p>
              <p className="mt-1 text-lg font-semibold text-heading leading-tight">
                {data.diagnostico}
              </p>
            </div>
          </div>
          {data.notas_adicionales && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs font-medium text-label mb-1">Notas adicionales</p>
              <p className="text-sm text-secondary leading-relaxed">
                {data.notas_adicionales}
              </p>
            </div>
          )}
        </Card>

        {/* Descripción */}
        <Card>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-gray-100 p-2 text-gray-600">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-label">Descripción del caso</p>
              <p className="mt-1 text-sm text-secondary leading-relaxed">
                {data.descripcion_consulta}
              </p>
            </div>
          </div>
        </Card>

        {/* Veterinario */}
        <Card>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-purple-100 p-2 text-purple-600">
              <User size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-label">Veterinario tratante</p>
              <p className="mt-1 text-base font-semibold text-heading">
                {data.veterinario_nombre}
              </p>
              <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-700">
                <Stethoscope size={12} />
                <span>Profesional</span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* --- SECCIÓN PRESCRIPCIONES --- */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-xl bg-blue-100 p-2 text-blue-600">
            <Pill size={18} />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Prescripciones Médicas</h2>
        </div>

        {data.prescripciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-10 text-center">
            <ClipboardList size={32} className="text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-600">Sin prescripciones registradas</p>
            <p className="text-xs text-gray-400">No se recetaron medicamentos en esta consulta.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.prescripciones.map((pres) => (
              <Card key={pres.id} className="transition-all hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-heading text-lg">
                      {pres.producto_nombre}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                        Cant: {pres.cantidad}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-full bg-blue-50 p-1.5 text-blue-600">
                    <Pill size={16} />
                  </div>
                </div>
                <div className="mt-4 border-t border-gray-100 pt-3">
                  <p className="text-xs text-label uppercase tracking-wider font-semibold">Indicaciones</p>
                  <p className="mt-1 text-sm text-secondary italic">
                    "{pres.indicaciones}"
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}