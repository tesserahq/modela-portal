import { fetchApi } from '@/libraries/fetch'
import { IQueryConfig, IQueryParams } from '..'
import { IPaging } from '@/resources/types'
import {
  ChatCompletionRequest,
  ChatCompletionResponse,
  CompletionRequestType,
  FileRequest,
  ScanResponse,
  SummarizeResponse,
  SummarizeTextRequest,
} from './completion.type'

const RESOURCE_URL = '/completion-requests'
const CHAT_COMPLETIONS_URL = '/chat/completions'
const SCAN_FILE_URL = '/scan/file'
const SUMMARIZE_TEXT_URL = '/summarize/text'
const SUMMARIZE_FILE_URL = '/summarize/file'

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

export async function createChatCompletion(
  config: IQueryConfig,
  body: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const { apiUrl, token, nodeEnv } = config

  const res = await fetchApi(`${apiUrl}${CHAT_COMPLETIONS_URL}`, token, nodeEnv, {
    method: 'POST',
    body: JSON.stringify(body),
  })

  return res as ChatCompletionResponse
}

export async function createScanFile(
  config: IQueryConfig,
  body: FileRequest
): Promise<ScanResponse> {
  const { apiUrl, token, nodeEnv } = config

  const res = await fetchApi(`${apiUrl}${SCAN_FILE_URL}`, token, nodeEnv, {
    method: 'POST',
    body: JSON.stringify(body),
  })

  return res as ScanResponse
}

export async function createSummarize(
  config: IQueryConfig,
  body: SummarizeTextRequest | FileRequest
): Promise<SummarizeResponse> {
  const { apiUrl, token, nodeEnv } = config
  const url = 'file_url' in body ? SUMMARIZE_FILE_URL : SUMMARIZE_TEXT_URL

  const res = await fetchApi(`${apiUrl}${url}`, token, nodeEnv, {
    method: 'POST',
    body: JSON.stringify(body),
  })

  return res as SummarizeResponse
}
