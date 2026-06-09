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
  created_by: {
    id: string
    first_name: string
    last_name: string
    email: string | null
  }
  created_at: string
  updated_at: string
}
