export interface ClinicalHistorySummary {
  id: number
  mascota: {
    id: string
    nombre: string
    especie: string | null
    raza: string | null
  }
  propietario_nombre: string
  fecha_creacion: string
  fecha_actualizacion: string
  estado_vacunacion_actual: string
  estado_vacunacion_display: string
  total_consultas: number
  ultima_consulta_fecha: string | null
}

export interface ClinicalHistoryDetail {
  id: number
  mascota: number
  mascota_datos: {
    id: string
    nombre: string
    edad: number | null
    especie: string | null
    raza: string | null
    sexo: string
    fecha_nacimiento: string | null
    peso: number | null
  }
  propietario: {
    usuario_id: string
    nombre_completo: string
    email: string
    telefono: string | null
  }
  fecha_creacion: string
  fecha_actualizacion: string
  estado_vacunacion_actual: string
  consultas: ConsultaDetail[]
  estadisticas: Record<string, unknown>
  medicamentos_frecuentes: Array<{ medicamento: string; total: number }>
}

export interface ConsultaDetail {
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
  consulta: number                  
  medicamento: number
  producto_nombre: string           
  producto_descripcion: string      
  cantidad: number                  
  stock_disponible: number          
  indicaciones: string              
  fecha_prescripcion: string       
}

export interface ExamenDetail {
  id: number
  tipo_examen: string    
  descripcion: string    
}

export interface VacunaDetail {
  id: number
  estado: string                    
  estado_display: string            
  vacunas_descripcion: string       
  fecha_registro: string            
}

export interface LastConsultResponse {
  mascota_nombre: string
  propietario_nombre: string
  ultima_consulta: ConsultaDetail | null
  mensaje?: string
}