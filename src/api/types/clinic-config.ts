/**
 * Tipos TypeScript para el módulo de Configuración de la Clínica
 */

// Servicios
export interface Service {
  id: number
  nombre: string
  costo: string | number
  created_at?: string
  updated_at?: string
}

export interface ServicePayload {
  nombre: string
  costo: number | string
}

// Categorías (ya existe InventoryCategory, pero la usaremos directamente)
export interface Category {
  id: number
  descripcion: string
  color?: string
}

export interface CategoryPayload {
  descripcion: string
  color?: string
}

// Marcas (ya existe InventoryBrand, pero la usaremos directamente)
export interface Brand {
  id: number
  descripcion: string
}

export interface BrandPayload {
  descripcion: string
}

// Especies (ya existe Species en pets.ts)
// Razas (ya existe Breed en pets.ts)

// Métodos de Pago (ya existe PaymentMethod en billing.ts)

// Tipos de respuesta paginada
export type ServiceListResponse = Service[] | { count: number; results: Service[]; next: string | null; previous: string | null }
export type CategoryListResponse = Category[] | { count: number; results: Category[]; next: string | null; previous: string | null }
export type BrandListResponse = Brand[] | { count: number; results: Brand[]; next: string | null; previous: string | null }

