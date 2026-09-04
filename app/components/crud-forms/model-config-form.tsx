/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form } from '@/components/form'
import { Button } from '@shadcn/ui/button'
import { Loader2, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { FormLayout } from '../form/form-layout'
import { useNavigate } from 'react-router'
import { IQueryConfig } from '@/resources/queries'
import {
  ModelConfigData,
  formValuesToModelConfig,
  ModelConfigFormValue,
  ModelConfigLimits,
  modelConfigSchema,
  LLMProvider,
} from '@/resources/queries/model-config'
import { useSystemPrompts } from '@/resources/hooks/system-prompt/use-system-prompt'
import { Badge } from '@/modules/shadcn/ui/badge'
import {
  useLLMProviders,
  useModelConfigPromptType,
} from '@/resources/hooks/model-config/use-model-config'
import { AppPreloader } from '../loader/pre-loader'
import { useFormContext, UseFormWatch } from 'react-hook-form'
import { Alert, AlertDescription } from '@/modules/shadcn/ui/alert'
import { TriangleAlert } from 'lucide-react'

const PARAM_EXPLANATIONS = {
  temperature:
    'How random or "creative" the answers are. Low (near 0) = safe, predictable, to-the-point. High (above 1) = more varied and surprising, but more likely to ramble or go off-topic.',
  top_p:
    'A second, alternative way to control randomness — most people leave this alone and only adjust Temperature instead. Use one or the other, not both; some providers will reject a config that sets both.',
  max_tokens:
    "The longest a single reply is allowed to be. Leaving this blank means there's no limit — the model could keep writing far longer than needed, which is slower, costs more, and can lead to garbled, glitchy-looking text. We recommend always setting a value here.",
} as const

function createDefaultChecker(
  watch: UseFormWatch<ModelConfigFormValue>,
  params?: LLMProvider['parameters']
) {
  return (field: 'temperature' | 'max_tokens' | 'top_p') => {
    const currentValue = watch(field)
    const defaultValue = params?.[field]?.default ?? null
    const normalizedCurrent = (currentValue === ('' as any) ? null : currentValue) ?? null
    return normalizedCurrent !== defaultValue
  }
}

interface LLMParamsFormProps {
  providers: LLMProvider[]
  isProvidersLoading: boolean
  defaultValues: ModelConfigFormValue
  onLimitsChange: (limits: ModelConfigLimits | undefined) => void
}

function LLMParamsForm({
  providers,
  isProvidersLoading,
  defaultValues,
  onLimitsChange,
}: LLMParamsFormProps) {
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider | undefined>()
  const { setValue, watch } = useFormContext<ModelConfigFormValue>()
  const params = selectedProvider?.parameters

  useEffect(() => {
    if (!defaultValues || !providers) return
    const provider = providers.find((p) => p.id === defaultValues.provider)
    setSelectedProvider(provider)
    onLimitsChange(providerToLimits(provider))
  }, [defaultValues, providers])

  const toLimit = (
    spec: { min: number | null; max: number | null } | null | undefined
  ): { min: number; max: number } | undefined => {
    if (spec?.min == null || spec?.max == null) return undefined
    return { min: spec.min, max: spec.max }
  }

  const providerToLimits = (provider: LLMProvider | undefined): ModelConfigLimits | undefined => {
    if (!provider?.parameters) return undefined
    const { temperature, max_tokens, top_p } = provider.parameters
    return {
      temperature: toLimit(temperature),
      max_tokens: toLimit(max_tokens),
      top_p: toLimit(top_p),
    }
  }

  const handleProviderChange = (provider: LLMProvider | undefined) => {
    setSelectedProvider(provider)
    onLimitsChange(providerToLimits(provider))
    setValue('model', '')
    if (provider?.parameters?.temperature?.default != null)
      setValue('temperature', provider.parameters.temperature.default)
    if (provider?.parameters?.top_p?.default != null)
      setValue('top_p', provider.parameters.top_p.default)
    if (provider?.parameters?.max_tokens?.default != null)
      setValue('max_tokens', provider.parameters.max_tokens.default)
  }

  const isDifferentFromDefault = createDefaultChecker(watch, params)

  return (
    <>
      <Form.ComboBox
        field="provider"
        label="Provider"
        placeholder="Select a provider..."
        options={providers ?? []}
        getOptionId={(p) => p.id}
        getOptionLabel={(p) => p.name}
        getSearchValue={(p) => p.name}
        renderOption={(p) => <span className="font-medium">{p.name}</span>}
        onChange={(value) => handleProviderChange(value ?? undefined)}
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
      <div className="grid grid-cols-2 gap-4">
        <Form.Input
          field="temperature"
          label="Temperature"
          type="number"
          className="no-num-spinner"
          step={0.1}
          description={
            params?.temperature
              ? `${PARAM_EXPLANATIONS.temperature} (allowed range: ${params.temperature.min}–${params.temperature.max}, default: ${params.temperature.default})`
              : PARAM_EXPLANATIONS.temperature
          }
          min={params?.temperature?.min ?? undefined}
          max={params?.temperature?.max ?? undefined}
          disabled={!selectedProvider}
          trailing={
            params?.temperature?.default != null &&
            watch('temperature') !== params?.temperature?.default
              ? {
                  icon: 'default',
                  onClick: () => setValue('temperature', params?.temperature?.default ?? null),
                }
              : undefined
          }
        />
        <div>
          <Form.Input
            field="max_tokens"
            label="Max Tokens"
            type="number"
            className="no-num-spinner"
            description={
              params?.max_tokens
                ? `${PARAM_EXPLANATIONS.max_tokens} (allowed range: ${params.max_tokens.min}–${params.max_tokens.max}, default: ${params.max_tokens.default})`
                : PARAM_EXPLANATIONS.max_tokens
            }
            min={params?.max_tokens?.min ?? undefined}
            max={params?.max_tokens?.max ?? undefined}
            disabled={!selectedProvider}
            trailing={
              params?.max_tokens?.default != null &&
              watch('max_tokens') !== params?.max_tokens?.default
                ? {
                    icon: 'default',
                    onClick: () => setValue('max_tokens', params?.max_tokens?.default ?? undefined),
                  }
                : undefined
            }
          />
          {selectedProvider && !watch('max_tokens') && (
            <Alert variant="warning" className="mt-2 py-2">
              <TriangleAlert className="!top-2 !left-2 h-4 w-4" />
              <AlertDescription className="!pl-6">
                No length limit is set. Replies could end up much longer than expected, take
                longer to generate, cost more, and sometimes come back as garbled text. We
                recommend setting a number here, like 1024.
              </AlertDescription>
            </Alert>
          )}
        </div>
        <Form.Input
          field="top_p"
          label="Top P"
          type="number"
          className="no-num-spinner"
          step={0.1}
          description={
            params?.top_p
              ? `${PARAM_EXPLANATIONS.top_p} (allowed range: ${params.top_p.min}–${params.top_p.max}, default: ${params.top_p.default})`
              : PARAM_EXPLANATIONS.top_p
          }
          min={params?.top_p?.min ?? undefined}
          max={params?.top_p?.max ?? undefined}
          disabled={!selectedProvider}
          trailing={
            isDifferentFromDefault('top_p')
              ? {
                  icon: 'default',
                  onClick: () => setValue('top_p', params?.top_p?.default ?? ('' as any)),
                }
              : undefined
          }
        />
      </div>
    </>
  )
}

interface Props {
  config: IQueryConfig
  defaultValues: ModelConfigFormValue
  onSubmit: (data: ModelConfigData) => void | Promise<void>
  submitLabel?: string
}

export function ModelConfigForm({ defaultValues, onSubmit, submitLabel = 'Save', config }: Props) {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [limits, setLimits] = useState<ModelConfigLimits | undefined>()
  const title = defaultValues.id ? 'Edit Model Config' : 'New Model Config'

  const { data, isLoading } = useSystemPrompts(config, { page: 1, size: 100 })
  const { data: promptTypes, isLoading: isPromptTypeloading } = useModelConfigPromptType(config)
  const { data: providers, isLoading: isProvidersLoading } = useLLMProviders(config)

  const handleSubmit = async (data: ModelConfigFormValue) => {
    setIsSubmitting(true)
    try {
      await onSubmit(formValuesToModelConfig(data))
    } catch (error: any) {
      console.log('FORM ERROR', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || isProvidersLoading || isPromptTypeloading) {
    return <AppPreloader className="min-h-screen" />
  }

  return (
    <div className="pt-5">
      <Form
        schema={modelConfigSchema(limits)}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        mode="onChange"
        reValidateMode="onChange">
        <FormLayout title={title}>
          <Form.Input field="slug" label="Slug" placeholder="Enter slug" required />
          <Form.Input field="name" label="Name" placeholder="Enter name" autoFocus required />
          <LLMParamsForm
            providers={providers ?? []}
            isProvidersLoading={isProvidersLoading}
            defaultValues={defaultValues}
            onLimitsChange={setLimits}
          />
          <Form.Switch field="is_default" label="Is Default" />
          <Form.ComboBox
            required
            field="config_type"
            label="Config Type"
            placeholder="Select config type"
            options={promptTypes?.items ?? []}
            getOptionId={(p) => p.id}
            getOptionLabel={(p) => p.name}
            getSearchValue={(p) => `${p.name} ${p.id}`}
            renderOption={(p) => (
              <div className="">
                <span className="font-medium">{p.name}</span>
                <p className="text-sm">{p.description}</p>
              </div>
            )}
            isLoading={isPromptTypeloading}
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
