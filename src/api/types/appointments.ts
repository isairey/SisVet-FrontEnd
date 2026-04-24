// Definimos los estados exactos que maneja el patrón State del Backend
// SSOT: Coincide con las constantes en citas/patterns/state/base.py y la nueva adición de EN_PROGRESO
export type AppointmentStatus = 
  | 'AGENDADA' 
  | 'CANCELADA' 
  | 'COMPLETADA'   // El backend usa COMPLETADA, no REALIZADA
  | 'EN_PROGRESO'; // El nuevo estado que acordamos agregar

export interface AppointmentSummary {
  id: number
  mascota_nombre: string
  mascota: number
  veterinario_nombre: string | null
  servicio_nombre: string | null
  servicio: number
  fecha_hora: string
  estado: string
  consulta_id?: number | null 

}

// Alineado con CrearCitaSerializer en citas/serializers/escribir.py
export interface AppointmentPayload {
  mascota_id: number;
  veterinario_id: number;
  servicio_id: number;
  fecha_hora: string; // Debe ser formato ISO
  observaciones?: string;
}

// Payload para la acción de reagendar
export interface ReagendarPayload {
  fecha_hora: string;
}

export interface ServiceItem {
  id: number;
  nombre: string;
  costo: string; // Django DecimalField se serializa como string usualmente
}

export interface AvailabilityResponse {
  horarios_disponibles: string[];
}

// Tipos para manejo de errores robusto (DRF Standard)
export interface ValidationErrorResponse {
  detail?: string; // Error general (ej: excepción de negocio "Horario ocupado")
  [key: string]: string[] | string | undefined; // Errores por campo (ej: fecha_hora: ["No puede ser pasado"])
}