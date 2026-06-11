export type ModelConfigEnum = 'chat' | 'summary' | 'generation'

/**
 * model config type (list/detail item from API)
 */
export type ModelConfigType = {
  slug: string
  name: string
  provider: string
  model: string
  system_prompt_id: string | null
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
  system_prompt: {
    id: string
    name: string
    content: string
  }
}

/**
 *  Model config data (POST body)
 */
export type ModelConfigData = Pick<ModelConfigType, 'slug' | 'name' | 'provider' | 'model'> &
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
export type UpdateModelConfigData = Partial<Omit<ModelConfigData, 'slug'>>

/**
 * Model config form data (for form submission)
 */
export type ModelConfigFormData = ModelConfigData

/**
 * Model config connect mcp server
 */
export type AttachModelConfigMCPServerData = {
  server_id: string
}

/**
 * LLM provider and model type
 */
export type LLMModel = {
  id: string
  name: string
}

export type LLMProvider = {
  id: string
  name: string
  models: LLMModel[]
  parameters: ProviderParameters | null
}

type ParameterSpec = {
  default: number | null
  min: number | null
  max: number | null
}

type ProviderParameters = {
  temperature: ParameterSpec | null
  top_p: ParameterSpec | null
  max_tokens: ParameterSpec | null
  exclusive_parameter_groups: string[][] | null
}
