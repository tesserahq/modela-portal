import { z } from 'zod/v4'

export const modelConfigSchema = z.object({
  slug: z.string().min(1, 'Slug is required').max(255),
  name: z.string().min(1, 'Name is required').max(255),
  provider: z.string().min(1, 'Provider is required').max(100),
  model: z.string().min(1, 'Model is required').max(255),
  system_prompt_id: z.string().optional().nullable(),
  temperature: z.coerce.number().min(0).max(2).optional().nullable(),
  max_tokens: z.coerce.number().int().positive().optional().nullable(),
  top_p: z.coerce.number().min(0).max(1).optional().nullable(),
  output_schema: z.record(z.string(), z.unknown()).optional(),
  config_type: z.enum(['chat', 'summary', 'generation']).default('chat'),
  is_default: z.boolean().default(false),
  max_tool_rounds: z.coerce.number().int().min(1).max(50).optional(),
})

export type ModelConfigFormValue = z.infer<typeof modelConfigSchema>

export const modelConfigFormDefaultValue: ModelConfigFormValue = {
  slug: '',
  name: '',
  provider: '',
  model: '',
  system_prompt_id: undefined,
  temperature: null,
  max_tokens: null,
  top_p: null,
  max_tool_rounds: undefined,
  output_schema: {},
  config_type: 'chat',
  is_default: false,
}

export const modelConfigMCPServerSchema = z.object({
  server_id: z.string().min(1, 'Server ID is required'),
})

export type ModelConfigMCPServerFormValue = z.infer<typeof modelConfigMCPServerSchema>

export const modelConfigMCPServerFormDefaultValue: ModelConfigMCPServerFormValue = {
  server_id: '',
}
