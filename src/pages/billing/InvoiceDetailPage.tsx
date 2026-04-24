import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, DollarSign, FileText, Mail, X, CheckCircle, Calendar, User, Package, ClipboardList, CreditCard, Clock, CheckCircle2, Receipt, Printer } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import {
  useInvoiceDetailQuery,
  useInvoicePayMutation,
  useInvoiceCancelMutation,
  useInvoiceSendEmailMutation,
  usePaymentMethodsQuery,
  useInvoiceReceiptQuery,
} from '@/hooks/billing'
import { useUserDetailQuery } from '@/hooks/users'
import { formatDateTime } from '@/utils/datetime'
import { useState, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/Input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import type { PaymentInvoicePayload } from '@/api/types/billing'
import { useDisclosure } from '@/hooks/useDisclosure'
import { useSessionStore } from '@/core/store/session-store'

const paymentSchema = z.object({
  metodo_pago: z.number().min(1, 'Selecciona un método de pago'),
  monto: z.string().min(1, 'El monto es requerido').refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'El monto debe ser un número válido mayor a 0',
  }),
  referencia: z.string().optional(),
})

type PaymentFormValues = z.infer<typeof paymentSchema>

const statusMap: Record<string, { tone: 'success' | 'warning' | 'info' | 'neutral'; label: string }> = {
  PENDIENTE: { tone: 'warning', label: 'Pendiente' },
  PAGADA: { tone: 'success', label: 'Pagada' },
  ANULADA: { tone: 'info', label: 'Anulada' },
}

export const InvoiceDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, error, refetch } = useInvoiceDetailQuery(id)
  const { data: paymentMethods, isLoading: isLoadingPaymentMethods, error: paymentMethodsError } = usePaymentMethodsQuery()
  const payMutation = useInvoicePayMutation()
  const cancelMutation = useInvoiceCancelMutation()
  const sendEmailMutation = useInvoiceSendEmailMutation()
  const user = useSessionStore((state) => state.user)
  const isClient = user?.roles?.includes('cliente') ?? false
  const isAdmin = user?.roles?.includes('administrador') ?? false

  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const receiptModal = useDisclosure()
  const { data: receiptData, isLoading: receiptLoading } = useInvoiceReceiptQuery(receiptModal.isOpen ? id : undefined)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      metodo_pago: 0,
      monto: '',
      referencia: '',
    },
  })

  // Intentar obtener el nombre del cliente si no viene en la factura
  const clienteId = useMemo(() => {
    if (!data?.cliente) return null
    const clienteIdValue = typeof data.cliente === 'number' ? data.cliente : Number(data.cliente)
    return isNaN(clienteIdValue) ? null : clienteIdValue
  }, [data?.cliente])

  // Siempre llamar el hook con el mismo parámetro (puede ser undefined)
  const clienteQueryId = useMemo(() => {
    if (clienteId === null || data?.cliente_nombre || isLoading) return undefined
    return String(clienteId)
  }, [clienteId, data?.cliente_nombre, isLoading])

  const { data: clienteData } = useUserDetailQuery(clienteQueryId)

  // Obtener el nombre completo del cliente
  const clienteNombre = useMemo(() => {
    if (data?.cliente_nombre) return data.cliente_nombre
    if (clienteData) {
      return `${clienteData.nombre} ${clienteData.apellido}`.trim()
    }
    return null
  }, [data?.cliente_nombre, clienteData])

  // Calcular total pagado y saldo pendiente
  const totalPagado = useMemo(() => {
    if (!data?.pagos || data.pagos.length === 0) return 0
    return data.pagos
      .filter(p => p.aprobado)
      .reduce((sum, p) => sum + (typeof p.monto === 'number' ? p.monto : Number(p.monto || 0)), 0)
  }, [data?.pagos])

  const remainingBalance = useMemo(() => {
    return typeof data?.total === 'number' ? data.total : Number(data?.total || 0)
  }, [data?.total])

  const saldoPendiente = useMemo(() => {
    return Math.max(0, remainingBalance - totalPagado)
  }, [remainingBalance, totalPagado])

  // Actualizar monto cuando cambie el total de la factura
  useEffect(() => {
    if (data?.total) {
      reset({
        metodo_pago: 0,
        monto: String(data.total),
        referencia: '',
      })
    }
  }, [data?.total, reset])

  const status = data?.estado ? statusMap[data.estado] : { tone: 'neutral' as const, label: data?.estado || '' }

  const handlePay = async (values: PaymentFormValues) => {
    if (!id) return

    const payload: PaymentInvoicePayload = {
      metodo_pago: values.metodo_pago,
      monto: Number(values.monto),
      referencia: values.referencia || undefined,
    }

    try {
      await payMutation.mutateAsync({ invoiceId: id, payload })
      // El toast de éxito ya se maneja en el hook useInvoicePayMutation
      setShowPaymentForm(false)
      reset()
      refetch()
    } catch (error: any) {
      // El toast de error ya se maneja en el hook useInvoicePayMutation
    }
  }

  const handleCancel = async () => {
    if (!id) return
    if (!confirm('¿Estás seguro de que deseas anular esta factura?')) return

    try {
      await cancelMutation.mutateAsync(id)
      toast.success('Factura anulada correctamente')
      refetch()
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Error al anular la factura')
    }
  }

  const handleSendEmail = async () => {
    if (!id) return
    // El hook useInvoiceSendEmailMutation maneja automáticamente los toasts de éxito y error
    await sendEmailMutation.mutateAsync(id)
  }

  const handlePrintReceipt = () => {
    if (!receiptData) return

    // Crear un elemento temporal para el contenido de impresión
    const printContent = document.createElement('div')
    printContent.id = 'receipt-print-temp'
    printContent.innerHTML = `
      <style>
        @media screen {
          #receipt-print-temp {
            display: none !important;
          }
        }
        @media print {
          @page {
            size: A4;
            margin: 0.3cm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            height: 100% !important;
            overflow: hidden !important;
          }
          body * {
            visibility: hidden !important;
          }
          #receipt-print-temp,
          #receipt-print-temp * {
            visibility: visible !important;
          }
          #receipt-print-temp {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            page-break-inside: avoid !important;
            overflow: hidden !important;
          }
          button, [role="dialog"], .fixed, header, nav, aside, footer, .receipt-view {
            display: none !important;
            visibility: hidden !important;
          }
          .receipt-print {
            max-height: calc(100vh - 0.6cm) !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
          }
        }
        .receipt-print {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          max-width: 100%;
          padding: 12px;
          color: #1f2937;
          page-break-inside: avoid;
        }
        .receipt-header {
          text-align: center;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 10px;
          margin-bottom: 14px;
          page-break-after: avoid;
        }
        .receipt-header h1 {
          font-size: 22px;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: #111827;
          letter-spacing: -0.3px;
        }
        .receipt-header .invoice-number {
          font-size: 12px;
          color: #6b7280;
          margin: 2px 0;
        }
        .receipt-header .invoice-date {
          font-size: 11px;
          color: #9ca3af;
          margin: 2px 0 4px 0;
        }
        .receipt-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-top: 4px;
        }
        .receipt-section {
          margin-bottom: 12px;
          page-break-inside: avoid;
        }
        .receipt-section-title {
          font-size: 13px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: #111827;
        }
        .receipt-section-content {
          font-size: 11px;
          color: #4b5563;
          line-height: 1.4;
        }
        .receipt-section-content p {
          margin: 2px 0;
        }
        .receipt-section-content strong {
          font-weight: 600;
          color: #111827;
        }
        .receipt-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 4px;
          font-size: 10px;
          page-break-inside: avoid;
        }
        .receipt-table thead {
          background-color: #f9fafb;
        }
        .receipt-table th {
          padding: 8px 6px;
          text-align: left;
          font-weight: 600;
          font-size: 10px;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .receipt-table th.text-right {
          text-align: right;
        }
        .receipt-table th.text-center {
          text-align: center;
        }
        .receipt-table td {
          padding: 8px 6px;
          font-size: 10px;
          color: #4b5563;
          border-bottom: 1px solid #f3f4f6;
        }
        .receipt-table td.text-right {
          text-align: right;
        }
        .receipt-table td.text-center {
          text-align: center;
        }
        .receipt-table tbody tr:last-child td {
          border-bottom: none;
        }
        .item-desc {
          font-weight: 500;
          color: #111827;
          font-size: 10px;
        }
        .item-sub {
          font-size: 9px;
          color: #6b7280;
          margin-top: 2px;
        }
        .receipt-totals {
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid #e5e7eb;
          page-break-inside: avoid;
        }
        .receipt-totals-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          margin-bottom: 4px;
        }
        .receipt-totals-row-label {
          color: #6b7280;
        }
        .receipt-totals-row-value {
          font-weight: 600;
          color: #111827;
        }
        .receipt-totals-final {
          display: flex;
          justify-content: space-between;
          font-size: 15px;
          font-weight: 700;
          padding-top: 8px;
          margin-top: 8px;
          border-top: 2px solid #d1d5db;
          color: #111827;
        }
        .receipt-totals-final-value {
          color: #3b82f6;
        }
        .receipt-payments {
          margin-top: 12px;
        }
        .receipt-payment-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 8px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          margin-bottom: 6px;
          background-color: #ffffff;
          page-break-inside: avoid;
        }
        .receipt-payment-info {
          flex: 1;
        }
        .receipt-payment-amount {
          font-weight: 600;
          font-size: 12px;
          color: #111827;
          margin-bottom: 2px;
        }
        .receipt-payment-details {
          font-size: 9px;
          color: #6b7280;
          margin-top: 2px;
        }
        .receipt-payment-badge {
          font-size: 9px;
          font-weight: 600;
          padding: 3px 6px;
          border-radius: 3px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .receipt-warning {
          padding: 8px;
          border: 1px solid #fbbf24;
          border-radius: 6px;
          background-color: #fef3c7;
          margin-top: 12px;
          page-break-inside: avoid;
        }
        .receipt-warning p {
          margin: 0;
          font-size: 11px;
          font-weight: 600;
          color: #92400e;
        }
        .receipt-footer {
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid #e5e7eb;
          font-size: 10px;
          color: #6b7280;
        }
        .receipt-footer strong {
          color: #111827;
        }
      </style>
      <div class="receipt-print">
        <div class="receipt-header">
          <h1>Recibo de Factura</h1>
          <div class="invoice-number">${receiptData.numero_factura}</div>
          <div class="invoice-date">${formatDateTime(receiptData.fecha_emision)}</div>
          <span class="receipt-badge" style="background-color: ${receiptData.estado === 'PAGADA' ? '#d1fae5' : receiptData.estado === 'ANULADA' ? '#e0e7ff' : '#fef3c7'}; color: ${receiptData.estado === 'PAGADA' ? '#065f46' : receiptData.estado === 'ANULADA' ? '#3730a3' : '#92400e'};">${receiptData.estado}</span>
        </div>

        <div class="receipt-section">
          <h3 class="receipt-section-title">Cliente</h3>
          <div class="receipt-section-content">
            <p><strong>Nombre:</strong> ${receiptData.cliente.nombre_completo}</p>
            <p><strong>Email:</strong> ${receiptData.cliente.email}</p>
            ${receiptData.cliente.username ? `<p><strong>Usuario:</strong> ${receiptData.cliente.username}</p>` : ''}
          </div>
        </div>

        <div class="receipt-section">
          <h3 class="receipt-section-title">Detalles</h3>
          <table class="receipt-table">
            <thead>
              <tr>
                <th>Descripción</th>
                <th class="text-center">Cantidad</th>
                <th class="text-right">Precio Unit.</th>
                <th class="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${receiptData.detalles.map((detalle: any) => `
                <tr>
                  <td>
                    <div class="item-desc">${detalle.descripcion}</div>
                    ${(detalle.producto_nombre || detalle.servicio_nombre) ? `<div class="item-sub">${detalle.producto_nombre || detalle.servicio_nombre}</div>` : ''}
                  </td>
                  <td class="text-center">${detalle.cantidad}</td>
                  <td class="text-right">$${detalle.precio_unitario.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td class="text-right" style="font-weight: 600;">$${detalle.subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="receipt-totals">
          <div class="receipt-totals-row">
            <span class="receipt-totals-row-label">Subtotal:</span>
            <span class="receipt-totals-row-value">$${receiptData.totales.subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div class="receipt-totals-row">
            <span class="receipt-totals-row-label">Impuestos:</span>
            <span class="receipt-totals-row-value">$${receiptData.totales.impuestos.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div class="receipt-totals-final">
            <span>Total:</span>
            <span class="receipt-totals-final-value">$${receiptData.totales.total.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          ${receiptData.total_pagado > 0 ? `
            <div class="receipt-totals-row" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
              <span class="receipt-totals-row-label">Total pagado:</span>
              <span class="receipt-totals-row-value" style="color: #10b981;">$${receiptData.total_pagado.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          ` : ''}
        </div>

        ${receiptData.pagos && receiptData.pagos.length > 0 ? `
          <div class="receipt-payments">
            <h3 class="receipt-section-title">Pagos realizados</h3>
            ${receiptData.pagos.map((pago: any) => `
              <div class="receipt-payment-item" style="border-color: ${pago.aprobado ? 'rgba(16, 185, 129, 0.3)' : '#e5e7eb'}; background-color: ${pago.aprobado ? 'rgba(16, 185, 129, 0.05)' : '#ffffff'};">
                <div class="receipt-payment-info">
                  <div class="receipt-payment-amount">$${(typeof pago.monto === 'number' ? pago.monto : Number(pago.monto || 0)).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  ${pago.fecha ? `<div class="receipt-payment-details">${pago.metodo_pago || 'Método de pago'} • ${formatDateTime(pago.fecha)}</div>` : ''}
                  ${pago.referencia ? `<div class="receipt-payment-details">Referencia: ${pago.referencia}</div>` : ''}
                </div>
                <span class="receipt-payment-badge" style="background-color: ${pago.aprobado ? '#d1fae5' : '#fef3c7'}; color: ${pago.aprobado ? '#065f46' : '#92400e'};">
                  ${pago.aprobado ? 'Aprobado' : 'Pendiente'}
                </span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${receiptData.saldo_pendiente > 0 ? `
          <div class="receipt-warning">
            <p>Saldo pendiente: $${receiptData.saldo_pendiente.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        ` : ''}

        ${(receiptData.vinculos.cita_id || receiptData.vinculos.consulta_id) ? `
          <div class="receipt-footer">
            <strong>Vínculos:</strong>
            ${receiptData.vinculos.cita_id ? ` Cita #${receiptData.vinculos.cita_id}` : ''}
            ${receiptData.vinculos.cita_id && receiptData.vinculos.consulta_id ? ' •' : ''}
            ${receiptData.vinculos.consulta_id ? ` Consulta #${receiptData.vinculos.consulta_id}` : ''}
          </div>
        ` : ''}
      </div>
    `

    // Agregar al body
    document.body.appendChild(printContent)

    // Esperar un momento para que se renderice y luego imprimir
    setTimeout(() => {
      window.print()
      
      // Limpiar después de imprimir
      setTimeout(() => {
        const element = document.getElementById('receipt-print-temp')
        if (element) {
          element.remove()
        }
      }, 500)
    }, 100)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <p className="text-lg font-medium text-red-800">Error al cargar la factura</p>
          <p className="mt-2 text-sm text-red-600">
            {error instanceof Error ? error.message : 'Error desconocido'}
          </p>
          {error && typeof error === 'object' && 'response' in error && (
            <pre className="mt-4 text-left text-xs overflow-auto bg-red-100 p-3 rounded">
              {JSON.stringify((error as any).response?.data, null, 2)}
            </pre>
          )}
        </div>
        <Button asChild variant="ghost" startIcon={<ArrowLeft size={18} className="text-black" />}>
          <Link to="/app/facturacion">Volver a facturas</Link>
        </Button>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium text-[var(--color-text-heading)]">Factura no encontrada</p>
        <Button asChild variant="ghost" startIcon={<ArrowLeft size={18} className="text-black" />}>
          <Link to="/app/facturacion">Volver a facturas</Link>
        </Button>
      </div>
    )
  }

  const canPay = data?.estado === 'PENDIENTE' && !isClient
  const canCancel = (data?.estado === 'PENDIENTE' || data?.estado === 'PAGADA') && isAdmin

  return (
    <div className="space-y-4 sm:space-y-6 -mx-4 sm:-mx-6 md:mx-0">
      <div className="px-4 sm:px-6 md:px-0 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-label">Factura</p>
          <h1 className="text-2xl sm:text-3xl font-semibold text-heading break-words">Factura #{data.id}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-secondary">
            <span className="break-words">{formatDateTime(data.fecha)}</span>
            <span className="hidden sm:inline">•</span>
            <Badge tone={status.tone} className="text-xs">{status.label}</Badge>
            {data.pagada && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle size={14} />
                  <span className="hidden sm:inline">Pagada</span>
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Button 
            asChild 
            variant="ghost" 
            className="px-3 py-1.5 text-sm w-full sm:w-auto"
            startIcon={<ArrowLeft size={16} className="text-black" />}
          >
            <Link to="/app/facturacion">Volver</Link>
          </Button>
          {canPay && (
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 px-3 py-1.5 text-sm font-medium whitespace-nowrap w-full sm:w-auto"
              style={{ boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)' }}
              startIcon={<CheckCircle2 size={16} />}
              onClick={() => setShowPaymentForm(!showPaymentForm)}
            >
              {showPaymentForm ? 'Cancelar' : 'Pagar'}
            </Button>
          )}
          {canCancel && (
            <Button 
              variant="danger" 
              className="px-3 py-1.5 text-sm w-full sm:w-auto"
              startIcon={<X size={16} />} 
              onClick={handleCancel} 
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? 'Anulando...' : 'Anular'}
            </Button>
          )}
        </div>
      </div>

      {/* Formulario de pago */}
      {showPaymentForm && canPay && (
        <div className="px-4 sm:px-6 md:px-0">
        <Card
          header={
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="rounded-xl bg-emerald-500/20 p-2 sm:p-2.5 text-emerald-600 flex-shrink-0">
                <DollarSign size={16} className="sm:w-[18px] sm:h-[18px]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-black font-medium">Pago</p>
                <h3 className="mt-1 sm:mt-2 text-base sm:text-lg font-semibold text-black">Registrar pago</h3>
              </div>
            </div>
          }
        >
          <form onSubmit={handleSubmit(handlePay)} className="space-y-3 sm:space-y-4">
            <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
              <label className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-[var(--color-text-heading)]">
                <span className="font-medium">Método de pago</span>
                <select
                  className="w-full rounded-lg border border-[var(--border-subtle-color)] bg-[var(--color-surface-200)] px-3 sm:px-4 py-2 text-sm sm:text-base transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                  style={{
                    borderWidth: 'var(--border-subtle-width)',
                    borderStyle: 'var(--border-subtle-style)',
                    color: '#000000',
                  }}
                  {...register('metodo_pago', { valueAsNumber: true })}
                >
                  <option value="0">Selecciona un método</option>
                  {isLoadingPaymentMethods ? (
                    <option disabled>Cargando métodos de pago...</option>
                  ) : paymentMethodsError ? (
                    <option disabled>Error al cargar métodos de pago</option>
                  ) : paymentMethods && Array.isArray(paymentMethods) && paymentMethods.length > 0 ? (
                    paymentMethods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.nombre}
                      </option>
                    ))
                  ) : (
                    <option disabled>No hay métodos de pago disponibles</option>
                  )}
                </select>
                {errors.metodo_pago && <p className="text-[10px] sm:text-xs text-red-600">{errors.metodo_pago.message}</p>}
              </label>

              <Input
                label="Monto"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('monto')}
                error={errors.monto?.message}
              />

              <div className="md:col-span-2">
                <Input
                  label="Referencia (opcional)"
                  placeholder="Número de referencia del pago"
                  {...register('referencia')}
                  error={errors.referencia?.message}
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border-subtle-color)' }}>
              <Button type="button" variant="ghost" onClick={() => setShowPaymentForm(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="submit" disabled={payMutation.isPending} className="w-full sm:w-auto min-w-[120px]">
                {payMutation.isPending ? 'Procesando...' : 'Registrar pago'}
              </Button>
            </div>
          </form>
        </Card>
        </div>
      )}

      {/* Información de la factura */}
      <div className="px-4 sm:px-6 md:px-0 grid gap-4 sm:gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Columna principal - Detalles */}
        <div className="space-y-4 sm:space-y-6">
          {/* Información del cliente */}
          <Card
            header={
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="rounded-xl bg-[var(--color-primary)]/20 p-2 sm:p-2.5 text-[var(--color-primary)] flex-shrink-0">
                  <User size={16} className="sm:w-[18px] sm:h-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-black font-medium">Cliente</p>
                  <h3 className="mt-1 sm:mt-2 text-base sm:text-lg font-semibold text-black break-words">
                    {clienteNombre || (typeof data.cliente === 'string' ? data.cliente : `Cliente #${data.cliente}`)}
                  </h3>
                </div>
              </div>
            }
          >
            <div className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              {clienteNombre && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                  <span className="font-medium text-black">Nombre completo:</span>
                  <span className="break-words">{clienteNombre}</span>
                </div>
              )}
              {clienteData?.email && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                  <span className="font-medium text-[var(--color-text-heading)]">Email:</span>
                  <span className="break-all">{clienteData.email}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Detalles de la factura */}
          <Card
            header={
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="rounded-xl bg-[var(--color-secondary)]/20 p-2 sm:p-2.5 text-[var(--color-secondary)] flex-shrink-0">
                  <FileText size={16} className="sm:w-[18px] sm:h-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-black font-medium">Detalles</p>
                  <h3 className="mt-1 sm:mt-2 text-base sm:text-lg font-semibold text-black">Items de la factura</h3>
                </div>
              </div>
            }
          >
            {data.detalles && data.detalles.length > 0 ? (
              <div className="overflow-x-auto -mx-4 sm:-mx-6 md:mx-0">
                <div className="inline-block min-w-full align-middle px-4 sm:px-6 md:px-0">
                  <div className="overflow-hidden">
                    <table className="min-w-full text-left">
                      <thead>
                        <tr className="text-xs uppercase tracking-wide text-[var(--color-text-muted)] border-b" style={{ borderColor: 'var(--border-subtle-color)' }}>
                          <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3">Descripción</th>
                          <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-right whitespace-nowrap">Cant.</th>
                          <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-right whitespace-nowrap hidden sm:table-cell">Precio Unit.</th>
                          <th className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-right whitespace-nowrap">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle-color)' }}>
                        {data.detalles.map((detalle) => {
                          const precioUnit = typeof detalle.precio_unitario === 'number' ? detalle.precio_unitario : Number(detalle.precio_unitario || 0)
                          const subtotal = typeof detalle.subtotal === 'number' ? detalle.subtotal : Number(detalle.subtotal || precioUnit * detalle.cantidad)
                          const isProduct = !!detalle.producto
                          const isService = !!detalle.servicio
                          
                          return (
                            <tr key={detalle.id || Math.random()} className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                              <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 min-w-[150px] sm:min-w-[200px]">
                                <div className="font-medium text-[var(--color-text-heading)] break-words">
                                  {detalle.descripcion || 'Sin descripción'}
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5">
                                  {isProduct && detalle.producto_nombre && (
                                    <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                                      <Package size={10} className="sm:w-3 sm:h-3" />
                                      <span className="truncate max-w-[80px] sm:max-w-[120px]">{detalle.producto_nombre}</span>
                                    </span>
                                  )}
                                  {isService && detalle.servicio_nombre && (
                                    <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]">
                                      <ClipboardList size={10} className="sm:w-3 sm:h-3" />
                                      <span className="truncate max-w-[80px] sm:max-w-[120px]">{detalle.servicio_nombre}</span>
                                    </span>
                                  )}
                                  {isProduct && !detalle.producto_nombre && (
                                    <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                                      <Package size={10} className="sm:w-3 sm:h-3" />
                                      <span className="hidden sm:inline">Producto </span>#{detalle.producto}
                                    </span>
                                  )}
                                  {isService && !detalle.servicio_nombre && (
                                    <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]">
                                      <ClipboardList size={10} className="sm:w-3 sm:h-3" />
                                      <span className="hidden sm:inline">Servicio </span>#{detalle.servicio}
                                    </span>
                                  )}
                                </div>
                                <div className="sm:hidden mt-1 text-[10px] text-[var(--color-text-muted)]">
                                  ${precioUnit.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} × {detalle.cantidad}
                                </div>
                              </td>
                              <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-right font-medium whitespace-nowrap">{detalle.cantidad}</td>
                              <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-right whitespace-nowrap hidden sm:table-cell">
                                ${precioUnit.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="px-2 sm:px-3 lg:px-4 py-2 sm:py-3 text-right font-semibold text-[var(--color-text-heading)] whitespace-nowrap">
                                ${subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">No hay detalles en esta factura</p>
            )}
          </Card>
        </div>

        {/* Columna lateral - Resumen */}
        <div className="space-y-4 sm:space-y-6">
          {/* Resumen financiero */}
          <Card
            header={
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="rounded-xl bg-[var(--color-accent-pink)]/20 p-2 sm:p-2.5 text-[var(--color-accent-pink)] flex-shrink-0">
                  <DollarSign size={16} className="sm:w-[18px] sm:h-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-black font-medium">Resumen</p>
                  <h3 className="mt-1 sm:mt-2 text-base sm:text-lg font-semibold text-black">Totales</h3>
                </div>
              </div>
            }
          >
            <div className="space-y-4">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-[var(--color-text-secondary)]">Subtotal:</span>
                <span className="font-semibold text-[var(--color-text-heading)] break-words text-right">
                  ${typeof data.subtotal === 'number' ? data.subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : Number(data.subtotal || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-[var(--color-text-secondary)]">Impuestos:</span>
                <span className="font-semibold text-[var(--color-text-heading)] break-words text-right">
                  ${typeof data.impuestos === 'number' ? data.impuestos.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : Number(data.impuestos || 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="border-t pt-4" style={{ borderColor: 'var(--border-subtle-color)' }}>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="font-semibold text-[var(--color-text-heading)]">Total:</span>
                  <span className="text-lg sm:text-xl font-bold text-[var(--color-primary)] break-words text-right">
                    ${remainingBalance.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Información adicional */}
          <Card
            header={
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="rounded-xl bg-[var(--color-accent-lavender)]/20 p-2 sm:p-2.5 text-[var(--color-accent-lavender)] flex-shrink-0">
                  <Calendar size={16} className="sm:w-[18px] sm:h-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-black font-medium">Información</p>
                  <h3 className="mt-1 sm:mt-2 text-base sm:text-lg font-semibold text-black">Datos adicionales</h3>
                </div>
              </div>
            }
          >
            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <p className="text-xs text-[var(--color-text-muted)] mb-1">Fecha de emisión</p>
                <p className="font-semibold text-[var(--color-text-heading)] break-words">{formatDateTime(data.fecha)}</p>
              </div>
              {data.cita && (
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">Cita relacionada</p>
                  <Link
                    to={`/app/citas/${data.cita}`}
                    className="font-semibold text-[var(--color-primary)] hover:underline break-all"
                  >
                    Ver cita
                  </Link>
                </div>
              )}
              {data.consulta && (
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">Consulta relacionada</p>
                  <Link
                    to={`/app/consultas/${data.consulta}`}
                    className="font-semibold text-[var(--color-primary)] hover:underline break-all"
                  >
                    Ver consulta
                  </Link>
                </div>
              )}
            </div>
          </Card>

          {/* Pagos realizados */}
          {data.pagos && data.pagos.length > 0 && (
            <Card
              header={
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="rounded-xl bg-emerald-500/20 p-2 sm:p-2.5 text-emerald-600 flex-shrink-0">
                    <CreditCard size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-black font-medium">Pagos</p>
                    <h3 className="mt-1 sm:mt-2 text-base sm:text-lg font-semibold text-black">Historial de pagos</h3>
                  </div>
                </div>
              }
            >
              <div className="space-y-3">
                {data.pagos.map((pago) => {
                  const monto = typeof pago.monto === 'number' ? pago.monto : Number(pago.monto || 0)
                  const metodoNombre = pago.metodo_nombre || (typeof pago.metodo === 'object' ? pago.metodo.nombre : `Método #${typeof pago.metodo === 'number' ? pago.metodo : 'N/A'}`)
                  
                  return (
                    <div
                      key={pago.id}
                      className="rounded-xl border p-3 sm:p-4 transition-all hover:shadow-md"
                      style={{ 
                        borderColor: pago.aprobado ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle-color)',
                        backgroundColor: pago.aprobado ? 'rgba(16, 185, 129, 0.05)' : 'transparent'
                      }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="font-semibold text-[var(--color-text-heading)] break-words">
                              ${monto.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            {pago.aprobado ? (
                              <Badge tone="success" className="text-xs whitespace-nowrap">Aprobado</Badge>
                            ) : (
                              <Badge tone="warning" className="text-xs whitespace-nowrap">Pendiente</Badge>
                            )}
                          </div>
                          <div className="space-y-1 text-xs sm:text-sm text-[var(--color-text-secondary)]">
                            <div className="flex items-center gap-2">
                              <CreditCard size={12} className="sm:w-[14px] sm:h-[14px] text-[var(--color-text-muted)] flex-shrink-0" />
                              <span className="break-words">{metodoNombre}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={12} className="sm:w-[14px] sm:h-[14px] text-[var(--color-text-muted)] flex-shrink-0" />
                              <span className="break-words">{formatDateTime(pago.fecha)}</span>
                            </div>
                            {pago.referencia && (
                              <div className="text-[10px] sm:text-xs text-[var(--color-text-muted)] break-words">
                                Referencia: {pago.referencia}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Saldo pendiente */}
          {data.estado === 'PENDIENTE' && saldoPendiente > 0 && (
            <Card>
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-medium text-[var(--color-text-heading)]">Saldo pendiente</p>
                <p className="text-xl sm:text-2xl font-bold text-[var(--color-primary)] break-words">
                  ${saldoPendiente.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                {totalPagado > 0 && (
                  <p className="text-xs text-[var(--color-text-muted)] break-words">
                    Pagado: ${totalPagado.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Acciones */}
          <Card>
            <div className="flex flex-col gap-3">
              <Button
                variant="secondary"
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium"
                startIcon={<Receipt size={18} className="text-black" />}
                onClick={receiptModal.open}
              >
                Ver recibo
              </Button>
              <Button
                variant="secondary"
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium"
                startIcon={<Mail size={18} className="text-black" />}
                onClick={handleSendEmail}
                disabled={sendEmailMutation.isPending}
              >
                {sendEmailMutation.isPending ? 'Enviando...' : 'Enviar factura por email'}
              </Button>
            </div>
          </Card>
        </div>
      </div>


      {/* Modal de Recibo */}
      <Modal isOpen={receiptModal.isOpen} onClose={receiptModal.close} title="Recibo de Factura" size="lg">
        {receiptLoading ? (
          <div className="flex justify-center py-10">
            <Spinner size="lg" />
          </div>
        ) : receiptData ? (
          <>
            {/* Vista normal del recibo */}
            <div className="space-y-6 receipt-view">
              {/* Encabezado del recibo */}
              <div className="text-center border-b pb-4" style={{ borderColor: 'var(--border-subtle-color)' }}>
                <h3 className="text-xl sm:text-2xl font-bold text-[var(--color-text-heading)] break-words">Recibo de Factura</h3>
                <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1 break-words">{receiptData.numero_factura}</p>
                <Badge tone={receiptData.estado === 'PAGADA' ? 'success' : receiptData.estado === 'ANULADA' ? 'info' : 'warning'} className="mt-2 text-xs">
                  {receiptData.estado}
                </Badge>
              </div>

            {/* Información del cliente */}
            <div>
              <h4 className="font-semibold text-black mb-2 text-sm sm:text-base">Cliente</h4>
              <div className="space-y-1 text-xs sm:text-sm text-[var(--color-text-secondary)]">
                <p className="break-words"><span className="font-medium text-black">Nombre:</span> {receiptData.cliente.nombre_completo}</p>
                <p className="break-all"><span className="font-medium text-black">Email:</span> {receiptData.cliente.email}</p>
                <p className="break-words"><span className="font-medium text-black">Usuario:</span> {receiptData.cliente.username}</p>
              </div>
            </div>

            {/* Fecha */}
            <div>
              <p className="text-xs sm:text-sm text-[var(--color-text-muted)] break-words">
                <span className="font-medium">Fecha de emisión:</span> {formatDateTime(receiptData.fecha_emision)}
              </p>
            </div>

            {/* Detalles */}
            <div>
              <h4 className="font-semibold text-black mb-3">Detalles</h4>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b text-left" style={{ borderColor: 'var(--border-subtle-color)' }}>
                          <th className="px-3 py-2 font-medium text-[var(--color-text-heading)]">Descripción</th>
                          <th className="px-3 py-2 font-medium text-[var(--color-text-heading)] text-right whitespace-nowrap">Cantidad</th>
                          <th className="px-3 py-2 font-medium text-[var(--color-text-heading)] text-right whitespace-nowrap">Precio Unit.</th>
                          <th className="px-3 py-2 font-medium text-[var(--color-text-heading)] text-right whitespace-nowrap">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {receiptData.detalles.map((detalle) => {
                          return (
                            <tr key={detalle.id} className="border-b" style={{ borderColor: 'var(--border-subtle-color)' }}>
                              <td className="px-3 py-2 text-[var(--color-text-secondary)] min-w-[150px]">
                                <div className="break-words">{detalle.descripcion}</div>
                                {(detalle.producto_nombre || detalle.servicio_nombre) && (
                                  <div className="text-xs text-[var(--color-text-muted)] mt-0.5 break-words">
                                    {detalle.producto_nombre || detalle.servicio_nombre}
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-2 text-right whitespace-nowrap">{detalle.cantidad}</td>
                              <td className="px-3 py-2 text-right whitespace-nowrap">
                                ${detalle.precio_unitario.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="px-3 py-2 text-right font-medium whitespace-nowrap">
                                ${detalle.subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Totales */}
            <div className="border-t pt-4 space-y-2" style={{ borderColor: 'var(--border-subtle-color)' }}>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-[var(--color-text-secondary)]">Subtotal:</span>
                <span className="font-semibold text-[var(--color-text-heading)] break-words">
                  ${receiptData.totales.subtotal.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-[var(--color-text-secondary)]">Impuestos:</span>
                <span className="font-semibold text-[var(--color-text-heading)] break-words">
                  ${receiptData.totales.impuestos.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm sm:text-base pt-2 border-t" style={{ borderColor: 'var(--border-subtle-color)' }}>
                <span className="font-bold text-[var(--color-text-heading)]">Total:</span>
                <span className="text-lg sm:text-xl font-bold text-[var(--color-primary)] break-words">
                  ${receiptData.totales.total.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            
            {/* Total pagado */}
            {receiptData.total_pagado > 0 && (
              <div className="flex justify-between text-xs sm:text-sm pt-2">
                <span className="text-[var(--color-text-secondary)]">Total pagado:</span>
                <span className="font-semibold text-emerald-600 break-words">
                  ${receiptData.total_pagado.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {/* Vínculos */}
            {(receiptData.vinculos.cita_id || receiptData.vinculos.consulta_id) && (
              <div>
                <h4 className="font-semibold text-black mb-2 text-sm sm:text-base">Vínculos</h4>
                <div className="space-y-1 text-xs sm:text-sm text-[var(--color-text-secondary)]">
                  {receiptData.vinculos.cita_id && (
                    <p className="break-words">
                      <span className="font-medium text-black">Cita:</span>{' '}
                      <Link
                        to={`/app/citas/${receiptData.vinculos.cita_id}`}
                        className="text-[var(--color-primary)] hover:underline break-all"
                        onClick={receiptModal.close}
                      >
                        Ver cita #{receiptData.vinculos.cita_id}
                      </Link>
                    </p>
                  )}
                  {receiptData.vinculos.consulta_id && (
                    <p className="break-words">
                      <span className="font-medium text-black">Consulta:</span>{' '}
                      <Link
                        to={`/app/consultas/${receiptData.vinculos.consulta_id}`}
                        className="text-[var(--color-primary)] hover:underline break-all"
                        onClick={receiptModal.close}
                      >
                        Ver consulta #{receiptData.vinculos.consulta_id}
                      </Link>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Pagos realizados */}
            {receiptData.pagos && receiptData.pagos.length > 0 && (
              <div>
                <h4 className="font-semibold text-[var(--color-text-heading)] mb-3">Pagos realizados</h4>
                <div className="space-y-2">
                  {receiptData.pagos.map((pago: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 rounded-lg bg-[var(--color-surface-200)] text-sm"
                    >
                      <div>
                        <p className="font-medium text-[var(--color-text-heading)]">
                          ${(typeof pago.monto === 'number' ? pago.monto : Number(pago.monto || 0)).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        {pago.fecha && (
                          <p className="text-xs text-[var(--color-text-muted)]">
                            {pago.metodo_pago || 'Método de pago'} • {formatDateTime(pago.fecha)}
                          </p>
                        )}
                      </div>
                      {pago.aprobado ? (
                        <Badge tone="success">Aprobado</Badge>
                      ) : (
                        <Badge tone="warning">Pendiente</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Saldo pendiente */}
            {receiptData.saldo_pendiente > 0 && (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-sm font-medium text-amber-800">
                  Saldo pendiente: ${receiptData.saldo_pendiente.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            )}

              {/* Botón de imprimir */}
              <div className="flex justify-center pt-4 border-t" style={{ borderColor: 'var(--border-subtle-color)' }}>
                <Button
                  variant="secondary"
                  startIcon={<Printer size={18} className="text-black" />}
                  onClick={handlePrintReceipt}
                >
                  Imprimir recibo
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-10">
            <p className="text-[var(--color-text-muted)]">No se pudo cargar el recibo</p>
          </div>
        )}
      </Modal>
    </div>
  )
}