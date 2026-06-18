import { Form } from '@/components/form'
import { Button } from '@shadcn/ui/button'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { FormLayout } from '../form/form-layout'
import { useNavigate } from 'react-router'
import {
  SystemPromptFormData,
  SystemPromptFormValue,
  systemPromptSchema,
} from '@/resources/queries/system-prompt'
import { formValuesToSystemPromptData } from '@/resources/queries/system-prompt/system-prompt.utils'

interface Props {
  defaultValues: SystemPromptFormValue
  onSubmit: (data: SystemPromptFormData) => void | Promise<void>
  submitLabel?: string
}

export function SystemPromptForm({ defaultValues, onSubmit, submitLabel = 'Save' }: Props) {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const isEditMode = !!defaultValues?.name
  const title = isEditMode ? 'Edit System Prompt' : 'New System Prompt'

  const handleSubmit = async (rawData: SystemPromptFormValue) => {
    setIsSubmitting(true)

    try {
      const data = formValuesToSystemPromptData(rawData)
      await onSubmit(data)
    } catch {
      // Error handling is done by parent component
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-5">
      <Form
        schema={systemPromptSchema}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        mode="onChange"
        reValidateMode="onChange">
        <FormLayout title={title}>
          <Form.Input
            field="name"
            label="Name"
            placeholder="Enter prompt name"
            autoFocus
            maxLength={64}
            required
          />
          <Form.MarkdownEditor field="content" label="Content" />
          <Form.Textarea field="note" label="Note" placeholder="Enter note" maxLength={512} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/credentials')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
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
