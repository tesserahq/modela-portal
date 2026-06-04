import { IQueryConfig } from '@/resources/queries'
import { useLoaderData, useNavigate } from 'react-router'
import { useApp } from 'tessera-ui'
import { ModelConfigForm } from '@/components/crud-forms/model-config-form'
import { modelConfigFormDefaultValue } from '@/resources/queries/model-config'
import { useCreateSystemPrompt } from '@/resources/hooks/system-prompt/use-system-prompt'
import {
  SystemPromptFormData,
  systemPromptFormDefaultValue,
} from '@/resources/queries/system-prompt'
import { SystemPromptForm } from '@/components/crud-forms/system-prompt-form'

export async function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function NewSystemPrompt() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()

  const config: IQueryConfig = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv! }

  const { mutateAsync: createSystemPrompt } = useCreateSystemPrompt(config, {
    onSuccess: (data) => {
      navigate(`/system-prompts/${data.id}`)
    },
  })

  const handleSubmit = async (data: SystemPromptFormData): Promise<void> => {
    await createSystemPrompt(data)
  }

  return <SystemPromptForm onSubmit={handleSubmit} defaultValues={systemPromptFormDefaultValue} />
}
