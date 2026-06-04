import { Form } from '@/components/form'
import { Button } from '@shadcn/ui/button'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { FormLayout } from '../form/form-layout'
import { useNavigate } from 'react-router'
import {
  CreateSystemPromptVersionData,
  SystemPromptVersionFormValue,
  systemPromptVersionSchema,
} from '@/resources/queries/system-prompt'
import { formValuesToSystemPromptVersionData } from '@/resources/queries/system-prompt/system-prompt.utils'

interface Props {
  defaultValues: SystemPromptVersionFormValue
  onSubmit: (data: CreateSystemPromptVersionData) => void | Promise<void>
  submitLabel?: string
}

export function SystemPromptVersionForm({ defaultValues, onSubmit, submitLabel = 'Save' }: Props) {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const title = 'Nev prompt version'

  const handleSubmit = async (rawData: SystemPromptVersionFormValue) => {
    setIsSubmitting(true)

    try {
      const data = formValuesToSystemPromptVersionData(rawData)
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
        schema={systemPromptVersionSchema}
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
          <Form.Textarea
            field="content"
            label="Content"
            placeholder="Enter prompt content"
            autoFocus
            required
          />
          <Form.Textarea
            field="note"
            label="Note"
            placeholder="Enter note"
            maxLength={512}
            autoFocus
          />

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
