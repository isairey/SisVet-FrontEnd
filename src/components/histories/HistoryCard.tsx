import { Link } from 'react-router-dom'
import { ArrowRight, Stethoscope, Syringe, PawPrint } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { ClinicalHistorySummary } from '@/api/types/histories'
import { formatDateTime } from '@/utils/datetime'

interface HistoryCardProps {
  history: ClinicalHistorySummary
}

export const HistoryCard = ({ history }: HistoryCardProps) => (
  <Card className="flex flex-col gap-6 p-5 hover:shadow-lg transition-shadow">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="rounded-xl bg-[var(--color-primary)]/10 p-2.5 text-[var(--color-primary)] flex-shrink-0">
          <PawPrint size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-text-muted)] mb-0.5">Historia #{history.id}</p>
          <h3 className="text-lg font-semibold text-gray-900 mb-0.5 truncate">{history.mascota.nombre}</h3>
          <p className="text-sm text-gray-600 truncate">{history.propietario_nombre}</p>
        </div>
      </div>
      <Badge tone={history.estado_vacunacion_actual === 'completa' ? 'success' : 'warning'}>
        {history.estado_vacunacion_display}
      </Badge>
    </div>

    <div className="grid grid-cols-2 gap-4 pt-2">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-blue-100 p-1.5 text-blue-600 flex-shrink-0">
          <Stethoscope size={16} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-1.5 leading-relaxed">Consultas</p>
          <p className="text-base font-semibold text-gray-900 leading-relaxed">{history.total_consultas}</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-purple-100 p-1.5 text-purple-600 flex-shrink-0">
          <Syringe size={16} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-1.5 leading-relaxed">Última consulta</p>
          <p className="text-sm font-medium text-gray-900 leading-relaxed">
            {history.ultima_consulta_fecha ? formatDateTime(history.ultima_consulta_fecha) : 'Sin registros'}
          </p>
        </div>
      </div>
    </div>

    <Button asChild variant="ghost" endIcon={<ArrowRight size={16} className="text-gray-700" />} className="justify-between text-gray-700 hover:text-gray-900 hover:bg-gray-50">
      <Link to={`/app/historias/${history.id}`}>Ver historia completa</Link>
    </Button>
  </Card>
)

