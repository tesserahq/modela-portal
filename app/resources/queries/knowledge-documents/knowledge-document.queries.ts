import { fetchApi } from '@/libraries/fetch'
import { IQueryConfig, IQueryParams } from '@/resources/queries'
import { IPaging } from '@/resources/types'
import {
  CreateKnowledgeDocumentData,
  KnowledgeDocumentType,
  UpdateKnowledgeDocumentData,
} from './knowledge-document.type'

const RESOURCE_URL = '/knowledge-documents'

export async function getKnowledgeDocuments(
  config: IQueryConfig,
  params: IQueryParams
): Promise<IPaging<KnowledgeDocumentType>> {
  const { apiUrl, token, nodeEnv } = config
  const response = await fetchApi(`${apiUrl}${RESOURCE_URL}`, token, nodeEnv, {
    method: 'GET',
    pagination: { page: params.page, size: params.size },
  })
  return response as IPaging<KnowledgeDocumentType>
}

export async function getKnowledgeDocument(
  config: IQueryConfig,
  id: string
): Promise<KnowledgeDocumentType> {
  const { apiUrl, token, nodeEnv } = config
  return (await fetchApi(`${apiUrl}${RESOURCE_URL}/${id}`, token, nodeEnv, {
    method: 'GET',
  })) as KnowledgeDocumentType
}

export async function createKnowledgeDocument(
  config: IQueryConfig,
  data: CreateKnowledgeDocumentData
): Promise<KnowledgeDocumentType> {
  const { apiUrl, token, nodeEnv } = config
  return (await fetchApi(`${apiUrl}${RESOURCE_URL}`, token, nodeEnv, {
    method: 'POST',
    body: JSON.stringify(data),
  })) as KnowledgeDocumentType
}

export async function updateKnowledgeDocument(
  config: IQueryConfig,
  id: string,
  data: UpdateKnowledgeDocumentData
): Promise<KnowledgeDocumentType> {
  const { apiUrl, token, nodeEnv } = config
  return (await fetchApi(`${apiUrl}${RESOURCE_URL}/${id}`, token, nodeEnv, {
    method: 'PUT',
    body: JSON.stringify(data),
  })) as KnowledgeDocumentType
}

export async function deleteKnowledgeDocument(config: IQueryConfig, id: string): Promise<void> {
  const { apiUrl, token, nodeEnv } = config
  await fetchApi(`${apiUrl}${RESOURCE_URL}/${id}`, token, nodeEnv, { method: 'DELETE' })
}
