import { fetchApi } from '@/libraries/fetch'
import { IPaging } from '@/resources/types'
import { IQueryConfig, IQueryParams } from '..'
import {
  CreateSystemPromptData,
  CreateSystemPromptVersionData,
  SystemPromptType,
  SystemPromptVersionType,
  UpdateSystemPromptData,
} from './system-prompt.type'

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

export async function getSystemPrompt(config: IQueryConfig, id: string): Promise<SystemPromptType> {
  const { apiUrl, token, nodeEnv } = config

  const res = await fetchApi(`${apiUrl}${RESOURCE_URL}/${id}`, token, nodeEnv, {
    method: 'GET',
  })

  return res as SystemPromptType
}

export async function createSystemPrompt(
  config: IQueryConfig,
  data: CreateSystemPromptData
): Promise<SystemPromptType> {
  const { apiUrl, token, nodeEnv } = config
  const res = await fetchApi(`${apiUrl}${RESOURCE_URL}`, token, nodeEnv, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return res as SystemPromptType
}

export async function updateSystemPrompt(
  config: IQueryConfig,
  id: string,
  data: UpdateSystemPromptData
): Promise<SystemPromptType> {
  const { apiUrl, token, nodeEnv } = config
  const res = await fetchApi(`${apiUrl}${RESOURCE_URL}/${id}`, token, nodeEnv, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return res as SystemPromptType
}

export async function deleteSystemPrompt(config: IQueryConfig, id: string): Promise<void> {
  const { apiUrl, token, nodeEnv } = config
  await fetchApi(`${apiUrl}${RESOURCE_URL}/${id}`, token, nodeEnv, {
    method: 'DELETE',
  })
}

export async function getSystemPromptVersions(
  config: IQueryConfig,
  name: string,
  params: IQueryParams
): Promise<IPaging<SystemPromptVersionType>> {
  const { apiUrl, token, nodeEnv } = config
  const { page, size } = params

  const res = await fetchApi(`${apiUrl}${RESOURCE_URL}/${name}/versions`, token, nodeEnv, {
    method: 'GET',
    pagination: { page, size },
  })

  return res as IPaging<SystemPromptVersionType>
}

export async function createSystemPromptVersion(
  config: IQueryConfig,
  name: string,
  data: CreateSystemPromptVersionData
): Promise<SystemPromptVersionType> {
  const { apiUrl, token, nodeEnv } = config
  const res = await fetchApi(`${apiUrl}${RESOURCE_URL}/${name}/versions`, token, nodeEnv, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return res as SystemPromptVersionType
}
