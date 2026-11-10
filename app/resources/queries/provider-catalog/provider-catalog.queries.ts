import { fetchApi } from '@/libraries/fetch'
import { IPaging } from '@/resources/types'
import { IQueryConfig, IQueryParams } from '..'
import { ProviderCatalogChangeFilters, ProviderCatalogChangeType } from './provider-catalog.type'

const RESOURCE_URL = '/providers/catalog-changes'

export async function getProviderCatalogChanges(
  config: IQueryConfig,
  params: IQueryParams & ProviderCatalogChangeFilters
): Promise<IPaging<ProviderCatalogChangeType>> {
  const { apiUrl, token, nodeEnv } = config
  const { page, size, ...filters } = params

  const res = await fetchApi(`${apiUrl}${RESOURCE_URL}`, token, nodeEnv, {
    method: 'GET',
    pagination: { page, size },
    params: {
      provider_id: filters.provider_id,
      kind: filters.kind,
      reviewed: filters.reviewed,
    },
  })

  return res as IPaging<ProviderCatalogChangeType>
}

export async function setProviderCatalogChangeReviewed(
  config: IQueryConfig,
  id: string,
  reviewed: boolean
): Promise<ProviderCatalogChangeType> {
  const { apiUrl, token, nodeEnv } = config

  const res = await fetchApi(`${apiUrl}${RESOURCE_URL}/${id}`, token, nodeEnv, {
    method: 'PATCH',
    body: JSON.stringify({ reviewed }),
  })

  return res as ProviderCatalogChangeType
}
