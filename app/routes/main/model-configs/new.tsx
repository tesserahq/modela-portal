import { IQueryConfig } from '@/resources/queries'
import { useLoaderData, useNavigate } from 'react-router'
import { useApp } from 'tessera-ui'
import { useCreateModelConfig } from '@/resources/hooks/model-config/use-model-config'
import { ModelConfigFormData } from '@/resources/queries/model-config/model-config.type'
import { ModelConfigForm } from '@/components/crud-forms/model-config-form'
import { modelConfigFormDefaultValue } from '@/resources/queries/model-config'

export async function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv }
}

export default function NewModelConfig() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()

  const config: IQueryConfig = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv! }

  const { mutateAsync: createModelConfig } = useCreateModelConfig(config, {
    onSuccess: (data) => {
      navigate(`/model-configs/${data.id}`)
    },
    onError(error) {
      console.log('ERROR', error)
    },
  })

  const handleSubmit = async (data: ModelConfigFormData): Promise<void> => {
    await createModelConfig(data)
  }

  return (
    <ModelConfigForm
      onSubmit={handleSubmit}
      defaultValues={modelConfigFormDefaultValue}
      config={config}
    />
  )
}
