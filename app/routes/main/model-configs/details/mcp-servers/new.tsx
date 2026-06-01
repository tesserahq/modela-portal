import { IQueryConfig } from '@/resources/queries'
import { useLoaderData, useNavigate } from 'react-router'
import { useApp } from 'tessera-ui'
import { useAttachModelConfigMCPServer } from '@/resources/hooks/model-config/use-model-config'
import { AttachModelConfigMCPServerData } from '@/resources/queries/model-config/model-config.type'
import { modelConfigMCPServerFormDefaultValue } from '@/resources/queries/model-config'
import { ModelConfigMCPServerForm } from '@/components/crud-forms/model-config-mcp-server-form'

export async function loader({ params }: { params: { modelConfigID: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.modelConfigID }
}

export default function AttachModelConfigMCPServer() {
  const { apiUrl, nodeEnv, id } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()

  const config: IQueryConfig = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv! }

  const { mutateAsync: createModelConfig } = useAttachModelConfigMCPServer(config, id, {
    onSuccess: () => {
      navigate(`/model-configs/${id}/mcp-servers`)
    },
  })

  const handleSubmit = async (data: AttachModelConfigMCPServerData): Promise<void> => {
    await createModelConfig(data)
  }

  return (
    <ModelConfigMCPServerForm
      onSubmit={handleSubmit}
      defaultValues={modelConfigMCPServerFormDefaultValue}
      config={config}
    />
  )
}
