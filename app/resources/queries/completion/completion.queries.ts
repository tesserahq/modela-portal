import { fetchApi } from '@/libraries/fetch'
import { IQueryConfig, IQueryParams } from '..'
import { IPaging } from '@/resources/types'
import { CompletionRequestType } from './completion.type'

const RESOURCE_URL = '/completion-requests'

export async function getCompletionRequests(
  config: IQueryConfig,
  params: IQueryParams
): Promise<IPaging<CompletionRequestType>> {
  const { apiUrl, token, nodeEnv } = config
  const { page, size } = params

  const res = await fetchApi(`${apiUrl}${RESOURCE_URL}`, token, nodeEnv, {
    method: 'GET',
    pagination: { page, size },
  })

  return res as IPaging<CompletionRequestType>
}

export async function getCompletionRequest(
  config: IQueryConfig,
  id: string
): Promise<CompletionRequestType> {
  const { apiUrl, token, nodeEnv } = config

  const res = await fetchApi(`${apiUrl}${RESOURCE_URL}/${id}`, token, nodeEnv, {
    method: 'GET',
  })

  return res as CompletionRequestType
}
