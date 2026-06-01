import { fetchApi } from '@/libraries/fetch'
import { IPaging } from '@/resources/types'
import { IQueryConfig, IQueryParams } from '..'
import { SystemPromptType } from './system-prompt.type'

const RESOURCE_URL = '/system-prompts'

export async function getSystemPrompts(
  config: IQueryConfig,
  params: IQueryParams
): Promise<IPaging<SystemPromptType>> {
  const { apiUrl, token, nodeEnv } = config
  const { page, size } = params

  const res = await fetchApi(`${apiUrl}${RESOURCE_URL}`, token, nodeEnv, {
    method: 'GET',
    pagination: { page, size },
  })

  return res as IPaging<SystemPromptType>
}
