import { describe, expect, it } from 'vitest'
import { knowledgeDocumentSchema } from './knowledge-document.schema'
import { knowledgeDocumentToFormValues } from './knowledge-document.utils'

describe('knowledge documents', () => {
  it('preserves nested metadata semantics in editable YAML-compatible source', () => {
    const values = knowledgeDocumentToFormValues({
      id: 'document-id',
      title: 'Runbook',
      content: '# Body',
      metadata: { tags: ['ops'], owner: { team: 'platform' }, stale_after: '2027-01-01' },
      chunk_count: 2,
      created_at: '2026-09-05T00:00:00Z',
      updated_at: '2026-09-05T00:00:00Z',
    })

    expect(values.raw_content).toContain('"team": "platform"')
    expect(values.raw_content.endsWith('# Body')).toBe(true)
  })

  it('validates title and UTF-8 content byte limits', () => {
    expect(knowledgeDocumentSchema.safeParse({ title: '', raw_content: 'body' }).success).toBe(
      false
    )
    expect(
      knowledgeDocumentSchema.safeParse({ title: 'Document', raw_content: '😀'.repeat(262_145) })
        .success
    ).toBe(false)
  })

  it('prefers lossless raw content when the backend provides it', () => {
    const raw = '---\n# preserved comment\ntags: [ops]\n---\n# Body'
    const values = knowledgeDocumentToFormValues({
      id: 'document-id',
      title: 'Runbook',
      raw_content: raw,
      content: '# Body',
      metadata: { tags: ['ops'] },
      chunk_count: 1,
      created_at: '2026-09-05T00:00:00Z',
      updated_at: '2026-09-05T00:00:00Z',
    })
    expect(values.raw_content).toBe(raw)
  })
})
