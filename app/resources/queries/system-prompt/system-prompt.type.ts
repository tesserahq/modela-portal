/**
 * System prompt version (list/detail item from API)
 */
export type SystemPromptVersionType = {
  id: string
  system_prompt_id: string
  content: string
  version_number: number
  created_at: string
  note: string | null
}

/**
 * System prompt type (list/detail item from API)
 */
export type SystemPromptType = {
  id: string
  name: string
  current_version_id: string | null
  current_version: SystemPromptVersionType | null
  created_at: string
  updated_at: string
}

/**
 * System prompt data (POST body)
 */
export type CreateSystemPromptData = {
  name: string
  content?: string
  note?: string | null
}

/**
 * Update system prompt data (PUT body)
 */
export type UpdateSystemPromptData = Partial<CreateSystemPromptData>

/**
 * system prompt form data (for form submission)
 */
export type SystemPromptFormData = CreateSystemPromptData

/**
 * Create system prompt version data (POST body)
 */
export type CreateSystemPromptVersionData = {
  content: string
  note?: string | null
}
