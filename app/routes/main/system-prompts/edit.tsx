import { AppPreloader } from '@/components/loader/pre-loader'
import { IQueryConfig } from '@/resources/queries'
import { useLoaderData, useNavigate } from 'react-router'
import { EmptyContent, useApp } from 'tessera-ui'
import { Button } from '@/modules/shadcn/ui/button'
import {
  useSystemPrompt,
  useUpdateSystemPrompt,
} from '@/resources/hooks/system-prompt/use-system-prompt'
import { SystemPromptForm } from '@/components/crud-forms/system-prompt-form'
import { systemPromptToFormValues } from '@/resources/queries/system-prompt/system-prompt.utils'
import { SystemPromptFormData } from '@/resources/queries/system-prompt'

export async function loader({ params }: { params: { promptID: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.promptID }
}

export default function EditSystemPrompt() {
  const { apiUrl, nodeEnv, id } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()

  const config: IQueryConfig = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv! }

  const { data, isLoading, error } = useSystemPrompt(config, id!, {
    enabled: !!id && !!token,
  })

  const { mutateAsync: updatePrompt } = useUpdateSystemPrompt(config, {
    onSuccess: (data) => {
      navigate(`/system-prompts/${data.id}`)
    },
  })

  const handleSubmit = async (data: SystemPromptFormData): Promise<void> => {
    if (!id) return
    await updatePrompt({ id, data })
  }

  if (isLoading || !data) {
    return <AppPreloader />
  }

  if (error) {
    return (
      <EmptyContent
        image="/images/error.png"
        title="Failed to get system prompt"
        description={error.message}>
        <Button onClick={() => navigate('/system-prompts')} variant="black">
          Start Creating
        </Button>
      </EmptyContent>
    )
  }

  return (
    <SystemPromptForm
      onSubmit={handleSubmit}
      defaultValues={systemPromptToFormValues(data)}
      submitLabel="Update"
    />
  )
}
