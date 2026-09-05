export type KnowledgeDocumentMetadata = Record<string, unknown>

export type KnowledgeDocumentType = {
  id: string
  title: string
  raw_content?: string
  content: string
  metadata: KnowledgeDocumentMetadata | null
  chunk_count: number
  created_at: string
  updated_at: string
}

export type CreateKnowledgeDocumentData = {
  title: string
  raw_content: string
}

export type UpdateKnowledgeDocumentData = Partial<CreateKnowledgeDocumentData>
