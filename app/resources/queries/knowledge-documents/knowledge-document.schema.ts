import { z } from 'zod/v4'

const MAX_RAW_CONTENT_BYTES = 1_048_576

export const knowledgeDocumentSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255),
  raw_content: z
    .string()
    .min(1, 'Content is required')
    .refine(
      (value) => new TextEncoder().encode(value).byteLength <= MAX_RAW_CONTENT_BYTES,
      'Content must not exceed 1 MiB when UTF-8 encoded'
    ),
})

export type KnowledgeDocumentFormValue = z.infer<typeof knowledgeDocumentSchema>

export const knowledgeDocumentFormDefaultValue: KnowledgeDocumentFormValue = {
  title: '',
  raw_content: '',
}
