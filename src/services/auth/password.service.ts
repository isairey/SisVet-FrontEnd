import { apiClient } from '@/api/httpClient'
import { endpoints } from '@/api/endpoints'
import type {
  ChangePasswordPayload,
  ResetPasswordConfirmPayload,
  ResetPasswordRequestPayload,
} from '@/api/types/auth'

type ApiMessageResponse = {
  success?: boolean
  message?: string
  detail?: string
  [key: string]: unknown
}

const requestReset = async (payload: ResetPasswordRequestPayload) => {
  const { data } = await apiClient.post<ApiMessageResponse>(endpoints.auth.resetPasswordRequest(), payload)
  return data
}

const confirmReset = async (payload: ResetPasswordConfirmPayload) => {
  const { data } = await apiClient.post<ApiMessageResponse>(endpoints.auth.resetPasswordConfirm(), payload)
  return data
}

const changePassword = async (payload: ChangePasswordPayload) => {
  const { data } = await apiClient.post<ApiMessageResponse>(endpoints.auth.changePassword(), payload)
  return data
}

export const passwordService = {
  requestReset,
  confirmReset,
  changePassword,
}

