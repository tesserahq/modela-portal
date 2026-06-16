import { z } from 'zod/v4'

export interface ModelConfigLimits {
  temperature?: {
    min: number
    max: number
  }
  max_tokens?: {
    min: number
    max: number
  }
  top_p?: {
    min: number
    max: number
  }
}

export const modelConfigSchema = (limits?: ModelConfigLimits) =>
  z.object({
    id: z.string().optional(),
    slug: z.string().min(1, 'Slug is required').max(255),
    name: z.string().min(1, 'Name is required').max(255),
    provider: z.string().min(1, 'Provider is required').max(100),
    model: z.string().min(1, 'Model is required').max(255),
    system_prompt_id: z.string().optional().nullable(),

    temperature: z.preprocess(
      (value) => {
        if (value === '' || value === null || value === undefined) {
          return null
        }

        return Number(value)
      },
      z
        .number()
        .min(limits?.temperature?.min ?? 0)
        .max(limits?.temperature?.max ?? 2)
        .nullable()
    ),

    max_tokens: z.preprocess(
      (value) => {
        if (value === '' || value === null || value === undefined) {
          return null
        }

        return Number(value)
      },
      z
        .number()
        .min(limits?.max_tokens?.min ?? 1)
        .max(limits?.max_tokens?.max ?? Number.MAX_SAFE_INTEGER)
        .optional()
        .nullable()
    ),

    top_p: z.preprocess(
      (value) => {
        if (value === '' || value === null || value === undefined) {
          return null
        }

        return Number(value)
      },
      z
        .number()
        .min(limits?.top_p?.min ?? 0)
        .max(limits?.top_p?.max ?? 1)
        .optional()
        .nullable()
    ),

    output_schema: z.record(z.string(), z.unknown()).optional(),
    config_type: z.string().default('chat'),
    is_default: z.boolean().default(false),
  })

export type ModelConfigFormValue = z.infer<ReturnType<typeof modelConfigSchema>>

export const modelConfigFormDefaultValue: ModelConfigFormValue = {
  slug: '',
  name: '',
  provider: '',
  model: '',
  system_prompt_id: undefined,
  temperature: null,
  max_tokens: undefined,
  top_p: undefined,
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
