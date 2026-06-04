import { z } from 'zod/v4'

export const systemPromptSchema = z.object({
  name: z.string().min(1, 'Name is required').max(64),
  content: z.string().optional(),
  note: z.string().max(512).optional().nullable(),
})

export type SystemPromptFormValue = z.infer<typeof systemPromptSchema>

export const systemPromptFormDefaultValue: SystemPromptFormValue = {
  name: '',
  content: '',
  note: null,
}

export const systemPromptVersionSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  note: z.string().max(512).optional().nullable(),
})

export type SystemPromptVersionFormValue = z.infer<typeof systemPromptVersionSchema>

export const systemPromptVersionFormDefaultValue: SystemPromptVersionFormValue = {
  content: '',
  note: null,
}
