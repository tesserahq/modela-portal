import { AppPreloader } from '@/components/loader/pre-loader'
import {
  credentialToFormValues,
  getChangedCredentialUpdateData,
} from '@/resources/queries/credentials/credential.utils'
import { IQueryConfig } from '@/resources/queries'
import { useLoaderData, useNavigate, useParams } from 'react-router'
import { EmptyContent, useApp } from 'tessera-ui'
import {
  useModelConfig,
  useUpdateModelConfig,
} from '@/resources/hooks/model-config/use-model-config'
import {
  getChangedModelConfigUpdateData,
  modelConfigToFormValues,
  UpdateModelConfigData,
} from '@/resources/queries/model-config'
import { ModelConfigFormData } from '@/resources/queries/model-config/model-config.type'
import { Button } from '@/modules/shadcn/ui/button'
import { ModelConfigForm } from '@/components/crud-forms/model-config-form'

export async function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function EditModelConfig() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()
  const { modelConfigID } = useParams()

  const config: IQueryConfig = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv! }

  const { data, isLoading, error } = useModelConfig(config, modelConfigID!, {
    enabled: !!modelConfigID && !!token,
  })

  const { mutateAsync: updateConfig } = useUpdateModelConfig(config, {
    onSuccess: (data) => {
      navigate(`/model-configs/${data.id}`)
    },
  })

  const handleSubmit = async (rawData: ModelConfigFormData): Promise<void> => {
    if (!modelConfigID || !data) return

    const changedData = getChangedModelConfigUpdateData(data, rawData)

    if (Object.keys(changedData).length === 0) {
      navigate(`/model-configs/${modelConfigID}`)
      return
    }
    await updateConfig({ id: modelConfigID, data: changedData })
  }

  if (isLoading || !data) {
    return <AppPreloader />
  }

  if (error) {
    return (
      <EmptyContent
        image="/images/error.png"
        title="Failed to get model config"
        description={error.message}>
        <Button onClick={() => navigate('/model-configs')} variant="black">
          Start Creating
        </Button>
      </EmptyContent>
    )
  }

  return (
    <ModelConfigForm
      onSubmit={handleSubmit}
      defaultValues={modelConfigToFormValues(data)}
      submitLabel="Update"
      config={config}
    />
  )
}
