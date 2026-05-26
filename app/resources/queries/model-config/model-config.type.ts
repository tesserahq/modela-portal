export type ModelConfigEnum = 'chat' | 'summary' | 'generation'

/**
 * model config type (list/detail item from API)
 */
export type ModelConfigType = {
  slug: string
  name: string
  provider: string
  model: string
  system_prompt_id: string
  temperature: number
  max_tokens: number
  top_p: number
  output_schema: Record<string, unknown>
  config_type: ModelConfigEnum
  is_default: boolean
  max_tool_rounds: number
  id: string
  created_at: string
  updated_at: string
}

/**
 * Create model config data (POST body)
 */
export type CreateModelConfigData = Pick<ModelConfigType, 'slug' | 'name' | 'provider' | 'model'> &
  Partial<
    Pick<
      ModelConfigType,
      | 'system_prompt_id'
      | 'temperature'
      | 'max_tokens'
      | 'top_p'
      | 'output_schema'
      | 'config_type'
      | 'is_default'
      | 'max_tool_rounds'
    >
  >

/**
 * Update model config data (PATCH body, all fields optional)
 */
export type UpdateModelConfigData = Partial<
  Omit<CreateModelConfigData, 'slug' | 'provider' | 'model'>
>

/**
 * Model config form data (for form submission)
 */
export type ModelConfigFormData = CreateModelConfigData
