import { isEqual } from '@/utils/helpers/comparison.helper'
import { ModelConfigFormValue } from './model-config.schema'
import {
  ModelConfigEnum,
  ModelConfigFormData,
  ModelConfigType,
  UpdateModelConfigData,
} from './model-config.type'

export function modelConfigToFormValues(data: ModelConfigType): ModelConfigFormValue {
  return {
    slug: data.slug,
    name: data.name,
    provider: data.provider,
    model: data.model,
    system_prompt_id: data.system_prompt_id,
    temperature: data.temperature ?? null,
    max_tokens: data.max_tokens ?? null,
    top_p: data.top_p ?? null,
    output_schema: data.output_schema,
    config_type: data.config_type as ModelConfigEnum,
    is_default: data.is_default,
    // max_tool_rounds: data.max_tool_rounds,
  }
}

export function formValuesToModelConfig(formValues: ModelConfigFormValue): ModelConfigFormData {
  const { slug, name, provider, model, ...optional } = formValues
  return {
    slug,
    name,
    provider,
    model,
    ...optional,
  }
}

/**
 * Build PATCH payload with only changed values compared to the original resource.
 * Omits name, type, and fields (or individual field keys) that are unchanged.
 */
export function getChangedModelConfigUpdateData(
  original: ModelConfigType,
  formData: ModelConfigFormData
): UpdateModelConfigData {
  const result: UpdateModelConfigData = {}

  const updatableKeys: (keyof UpdateModelConfigData)[] = [
    'name',
    'provider',
    'model',
    'system_prompt_id',
    'temperature',
    'max_tokens',
    'top_p',
    'output_schema',
    'config_type',
    'is_default',
    'max_tool_rounds',
  ]

  for (const key of updatableKeys) {
    const newVal = formData[key]
    const oldVal = original[key]
    if (newVal !== undefined && !isEqual(newVal, oldVal)) {
      ;(result as Record<string, unknown>)[key] = newVal
    }
  }

  return result
}
