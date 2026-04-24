import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, PawPrint, User, FileText, Calendar, Phone, Mail, Printer } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { HistoryTimeline } from '@/components/histories/HistoryTimeline'
import { useHistoryDetailQuery } from '@/hooks/histories'
import { formatDateTime } from '@/utils/datetime'

export const HistoryDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useHistoryDetailQuery(id)

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const vaccinationTone = data.estado_vacunacion_actual === 'completa' ? 'success' : 'warning'

  const handlePrint = () => {
    // Crear un elemento temporal para el contenido de impresión
    const printContent = document.createElement('div')
    printContent.id = 'history-print-temp'
    
    // Formatear fecha de consulta
    const formatConsultationDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    // Generar HTML de consultas con mejor organización
    const consultationsHtml = data.consultas.map((consult, index) => {
      const prescripcionesHtml = consult.prescripciones && consult.prescripciones.length > 0
        ? consult.prescripciones.map((pres) => `
          <tr>
            <td style="padding: 6px 8px; border-bottom: 1px solid #f3f4f6; vertical-align: top;">
              <strong style="font-size: 11px; color: #111827;">${pres.producto_descripcion || pres.producto_nombre || 'Medicamento'}</strong>
              <div style="font-size: 10px; color: #6b7280; margin-top: 2px;">
                ${pres.cantidad} unidades${pres.indicaciones ? ` · ${pres.indicaciones}` : ''}
              </div>
            </td>
          </tr>
        `).join('')
        : '<tr><td style="padding: 6px 8px; color: #9ca3af; font-size: 10px; font-style: italic;">Sin prescripciones</td></tr>'

      const examenesHtml = consult.examenes && consult.examenes.length > 0
        ? consult.examenes.map((exam) => `
          <tr>
            <td style="padding: 6px 8px; border-bottom: 1px solid #f3f4f6; vertical-align: top;">
              <strong style="font-size: 11px; color: #111827;">${exam.tipo_examen || 'Examen'}</strong>
              ${exam.descripcion ? `<div style="font-size: 10px; color: #6b7280; margin-top: 2px;">${exam.descripcion}</div>` : ''}
            </td>
          </tr>
        `).join('')
        : '<tr><td style="padding: 6px 8px; color: #9ca3af; font-size: 10px; font-style: italic;">Sin exámenes</td></tr>'

      const vacunasHtml = consult.vacunas && consult.vacunas.length > 0
        ? consult.vacunas.map((vac) => `
          <tr>
            <td style="padding: 6px 8px; border-bottom: 1px solid #f3f4f6; vertical-align: top;">
              <strong style="font-size: 11px; color: #111827;">${vac.estado_display || vac.estado || 'Sin estado'}</strong>
              ${vac.vacunas_descripcion ? `<div style="font-size: 10px; color: #6b7280; margin-top: 2px;">${vac.vacunas_descripcion}</div>` : ''}
            </td>
          </tr>
        `).join('')
        : '<tr><td style="padding: 6px 8px; color: #9ca3af; font-size: 10px; font-style: italic;">Sin vacunas registradas</td></tr>'

      return `
        <div class="consultation-item" style="page-break-inside: avoid; break-inside: avoid; margin-bottom: 30px; padding: 20px; border: 2px solid #e5e7eb; border-radius: 8px; background: #ffffff;">
          <div style="border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px; flex-wrap: wrap;">
              <div>
                <h3 style="margin: 0 0 4px 0; font-size: 18px; font-weight: 700; color: #111827;">Consulta #${consult.id}</h3>
                ${consult.veterinario_nombre ? `<p style="margin: 0; font-size: 12px; color: #6b7280; font-weight: 500;">Veterinario: ${consult.veterinario_nombre}</p>` : ''}
              </div>
              <div style="text-align: right;">
                <span style="font-size: 12px; color: #374151; font-weight: 600; display: block; margin-bottom: 2px;">Fecha y hora</span>
                <span style="font-size: 11px; color: #6b7280;">${formatConsultationDate(consult.fecha_consulta)}</span>
              </div>
            </div>
          </div>
          
          <div style="margin-bottom: 16px;">
            ${consult.diagnostico ? `
              <div style="margin-bottom: 14px;">
                <h4 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">Diagnóstico</h4>
                <div style="padding: 12px; background: #fef2f2; border-left: 4px solid #dc2626; border-radius: 4px; font-size: 12px; color: #374151; line-height: 1.7; white-space: pre-wrap;">${consult.diagnostico}</div>
              </div>
            ` : ''}
            
            ${consult.descripcion_consulta ? `
              <div style="margin-bottom: 14px;">
                <h4 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">Descripción de la consulta</h4>
                <div style="padding: 12px; background: #f0f9ff; border-left: 4px solid #0284c7; border-radius: 4px; font-size: 12px; color: #374151; line-height: 1.7; white-space: pre-wrap;">${consult.descripcion_consulta}</div>
              </div>
            ` : ''}
            
            ${consult.notas_adicionales ? `
              <div style="margin-bottom: 14px;">
                <h4 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">Notas adicionales</h4>
                <div style="padding: 12px; background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px; font-size: 12px; color: #374151; line-height: 1.7; white-space: pre-wrap;">${consult.notas_adicionales}</div>
              </div>
            ` : ''}
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 20px;">
            <div style="padding: 14px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; min-height: 100px;">
              <h4 style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.3px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">Prescripciones</h4>
              <table style="width: 100%; border-collapse: collapse;">
                <tbody>
                  ${prescripcionesHtml}
                </tbody>
              </table>
            </div>
            
            <div style="padding: 14px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; min-height: 100px;">
              <h4 style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.3px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">Exámenes</h4>
              <table style="width: 100%; border-collapse: collapse;">
                <tbody>
                  ${examenesHtml}
                </tbody>
              </table>
            </div>
            
            <div style="padding: 14px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; min-height: 100px;">
              <h4 style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.3px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">Vacunas</h4>
              <table style="width: 100%; border-collapse: collapse;">
                <tbody>
                  ${vacunasHtml}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `
    }).join('')

    printContent.innerHTML = `
      <style>
        @media screen {
          #history-print-temp {
            display: none !important;
          }
        }
        @media print {
          @page {
            size: A4;
            margin: 1.2cm 1.5cm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }
          body * {
            visibility: hidden !important;
          }
          #history-print-temp,
          #history-print-temp * {
            visibility: visible !important;
          }
          #history-print-temp {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          button, [role="dialog"], .fixed, header, nav, aside, footer {
            display: none !important;
            visibility: hidden !important;
          }
          .consultation-item {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: auto !important;
          }
          .history-section {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
        .history-print {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          max-width: 100%;
          padding: 0;
          color: #1f2937;
          line-height: 1.6;
        }
        .history-header {
          text-align: center;
          border-bottom: 3px solid #1f2937;
          padding-bottom: 24px;
          margin-bottom: 32px;
          page-break-after: avoid;
          break-after: avoid-page;
        }
        .history-header h1 {
          font-size: 32px;
          font-weight: 800;
          margin: 0 0 12px 0;
          color: #111827;
          letter-spacing: -0.5px;
        }
        .history-header .subtitle {
          font-size: 15px;
          color: #4b5563;
          margin: 6px 0;
          font-weight: 500;
        }
        .history-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-top: 12px;
        }
        .history-section {
          margin-bottom: 32px;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        .history-section-title {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 16px 0;
          padding-bottom: 10px;
          border-bottom: 3px solid #e5e7eb;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .history-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-bottom: 0;
        }
        .history-card {
          padding: 18px;
          background: #f9fafb;
          border: 1.5px solid #e5e7eb;
          border-radius: 8px;
          page-break-inside: avoid;
        }
        .history-card-title {
          font-size: 11px;
          font-weight: 700;
          color: #6b7280;
          margin: 0 0 10px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .history-card-value {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }
        .history-footer {
          margin-top: 50px;
          padding-top: 24px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          font-size: 11px;
          color: #9ca3af;
          page-break-inside: avoid;
        }
      </style>
      <div class="history-print">
        <div class="history-header">
          <h1>HISTORIA CLÍNICA</h1>
          <div class="subtitle" style="font-size: 18px; font-weight: 600; color: #111827; margin-top: 8px;">${data.mascota_datos.nombre}</div>
          <div class="subtitle">Propietario: ${data.propietario.nombre_completo}</div>
          <div class="history-badge" style="background: ${data.estado_vacunacion_actual === 'completa' ? '#d1fae5' : '#fef3c7'}; color: ${data.estado_vacunacion_actual === 'completa' ? '#065f46' : '#92400e'}; border: 1px solid ${data.estado_vacunacion_actual === 'completa' ? '#10b981' : '#f59e0b'};">
            ${data.estado_vacunacion_actual === 'completa' ? '✓ Vacunación completa' : '⚠ Vacunación pendiente'}
          </div>
        </div>

        <div class="history-section">
          <h2 class="history-section-title">Información General de la Mascota</h2>
          <div class="history-grid">
            <div class="history-card">
              <p class="history-card-title">Especie</p>
              <p class="history-card-value">${data.mascota_datos.especie ?? 'Sin especificar'}</p>
            </div>
            <div class="history-card">
              <p class="history-card-title">Raza</p>
              <p class="history-card-value">${data.mascota_datos.raza ?? 'Sin especificar'}</p>
            </div>
            <div class="history-card">
              <p class="history-card-title">Edad</p>
              <p class="history-card-value">${data.mascota_datos.edad ? `${data.mascota_datos.edad} años` : 'Sin registro'}</p>
            </div>
            <div class="history-card">
              <p class="history-card-title">Peso</p>
              <p class="history-card-value">${data.mascota_datos.peso ? `${data.mascota_datos.peso} kg` : '—'}</p>
            </div>
            ${data.mascota_datos.sexo ? `
            <div class="history-card">
              <p class="history-card-title">Sexo</p>
              <p class="history-card-value">${data.mascota_datos.sexo === 'M' ? 'Macho' : data.mascota_datos.sexo === 'H' ? 'Hembra' : data.mascota_datos.sexo}</p>
            </div>
            ` : '<div class="history-card"></div>'}
            <div class="history-card">
              <p class="history-card-title">Total de consultas</p>
              <p class="history-card-value">${data.consultas.length}</p>
            </div>
          </div>
        </div>

        <div class="history-section">
          <h2 class="history-section-title">Datos del Propietario</h2>
          <div class="history-grid">
            <div class="history-card">
              <p class="history-card-title">Nombre completo</p>
              <p class="history-card-value" style="font-size: 14px;">${data.propietario.nombre_completo}</p>
            </div>
            <div class="history-card">
              <p class="history-card-title">Email</p>
              <p class="history-card-value" style="font-size: 13px; word-break: break-word;">${data.propietario.email}</p>
            </div>
            ${data.propietario.telefono ? `
            <div class="history-card">
              <p class="history-card-title">Teléfono</p>
              <p class="history-card-value">${data.propietario.telefono}</p>
            </div>
            ` : '<div class="history-card"></div>'}
          </div>
        </div>

        <div class="history-section">
          <h2 class="history-section-title">Historial de Consultas Médicas</h2>
          ${consultationsHtml}
        </div>

        <div class="history-footer">
          <p style="margin: 4px 0; font-weight: 600;">Documento generado el ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          <p style="margin: 4px 0;">Última actualización del historial: ${formatDateTime(data.fecha_actualizacion)}</p>
          <p style="margin: 4px 0;">Fecha de creación: ${formatDateTime(data.fecha_creacion)}</p>
        </div>
      </div>
    `

    document.body.appendChild(printContent)
    window.print()
    
    // Limpiar después de imprimir
    setTimeout(() => {
      document.body.removeChild(printContent)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-label">Historias clínicas</p>
          <h1 className="text-3xl font-semibold text-[var(--color-text-heading)]">{data.mascota_datos.nombre}</h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-sm text-[var(--color-text-secondary)]">{data.propietario.nombre_completo}</p>
            <Badge tone={vaccinationTone}>
              {data.estado_vacunacion_actual === 'completa' ? 'Vacunación completa' : 'Vacunación pendiente'}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePrint}
            variant="default"
            startIcon={<Printer size={16} />}
            className="bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600 shadow-md hover:shadow-lg transition-all"
          >
            Imprimir PDF
          </Button>
          <Button asChild variant="ghost" startIcon={<ArrowLeft size={16} className="text-gray-700" />}>
            <Link to="/app/historias">Volver al listado</Link>
          </Button>
        </div>
      </header>

      {/* Información principal */}
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-[var(--color-primary)]/10 p-2.5 text-[var(--color-primary)]">
              <PawPrint size={20} />
            </div>
            <p className="text-label font-medium">Datos de la mascota</p>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Especie</p>
              <p className="text-sm font-medium text-gray-900">{data.mascota_datos.especie ?? 'Sin especificar'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Raza</p>
              <p className="text-sm font-medium text-gray-900">{data.mascota_datos.raza ?? 'Sin especificar'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Edad</p>
              <p className="text-sm font-medium text-gray-900">{data.mascota_datos.edad ? `${data.mascota_datos.edad} años` : 'Sin registro'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Peso</p>
              <p className="text-sm font-medium text-gray-900">{data.mascota_datos.peso ? `${data.mascota_datos.peso} kg` : '—'}</p>
            </div>
            {data.mascota_datos.sexo && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Sexo</p>
                <p className="text-sm font-medium text-gray-900">{data.mascota_datos.sexo === 'M' ? 'Macho' : data.mascota_datos.sexo === 'H' ? 'Hembra' : data.mascota_datos.sexo}</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-600">
              <User size={20} />
            </div>
            <p className="text-label font-medium">Propietario</p>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Nombre completo</p>
              <p className="text-sm font-medium text-gray-900">{data.propietario.nombre_completo}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                <Mail size={14} className="text-gray-500" />
                {data.propietario.email}
              </p>
            </div>
            {data.propietario.telefono && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Teléfono</p>
                <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                  <Phone size={14} className="text-gray-500" />
                  {data.propietario.telefono}
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-blue-100 p-2.5 text-blue-600">
              <FileText size={20} />
            </div>
            <p className="text-label font-medium">Resumen</p>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Consultas totales</p>
              <p className="text-2xl font-semibold text-gray-900">{data.consultas.length}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Última actualización</p>
              <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                <Calendar size={14} className="text-gray-500" />
                {formatDateTime(data.fecha_actualizacion)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Fecha de creación</p>
              <p className="text-sm font-medium text-gray-900">{formatDateTime(data.fecha_creacion)}</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Historial de consultas */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-xl bg-[var(--color-primary)]/10 p-2 text-[var(--color-primary)]">
            <FileText size={18} />
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-text-heading)]">Historial de consultas</h2>
        </div>
        <HistoryTimeline consultations={data.consultas} />
      </section>
    </div>
  )
}
