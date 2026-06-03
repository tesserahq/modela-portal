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
  mock?: boolean,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: analyticQueryKeys.cost(config, params),
    queryFn: async (): Promise<AnalyticCostSummaryType[]> => {
      try {
        if (mock) {
          await new Promise((r) => setTimeout(r, 400)) // simulate latency
          return ANALYTIC_COST_MOCK[params.group_by].slice(0, params.limit ?? 10)
        }
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

// analytic.mock.ts
export const ANALYTIC_COST_MOCK: Record<string, AnalyticCostSummaryType[]> = {
  user: [
    { group_key: 'user', group_value: 'user_8f3k2j1', total_cost_usd: '5821.44' },
    { group_key: 'user', group_value: 'user_2m4n5p6', total_cost_usd: '4310.20' },
    { group_key: 'user', group_value: 'user_9x7y8z1', total_cost_usd: '3102.75' },
    { group_key: 'user', group_value: 'user_4a5b6c7', total_cost_usd: '2487.10' },
    { group_key: 'user', group_value: 'user_1d2e3f4', total_cost_usd: '1998.63' },
    { group_key: 'user', group_value: 'Unattributed', total_cost_usd: '1540.80' },
    { group_key: 'user', group_value: 'user_7c8d9e0', total_cost_usd: '980.45' },
    { group_key: 'user', group_value: 'user_3f4g5h6', total_cost_usd: '621.00' },
    { group_key: 'user', group_value: 'user_5i6j7k8', total_cost_usd: '420.00' },
    { group_key: 'user', group_value: 'user_0l1m2n3', total_cost_usd: '140.00' },
  ],
  provider: [
    { group_key: 'provider', group_value: 'Anthropic', total_cost_usd: '9800.00' },
    { group_key: 'provider', group_value: 'OpenAI', total_cost_usd: '6200.00' },
    { group_key: 'provider', group_value: 'Google', total_cost_usd: '2800.00' },
    { group_key: 'provider', group_value: 'Mistral', total_cost_usd: '1200.00' },
    { group_key: 'provider', group_value: 'Cohere', total_cost_usd: '422.37' },
  ],
  model: [
    { group_key: 'model', group_value: 'gpt-4o', total_cost_usd: '40800.00' },
    { group_key: 'model', group_value: 'claude-opus-4', total_cost_usd: '7200.00' },
    { group_key: 'model', group_value: 'claude-sonnet-4', total_cost_usd: '3100.00' },
    { group_key: 'model', group_value: 'gemini-1.5-pro', total_cost_usd: '2200.00' },
    { group_key: 'model', group_value: 'mistral-large', total_cost_usd: '1500.00' },
    { group_key: 'model', group_value: 'claude-haiku-4', total_cost_usd: '980.00' },
    { group_key: 'model', group_value: 'gpt-4o-mini', total_cost_usd: '642.37' },
  ],
  project_id: [
    { group_key: 'project_id', group_value: 'linden-portal', total_cost_usd: '6100.00' },
    { group_key: 'project_id', group_value: 'conversa-portal', total_cost_usd: '4800.00' },
    { group_key: 'project_id', group_value: 'custos-portal', total_cost_usd: '3900.00' },
    { group_key: 'project_id', group_value: 'looply-portal', total_cost_usd: '2900.00' },
    { group_key: 'project_id', group_value: 'backoffice', total_cost_usd: '1800.00' },
    { group_key: 'project_id', group_value: 'Unattributed', total_cost_usd: '922.37' },
  ],
}
