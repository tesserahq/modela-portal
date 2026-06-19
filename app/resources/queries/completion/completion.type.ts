import { UserCompactType } from '../analytic/analytic.type'

export type CompletionRequestType = {
  id: string
  request_id: string
  project_id: string
  model_config_slug: string | null
  provider: string
  model: string
  input_tokens: number | null
  output_tokens: number | null
  latency_ms: number | null
  cost_estimate_usd: string
  finish_reason: string | null
  created_by_id: string | null
  created_by: UserCompactType
  created_at: string
  updated_at: string
}

/**
 * Chat completion message (OpenAI-style)
 */
export type ChatMessageRole = 'system' | 'user' | 'assistant' | 'tool'

export type ChatMessage = {
  role: ChatMessageRole
  content: string
}

/**
 * Chat completion request body (POST /chat/completions)
 */
export type ChatCompletionRequest = {
  model: string
  messages: ChatMessage[]
}

/**
 * Chat completion response (OpenAI-style)
 */
export type ChatCompletionChoice = {
  index: number
  // message is a flexible object; commonly { role, content }
  message: Record<string, unknown>
  finish_reason: string | null
}

export type ChatCompletionUsage = {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

export type ChatCompletionResponse = {
  id: string
  object: string
  created: number
  model: string
  choices: ChatCompletionChoice[]
  usage: ChatCompletionUsage
}
