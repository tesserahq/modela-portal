import { isEqual } from '@/utils/helpers/comparison.helper'
import { KnowledgeDocumentFormValue } from './knowledge-document.schema'
import {
  CreateKnowledgeDocumentData,
  KnowledgeDocumentType,
  UpdateKnowledgeDocumentData,
} from './knowledge-document.type'

/**
 * The current backend returns parsed metadata and body, but not the original raw source.
 * JSON is valid YAML, so this preserves metadata semantics until the backend exposes a
 * lossless raw_content read field.
 */
export function knowledgeDocumentToFormValues(
  document: KnowledgeDocumentType
): KnowledgeDocumentFormValue {
  const metadata = document.metadata ?? {}
  const hasMetadata = Object.keys(metadata).length > 0
  return {
    title: document.title,
    raw_content:
      document.raw_content ??
      (hasMetadata
        ? `---\n${JSON.stringify(metadata, null, 2)}\n---\n${document.content}`
        : document.content),
  }
}

export function formValuesToKnowledgeDocument(
  values: KnowledgeDocumentFormValue
): CreateKnowledgeDocumentData {
  return { title: values.title.trim(), raw_content: values.raw_content }
}

export function getChangedKnowledgeDocumentUpdateData(
  original: KnowledgeDocumentFormValue,
  current: KnowledgeDocumentFormValue
): UpdateKnowledgeDocumentData {
  const result: UpdateKnowledgeDocumentData = {}
  const normalizedTitle = current.title.trim()
  if (!isEqual(normalizedTitle, original.title)) result.title = normalizedTitle
  if (!isEqual(current.raw_content, original.raw_content)) result.raw_content = current.raw_content
  return result
}
