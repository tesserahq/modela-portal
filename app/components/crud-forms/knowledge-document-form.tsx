import { Form } from '@/components/form'
import {
  formValuesToKnowledgeDocument,
  KnowledgeDocumentFormValue,
  knowledgeDocumentSchema,
} from '@/resources/queries/knowledge-documents'
import { Button } from '@shadcn/ui/button'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { FormLayout } from '../form/form-layout'

export function KnowledgeDocumentForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save',
}: {
  defaultValues: KnowledgeDocumentFormValue
  onSubmit: (data: KnowledgeDocumentFormValue) => void | Promise<void>
  submitLabel?: string
}) {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (values: KnowledgeDocumentFormValue) => {
    setIsSubmitting(true)
    try {
      await onSubmit(formValuesToKnowledgeDocument(values))
    } catch {
      // Mutation hooks surface API failures as toasts.
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-5">
      <Form
        schema={knowledgeDocumentSchema}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        mode="onChange"
        reValidateMode="onChange">
        <FormLayout
          title={defaultValues.title ? 'Edit Knowledge Document' : 'New Knowledge Document'}>
          <Form.Input field="title" label="Title" maxLength={255} required autoFocus />
          <Form.MarkdownEditor
            field="raw_content"
            label="Markdown and YAML frontmatter"
            description="Optional YAML frontmatter must be enclosed by --- markers at the start of the document."
            editorHeight={560}
            showPreview={false}
            required
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/knowledge-documents')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </FormLayout>
      </Form>
    </div>
  )
}
