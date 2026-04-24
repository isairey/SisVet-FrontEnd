import type { PaginatedResponse } from '@/api/types/common'

export interface ConsultationSummary {
  id: number
  mascota_nombre: string
  veterinario_nombre: string
  fecha_consulta: string
  diagnostico: string
  estado_vacunacion: string
  total_prescripciones: number
}

export interface ConsultationDetail {
  id: number
  mascota: number
  datos_personales: {
    nombre: string
    telefono: string | null
    direccion: string | null
  } | null
  veterinario: number
  veterinario_nombre: string
  fecha_consulta: string
  descripcion_consulta: string
  diagnostico: string
  notas_adicionales: string | null
  prescripciones: PrescripcionDetail[]
  examenes: ExamenDetail[]
  vacunas: VacunaDetail[]
  created_at: string
  updated_at: string
}

export interface PrescripcionDetail {
  id: number
  medicamento: number
  producto_nombre: string      // Nombre del producto
  producto_descripcion: string // Descripción detallada
  cantidad: number             // Backend usa 'cantidad'
  indicaciones: string         // Backend usa 'indicaciones'
  stock_disponible: number
}

export interface ExamenDetail {
  id: number
  tipo: string
  resultados: string
  fecha_programada: string | null
  estado: string
}

export interface VacunaDetail {
  id: number
  nombre_vacuna: string
  fecha_aplicacion: string
  proxima_fecha: string | null
  observaciones: string | null
}

export interface ConsultationPayload {
  mascota: number
  fecha_consulta: string
  descripcion_consulta: string
  diagnostico: string
  notas_adicionales?: string
  prescripciones?: PrescripcionPayload[]
  examenes?: ExamenPayload[]
  vacunas?: VacunaPayload 
  servicio?: number | null
  cita?: number | null
}

export interface PrescripcionPayload {
  medicamento: number
  cantidad: string
  indicaciones: string
}

export interface ExamenPayload {
  tipo_examen: string  
  descripcion?: string  
}

export interface VacunaPayload {
  estado: string
  vacunas_descripcion?: string
}

export interface ConsultationStats {
  total_consultas: number
  consultas_por_mes: Array<{ mes: string; total: number }>
  diagnosticos_comunes: Array<{ diagnostico: string; total: number }>
  estado_vacunacion: Array<{ estado: string; total: number }>
}

export type ConsultationListResponse = PaginatedResponse<ConsultationSummary> | ConsultationSummary[]

