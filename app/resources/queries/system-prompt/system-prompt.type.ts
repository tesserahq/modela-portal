/**
 * Resource type (list/detail item from API)
 */
export type SystemPromptType = {
  id: string
  name: string
  current_version_id: string
  current_version: {
    id: string
    system_prompt_id: string
    content: string
    version_number: number
    created_at: string
    note: string
  }
  created_at: string
  updated_at: string
}
