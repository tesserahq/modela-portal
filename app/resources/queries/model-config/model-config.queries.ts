import { fetchApi } from '@/libraries/fetch'
import { IPaging } from '@/resources/types'
import { IQueryConfig, IQueryParams } from '..'
import { CreateModelConfigData, ModelConfigType, UpdateModelConfigData } from './model-config.type'

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
