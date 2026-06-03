export type AnalyticCostSummaryType = {
  group_key: string
  group_value: string | null
  total_cost_usd: string
}

export type AnalyticCostGroupEnum = 'user' | 'provider' | 'model' | 'project_id'

/**
 * Extended params for analytic queries
 */
export interface AnalyticQueryParams {
  [key: string]: string | number | boolean | undefined
  group_by: AnalyticCostGroupEnum
  start_date?: string
  end_date?: string
  project_id?: string
  provider?: string
  model?: string
  created_by_id?: string
  limit?: number
}
