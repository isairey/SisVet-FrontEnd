import { appConfig } from '@/core/config/app-config'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)

const locale = 'es-CO'

// IMPORTANTE: Forzamos la zona horaria de la clínica como la Única Fuente de Verdad (SSOT).
// Si no está definida en la config, usamos 'America/Bogota' por defecto.
// Esto evita que el navegador use la hora local del usuario (ej: UTC o España) al visualizar.
const CLINIC_TIMEZONE = appConfig.timeZone || 'America/Bogota'

/**
 * Formatea una fecha ISO (ej: 2023-11-27T15:00:00Z) para mostrarla al usuario
 * en la zona horaria de la clínica.
 */
export const formatDateTime = (isoString: string, options?: Intl.DateTimeFormatOptions) => {
  if (!isoString) return '—'

  try {
    // Aseguramos que tratamos con un objeto Date válido
    const date = new Date(isoString)

    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: CLINIC_TIMEZONE, // <--- Clave: Muestra la hora de la clínica, no la del navegador
      hour12: true, // Preferencia usual en LatAm (02:00 p.m.)
      ...options,
    }).format(date)
  } catch (error) {
    console.error('No se pudo formatear la fecha', error)
    return isoString
  }
}

/**
 * Construye un ISO String sin offset (naive datetime).
 * 
 * El backend tiene configurado TIME_ZONE = 'America/Bogota' y lo interpretará
 * correctamente como hora local de Colombia.
 * 
 * @param dateStr Formato YYYY-MM-DD
 * @param timeStr Formato HH:mm
 * 
 * Ejemplo: "2025-12-01T08:00:00" será interpretado por Django como 08:00 AM hora Colombia
 */
export const buildClinicISOString = (dateStr: string, timeStr: string): string => {
  // Validación defensiva básica
  if (!dateStr || !timeStr) return ''

  // Aseguramos que la hora tenga segundos para cumplir formato ISO estricto
  const time = timeStr.length === 5 ? `${timeStr}:00` : timeStr
  
  // Enviar SIN offset (naive datetime)
  // Django con TIME_ZONE = 'America/Bogota' lo interpretará como hora local
  const isoString = `${dateStr}T${time}`
  
  return isoString
}

/**
 * Extrae la fecha (YYYY-MM-DD) de un string ISO
 * Útil para inicializar date pickers con fechas existentes
 */
export const parseDateFromISO = (isoString: string): string | null => {
  if (!isoString) return null
  
  try {
    // Usar dayjs para parsear y convertir a la zona horaria de la clínica
    const date = dayjs(isoString).tz(CLINIC_TIMEZONE)
    if (!date.isValid()) return null
    return date.format('YYYY-MM-DD')
  } catch (error) {
    console.error('Error al parsear fecha ISO:', error)
    return null
  }
}

/**
 * Extrae la hora (HH:mm) de un string ISO en la zona horaria de la clínica
 */
export const parseTimeFromISO = (isoString: string): string | null => {
  if (!isoString) return null
  
  try {
    const date = dayjs(isoString).tz(CLINIC_TIMEZONE)
    if (!date.isValid()) return null
    return date.format('HH:mm')
  } catch (error) {
    console.error('Error al parsear hora ISO:', error)
    return null
  }
}
