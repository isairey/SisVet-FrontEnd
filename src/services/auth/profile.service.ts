import { apiClient } from '@/api/httpClient'
import { endpoints } from '@/api/endpoints'
import type { UserProfile, VeterinarioProfile, PracticanteProfile, ClienteProfile } from '@/core/types/auth'

type ProfileUpdatePayload = Partial<{
  email: string
  nombre: string
  apellido: string
  estado: string
  perfil_veterinario: Partial<VeterinarioProfile> | null
  perfil_practicante: Partial<PracticanteProfile> | null
  perfil_cliente: Partial<ClienteProfile> | null
}>

const getProfile = async () => {
  const { data } = await apiClient.get<UserProfile>(endpoints.auth.profile())
  return data
}

const updateProfile = async (payload: ProfileUpdatePayload) => {
  const { data } = await apiClient.patch<UserProfile>(endpoints.auth.profile(), payload)
  return data
}

export const profileService = {
  getProfile,
  updateProfile,
}

