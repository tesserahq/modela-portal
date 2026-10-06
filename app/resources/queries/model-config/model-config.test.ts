import { describe, expect, it } from 'vitest'
import { modelConfigSchema } from './model-config.schema'
import { formValuesToModelConfig } from './model-config.utils'

const base = {
  slug: 'config',
  name: 'Config',
  provider: 'openai',
  model: 'gpt-4.1',
  system_prompt_id: null,
  temperature: null,
  max_tokens: null,
  top_p: null,
  output_schema: {},
  is_default: false,
  expose_events: false,
}

describe('model config conditional fields', () => {
  it('rejects overlap greater than or equal to chunk size', () => {
    const result = modelConfigSchema().safeParse({
      ...base,
      config_type: 'embedding',
      params: { chunk_size: 256, chunk_overlap: 256, strategy: 'fixed_size' },
      enabled_tools: null,
    })
    expect(result.success).toBe(false)
  })

  it('strips embedding params from chat payloads', () => {
    const payload = formValuesToModelConfig({
      ...base,
      config_type: 'chat',
      params: { chunk_size: 500, chunk_overlap: 50, strategy: 'fixed_size' },
      enabled_tools: ['search_knowledge_base'],
    })
    expect(payload.params).toBeNull()
    expect(payload.enabled_tools).toEqual(['search_knowledge_base'])
    expect(payload.expose_events).toBe(false)
  })

  it('preserves the event exposure setting in chat payloads', () => {
    const payload = formValuesToModelConfig({
      ...base,
      expose_events: true,
      config_type: 'chat',
      params: null,
      enabled_tools: [],
    })

    expect(payload.expose_events).toBe(true)
  })

  it('strips enabled tools from embedding payloads', () => {
    const payload = formValuesToModelConfig({
      ...base,
      model: 'text-embedding-3-small',
      config_type: 'embedding',
      params: { chunk_size: 500, chunk_overlap: 50, strategy: 'fixed_size' },
      enabled_tools: ['search_knowledge_base'],
    })
    expect(payload.params).toEqual({
      chunk_size: 500,
      chunk_overlap: 50,
      strategy: 'fixed_size',
    })
    expect(payload.enabled_tools).toBeNull()
  })
})
