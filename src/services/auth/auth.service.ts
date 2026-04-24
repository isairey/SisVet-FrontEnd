import { apiClient } from '@/api/httpClient'
import { endpoints } from '@/api/endpoints'
import type {
  LoginPayload,
  LoginResponse,
  RefreshResponse,
  RegisterSimplePayload,
  RegisterStepOnePayload,
  RegisterVerifyPayload,
  VerifyResponse,
} from '@/api/types/auth'

type ApiMessageResponse = {
  success?: boolean
  message?: string
  detail?: string
  [key: string]: unknown
}

const login = async (payload: LoginPayload) => {
  const { data } = await apiClient.post<LoginResponse>(endpoints.auth.login(), payload)
  return data
}

const refresh = async (refreshToken: string) => {
  const { data } = await apiClient.post<RefreshResponse>(endpoints.auth.refresh(), {
    refresh: refreshToken,
  })
  return data
}

const logout = async (refreshToken: string) => {
  await apiClient.post(endpoints.auth.logout(), { refresh: refreshToken })
}

const verifySession = async () => {
  const { data } = await apiClient.get<VerifyResponse>(endpoints.auth.verifyToken())
  return data
}

const registerSimple = async (payload: RegisterSimplePayload) => {
  const { data } = await apiClient.post<ApiMessageResponse>(endpoints.auth.register(), payload)
  return data
}

const registerStepOne = async (payload: RegisterStepOnePayload) => {
  const { data } = await apiClient.post<ApiMessageResponse>(endpoints.auth.registerStepOne(), payload)
  return data
}

const verifyRegistrationCode = async (payload: RegisterVerifyPayload) => {
  const { data } = await apiClient.post<ApiMessageResponse>(endpoints.auth.registerVerify(), payload)
  return data
}

const resendVerificationCode = async (payload: { email: string }) => {
  const { data } = await apiClient.post<ApiMessageResponse>(endpoints.auth.registerResend(), payload)
  return data
}

export const authService = {
  login,
  refresh,
  logout,
  verifySession,
  registerSimple,
  registerStepOne,
  verifyRegistrationCode,
  resendVerificationCode,
}

