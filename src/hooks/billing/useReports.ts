import { useQuery } from '@tanstack/react-query'
import { getFinancialReports } from '@/services/billing/reports.service'

const QUERY_KEYS = {
  all: ['financialReports'] as const,
  reports: () => [...QUERY_KEYS.all, 'list'] as const,
}

export const useFinancialReportsQuery = () => {
  return useQuery({
    queryKey: QUERY_KEYS.reports(),
    queryFn: getFinancialReports,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    refetchOnWindowFocus: false,
  })
}

