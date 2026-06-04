import { IQueryConfig } from '@/resources/queries'
import { useLoaderData, useNavigate } from 'react-router'
import { useApp } from 'tessera-ui'
import {
  useCreateSystemPromptVersion,
  useSystemPrompt,
} from '@/resources/hooks/system-prompt/use-system-prompt'
import {
  CreateSystemPromptVersionData,
  systemPromptVersionFormDefaultValue,
} from '@/resources/queries/system-prompt'
import { AppPreloader } from '@/components/loader/pre-loader'
import { SystemPromptVersionForm } from '@/components/crud-forms/system-prompt-version-form'

export async function loader({ params }: { params: { promptID: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.promptID }
}

export default function NewSystemPromptVersion() {
  const { apiUrl, nodeEnv, id } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()

  const config: IQueryConfig = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv! }

  const { data: systemPrompt, isLoading } = useSystemPrompt(config, id)

  const { mutateAsync: createSystemPrompt } = useCreateSystemPromptVersion(config, {
    onSuccess: (data) => {
      navigate(`/system-prompts/${systemPrompt?.id}/versions`)
    },
  })

  const handleSubmit = async (data: CreateSystemPromptVersionData): Promise<void> => {
    await createSystemPrompt({ data, name: systemPrompt?.name! })
  }

  if (isLoading || !token) {
    return <AppPreloader className="min-h-screen" />
  }

  return (
    <SystemPromptVersionForm
      onSubmit={handleSubmit}
      defaultValues={systemPromptVersionFormDefaultValue}
    />
  )
}
