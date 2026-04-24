import { Calendar, FileText, Pill, Syringe, User, Clock } from 'lucide-react'
import type { ConsultaDetail } from '@/api/types/histories'

interface SectionCardProps {
  icon: React.ReactNode
  title: string
  items: Array<{ label: string; detail?: string }>
}

const SectionCard = ({ icon, title, items }: SectionCardProps) => (
  <div className="rounded-xl bg-[var(--color-surface-200)] p-4 border border-gray-200">
    <div className="mb-3 flex items-center gap-2">
      {icon}
      <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
    </div>
    {items.length === 0 ? (
      <p className="text-xs text-gray-500">Sin observaciones</p>
    ) : (
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="text-sm">
            <span className="font-medium text-gray-900">{item.label}</span>
            {item.detail && <span className="ml-2 text-xs text-gray-600">• {item.detail}</span>}
          </li>
        ))}
      </ul>
    )}
  </div>
)

interface HistoryTimelineProps {
  consultations: ConsultaDetail[]
}

export const HistoryTimeline = ({ consultations }: HistoryTimelineProps) => {
  if (!consultations || consultations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border-subtle-color)] bg-[var(--color-surface-200)]/30 px-6 py-12 text-center">
        <FileText size={48} className="mx-auto mb-4 text-[var(--color-text-muted)] opacity-40" />
        <p className="text-[var(--color-text-secondary)] font-medium">No hay consultas registradas</p>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">Aún no se han registrado consultas para esta historia clínica.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {consultations.map((consult) => {
        return (
          <div
            key={consult.id}
            className="rounded-xl bg-surface p-6 hover:shadow-lg transition-shadow"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-gray-200 pb-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="rounded-xl bg-[var(--color-primary)]/10 p-2.5 text-[var(--color-primary)] flex-shrink-0">
                  <Calendar size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-lg mb-1">
                    {new Date(consult.fecha_consulta).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {new Date(consult.fecha_consulta).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {consult.veterinario_nombre && (
                      <span className="flex items-center gap-1.5">
                        <User size={14} />
                        {consult.veterinario_nombre}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200">
                Consulta #{consult.id}
              </div>
            </div>

            <div className="space-y-4 mb-5">
              {consult.diagnostico && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">Diagnóstico</p>
                  <p className="rounded-lg bg-[var(--color-surface-200)] p-4 text-sm text-gray-700 border border-gray-200">
                    {consult.diagnostico}
                  </p>
                </div>
              )}

              {consult.descripcion_consulta && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">Descripción de la consulta</p>
                  <p className="rounded-lg bg-[var(--color-surface-200)] p-4 text-sm text-gray-700 border border-gray-200">
                    {consult.descripcion_consulta}
                  </p>
                </div>
              )}

              {consult.notas_adicionales && (
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">Notas adicionales</p>
                  <p className="rounded-lg bg-[var(--color-surface-200)] p-4 text-sm text-gray-700 border border-gray-200">
                    {consult.notas_adicionales}
                  </p>
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <SectionCard
                icon={<Pill size={16} className="text-blue-600" />}
                title="Prescripciones"
                items={consult.prescripciones?.map((pres) => ({
                  label: pres.producto_descripcion || pres.producto_nombre || 'Medicamento',
                  detail: pres.indicaciones
                    ? `${pres.cantidad} unidades · ${pres.indicaciones}`
                    : `${pres.cantidad} unidades`,
                })) || []}
              />

              <SectionCard
                icon={<FileText size={16} className="text-purple-600" />}
                title="Exámenes"
                items={consult.examenes?.map((exam) => ({
                  label: exam.tipo_examen || 'Examen',
                  detail: exam.descripcion || '',
                })) || []}
              />

              <SectionCard
                icon={<Syringe size={16} className="text-emerald-600" />}
                title="Vacunas"
                items={consult.vacunas?.map((vac) => ({
                  label: vac.estado_display || vac.estado || 'Sin estado',
                  detail: vac.vacunas_descripcion || 'Sin observaciones',
                })) || []}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
