import { Form } from '@/components/form'
import { Button } from '@shadcn/ui/button'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { FormLayout } from '../form/form-layout'
import { useNavigate } from 'react-router'
import { IQueryConfig } from '@/resources/queries'
import {
  ModelConfigData,
  formValuesToModelConfig,
  ModelConfigFormValue,
  modelConfigSchema,
  LLMProvider,
} from '@/resources/queries/model-config'
import { useSystemPrompts } from '@/resources/hooks/system-prompt/use-system-prompt'
import { Badge } from '@/modules/shadcn/ui/badge'
import { useLLMProviders } from '@/resources/hooks/model-config/use-model-config'
import { AppPreloader } from '../loader/pre-loader'

interface Props {
  config: IQueryConfig
  defaultValues: ModelConfigFormValue
  onSubmit: (data: ModelConfigData) => void | Promise<void>
  submitLabel?: string
}

export function ModelConfigForm({ defaultValues, onSubmit, submitLabel = 'Save', config }: Props) {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider | undefined>()
  const isEditMode = !!defaultValues?.slug
  const title = isEditMode ? 'Edit Model Config' : 'New Model Config'

  const { data, isLoading } = useSystemPrompts(config, {
    page: 1,
    size: 100,
  })

  const { data: providers, isLoading: isProvidersLoading } = useLLMProviders(config)

  const handleSubmit = async (
    data: ModelConfigFormValue | Omit<ModelConfigFormValue, 'slug' | 'provider' | 'model'>
  ) => {
    setIsSubmitting(true)
    try {
      await onSubmit(formValuesToModelConfig(data as ModelConfigFormValue))
    } catch {
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!defaultValues || !providers) return
    setSelectedProvider(providers?.find((p) => p.id === defaultValues.provider))
  }, [defaultValues])

  if (isLoading || isProvidersLoading) {
    return <AppPreloader className="min-h-screen" />
  }

  return (
    <div className="pt-5">
      <Form
        schema={modelConfigSchema}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        mode="onChange"
        reValidateMode="onChange">
        <FormLayout title={title}>
          <Form.Input
            field="slug"
            label="Slug"
            placeholder="Enter slug"
            required
            disabled={isEditMode}
          />
          <Form.Input field="name" label="Name" placeholder="Enter name" autoFocus required />
          <Form.ComboBox
            field="provider"
            label="Provider"
            placeholder="Select a provider..."
            options={providers ?? []}
            getOptionId={(p) => p.id}
            getOptionLabel={(p) => p.name}
            getSearchValue={(p) => p.name}
            renderOption={(p) => <span className="font-medium">{p.name}</span>}
            onChange={(value) => setSelectedProvider(value ?? undefined)}
            isLoading={isProvidersLoading}
            required
          />
          <Form.ComboBox
            field="model"
            label="Model"
            placeholder={selectedProvider ? 'Select a model...' : 'Select a provider first'}
            options={selectedProvider?.models ?? []}
            getOptionId={(p) => p.id}
            getOptionLabel={(p) => p.name}
            getSearchValue={(p) => p.name}
            renderOption={(p) => <span className="font-medium">{p.name}</span>}
            isLoading={isProvidersLoading}
            disabled={!selectedProvider}
            required
          />
          <Form.Switch field="is_default" label="Is Default" />
          <Form.Select
            field="config_type"
            label="Config Type"
            placeholder="Select config type"
            required
            options={[
              { label: 'Chat', value: 'chat' },
              { label: 'Summary', value: 'summary' },
              { label: 'Generation', value: 'generation' },
            ]}
          />
          <Form.ComboBox
            field="system_prompt_id"
            label="System Prompt"
            placeholder="Search system prompts..."
            options={data?.items ?? []}
            getOptionId={(p) => p.id}
            getOptionLabel={(p) => `${p.name} v.${p.current_version?.version_number}`}
            getSearchValue={(p) => `${p.name} ${p.id}`}
            renderOption={(p) => (
              <div className="flex space-x-3">
                <span className="font-medium">{p.name}</span>
                <Badge variant="outline" className="border border-green-500 text-green-600 py-0">
                  <span className="text-xs">v.{p.current_version?.version_number}</span>
                </Badge>
              </div>
            )}
            isLoading={isLoading}
          />
          <Form.Schema field="output_schema" label="Output schema" useJsonEditor useSingleInput />
          {/* <Form.Input
            field="system_prompt_id"
            label="System Prompt ID"
            placeholder="Enter system prompt ID"
            readOnly
            disabled
          />
          <div className="grid grid-cols-2 gap-4">
            <Form.Input field="temperature" label="Temperature" type="number" min={0} max={2} />
            <Form.Input field="max_tokens" label="Max Tokens" type="number" min={1} />
            <Form.Input field="top_p" label="Top P" type="number" min={0} max={1} />
            <Form.Input field="max_tool_rounds" label="Max Tool Rounds" type="number" min={0} />
          </div> */}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/model-configs')}>
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
