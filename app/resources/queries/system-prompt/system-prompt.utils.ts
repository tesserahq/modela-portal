import { SystemPromptFormValue, SystemPromptVersionFormValue } from './system-prompt.schema'
import {
  SystemPromptFormData,
  SystemPromptType,
  CreateSystemPromptVersionData,
} from './system-prompt.type'

/**
 * Convert API system prompt to form values
 */
export function systemPromptToFormValues(data: SystemPromptType): SystemPromptFormValue {
  return {
    name: data.name,
    content: data.current_version?.content ?? '',
    note: null,
  }
}

/**
 * Convert form values to system prompt API data (POST body)
 */
export function formValuesToSystemPromptData(
  formValues: SystemPromptFormValue
): SystemPromptFormData {
  return {
    name: formValues.name,
    content: formValues.content,
    note: formValues.note || null,
  }
}

/**
 * Convert form values to system prompt version API data (POST body)
 */
export function formValuesToSystemPromptVersionData(
  formValues: SystemPromptVersionFormValue
): CreateSystemPromptVersionData {
  return {
    content: formValues.content,
    note: formValues.note || null,
  }
}
