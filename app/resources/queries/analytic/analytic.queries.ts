import { fetchApi } from '@/libraries/fetch'
import { IQueryConfig } from '..'
import { AnalyticCostSummaryType, AnalyticQueryParams } from './analytic.type'

const RESOURCE_URL = '/analytics'

export async function getAnalyticCosts(
  config: IQueryConfig,
  params: AnalyticQueryParams
): Promise<AnalyticCostSummaryType[]> {
  const { apiUrl, token, nodeEnv } = config

  const result = await fetchApi(`${apiUrl}${RESOURCE_URL}/costs`, token, nodeEnv, {
    method: 'GET',
    params: params,
  })

  return result as AnalyticCostSummaryType[]
}
