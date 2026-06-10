/* eslint-disable @typescript-eslint/no-explicit-any */
import { IQueryConfig } from '@/resources/queries'
import { useQuery } from '@tanstack/react-query'
import {
  AnalyticCostSummaryType,
  AnalyticQueryParams,
  getAnalyticCosts,
} from '@/resources/queries/analytic'

class QueryError extends Error {
  code?: string
  constructor(message: string, code?: string) {
    super(message)
    this.name = 'QueryError'
    this.code = code
  }
}

export const analyticQueryKeys = {
  all: ['analytics'] as const,
  costs: () => [...analyticQueryKeys.all, 'costs'] as const,
  cost: (config: IQueryConfig, params: AnalyticQueryParams) =>
    [...analyticQueryKeys.costs(), config, params] as const,
}

export function useAnalyticCosts(
  config: IQueryConfig,
  params: AnalyticQueryParams,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: analyticQueryKeys.cost(config, params),
    queryFn: async (): Promise<AnalyticCostSummaryType[]> => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }
        return await getAnalyticCosts(config, params)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime ?? 0,
    enabled: options?.enabled !== false && !!config.token,
  })
}
