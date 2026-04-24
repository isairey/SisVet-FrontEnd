/**
 * Tipos TypeScript para el módulo de Facturación
 */

export type InvoiceStatus = 'PENDIENTE' | 'PAGADA' | 'ANULADA'

export interface InvoiceDetail {
  id?: number
  producto?: number | null
  producto_nombre?: string | null // Nombre del producto si está disponible
  servicio?: number | null
  servicio_nombre?: string | null // Nombre del servicio si está disponible
  descripcion: string
  cantidad: number
  precio_unitario: number | string
  subtotal?: number | string
}

export interface Invoice {
  id: number
  estado: InvoiceStatus
  cliente: number | string
  cliente_nombre?: string // Nombre del cliente para mostrar
  cita?: number | null
  consulta?: number | null
  fecha: string
  subtotal?: number | string
  impuestos?: number | string
  total: number | string
  pagada?: boolean
  detalles?: InvoiceDetail[]
  pagos?: Payment[] // Lista de pagos asociados
}

export interface InvoiceCreatePayload {
  cita?: number | null
  consulta?: number | null
  detalles: Omit<InvoiceDetail, 'id' | 'subtotal'>[]
}

export interface InvoiceCreateFromProductsPayload {
  cliente_id: number
  productos: Array<{
    producto_id: number
    cantidad: number
  }>
}

export interface InvoiceDuplicateError {
  detail?: string
  factura_existente?: {
    id: number
    numero_factura?: string
    estado?: InvoiceStatus
  }
  mensaje?: string
}

export interface InvoiceSummary {
  id: number
  estado: InvoiceStatus
  cliente: number | string
  cliente_nombre?: string
  fecha: string
  total: number
  pagada: boolean
}

export interface PaymentMethod {
  id: number
  nombre: string
  codigo: string
}

export interface PaymentMethodCreatePayload {
  nombre: string
  codigo: string
}

export interface Payment {
  id: number
  factura: number
  metodo: number | PaymentMethod
  metodo_nombre?: string // Nombre del método de pago
  monto: number | string
  fecha: string
  aprobado: boolean
  referencia?: string | null
}

export interface PaymentCreatePayload {
  metodo_pago: number
  monto: number | string
  referencia?: string
}

export interface PaymentInvoicePayload {
  metodo_pago: number
  monto: number | string
  referencia?: string
}

export interface InvoiceListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Invoice[]
}

export interface PaymentListResponse {
  count?: number
  next?: string | null
  previous?: string | null
  results?: Payment[]
}

export interface FinancialReport {
  resumen: {
    total_facturas: number
    facturas_pagadas: number
    facturas_pendientes: number
    facturas_anuladas: number
    ingresos_totales: number
    ingresos_mes_actual: number
    ingresos_semana_actual: number
    promedio_factura: number
  }
  por_estado: Array<{
    estado: string
    cantidad: number
    total: number
  }>
  por_estado_mes_actual: Array<{
    estado: string
    cantidad: number
    total: number
  }>
  periodo: {
    mes_actual: string
    fecha_consulta: string
  }
}

export interface InvoiceReceipt {
  factura_id: number
  numero_factura: string
  fecha_emision: string
  estado: InvoiceStatus
  cliente: {
    id: number
    nombre_completo: string
    email: string
    username: string
  }
  detalles: Array<{
    id: number
    descripcion: string
    producto_id: number | null
    producto_nombre: string | null
    servicio_id: number | null
    servicio_nombre: string | null
    cantidad: number
    precio_unitario: number
    subtotal: number
  }>
  totales: {
    subtotal: number
    impuestos: number
    total: number
  }
  pagos: Array<any> // Estructura específica según el backend
  total_pagado: number
  saldo_pendiente: number
  vinculos: {
    cita_id: number | null
    consulta_id: number | null
  }
}

