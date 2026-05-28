import { fetchApi } from '@/libraries/fetch'
import { IPaging } from '@/resources/types'
import { IQueryConfig, IQueryParams } from '..'
import {
  CreateModelConfigData,
  AttachModelConfigMCPServerData,
  ModelConfigType,
  UpdateModelConfigData,
} from './model-config.type'
import { McpServerType } from '../mcp-servers/mcp-server.type'

const RESOURCE_URL = '/model-configs'

export async function getModelConfigs(
  config: IQueryConfig,
  params: IQueryParams
): Promise<IPaging<ModelConfigType>> {
  const { apiUrl, token, nodeEnv } = config
  const { page, size } = params

  const res = await fetchApi(`${apiUrl}${RESOURCE_URL}`, token, nodeEnv, {
    method: 'GET',
    pagination: { page, size },
  })

  return res as IPaging<ModelConfigType>
}

export async function getModelConfig(config: IQueryConfig, id: string): Promise<ModelConfigType> {
  const { apiUrl, token, nodeEnv } = config

  const res = await fetchApi(`${apiUrl}${RESOURCE_URL}/${id}`, token, nodeEnv, {
    method: 'GET',
  })

  return res as ModelConfigType
}

export async function createModelConfig(
  config: IQueryConfig,
  data: CreateModelConfigData
): Promise<ModelConfigType> {
  const { apiUrl, token, nodeEnv } = config

  const res = await fetchApi(`${apiUrl}${RESOURCE_URL}`, token, nodeEnv, {
    method: 'POST',
    body: JSON.stringify(data),
  })

  return res as ModelConfigType
}

export async function updateModelConfig(
  config: IQueryConfig,
  id: string,
  data: UpdateModelConfigData
): Promise<ModelConfigType> {
  const { apiUrl, token, nodeEnv } = config

  const contextSource = await fetchApi(`${apiUrl}${RESOURCE_URL}/${id}`, token, nodeEnv, {
    method: 'PUT',
    body: JSON.stringify(data),
  })

  return contextSource as ModelConfigType
}

export async function deleteModelConfig(config: IQueryConfig, id: string): Promise<void> {
  const { apiUrl, token, nodeEnv } = config

  await fetchApi(`${apiUrl}${RESOURCE_URL}/${id}`, token, nodeEnv, {
    method: 'DELETE',
  })
}

export async function getModelConfigMCPServer(
  config: IQueryConfig,
  params: IQueryParams,
  id: string
): Promise<IPaging<McpServerType>> {
  const { apiUrl, token, nodeEnv } = config
  const { page, size } = params

  const res = await fetchApi(`${apiUrl}${RESOURCE_URL}/${id}/mcp-servers`, token, nodeEnv, {
    method: 'GET',
    pagination: { page, size },
  })

  return res as IPaging<McpServerType>
}

export async function createModelConfigMCPServer(
  config: IQueryConfig,
  id: string,
  data: AttachModelConfigMCPServerData
): Promise<string> {
  const { apiUrl, token, nodeEnv } = config

  const res = await fetchApi(`${apiUrl}${RESOURCE_URL}/${id}/mcp-servers`, token, nodeEnv, {
    method: 'POST',
    body: JSON.stringify(data),
  })

  return res as string
}

export async function deleteModelConfigMCPServer(
  config: IQueryConfig,
  id: string,
  serverID: string
): Promise<void> {
  const { apiUrl, token, nodeEnv } = config

  await fetchApi(`${apiUrl}${RESOURCE_URL}/${id}/mcp-servers/${serverID}`, token, nodeEnv, {
    method: 'DELETE',
  })
}
