import type { PaginatedResponse } from '@/api/types/common'

export interface Species {
  id: number
  nombre: string
}

export interface Breed {
  id: number
  nombre: string
  especie: Species
}

export type SpeciesListResponse = Species[] | PaginatedResponse<Species>
export type BreedListResponse = Breed[] | PaginatedResponse<Breed>

export interface Pet {
  id: number
  nombre: string
  sexo: string
  especie: string | Species | null
  raza: string | Breed | null
  fecha_nacimiento: string | null
  peso: string | number | null
  cliente?: string | null
  created_at: string
}

export interface PetPayload {
  nombre: string
  sexo: string
  especie?: number | null
  raza?: number | null
  fecha_nacimiento?: string | null
  peso?: number | null
}

export type PetListResponse = Pet[] | PaginatedResponse<Pet>

