import { apiClient } from '@/api/httpClient'
import { endpoints } from '@/api/endpoints'
import type { FinancialReport } from '@/api/types/billing'

export const getFinancialReports = async (): Promise<FinancialReport> => {
  const { data } = await apiClient.get<FinancialReport>(endpoints.billing.financialReports())
  return data
}

