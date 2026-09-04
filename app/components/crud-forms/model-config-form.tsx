/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form } from '@/components/form'
import { Button } from '@shadcn/ui/button'
import { Loader2 } from 'lucide-react'
import { type ReactNode, useEffect, useRef, useState } from 'react'
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
import { formatCost } from '../resource-components/analytic/cost-utils'
import {
  useLLMProviders,
  useModelConfigPromptType,
} from '@/resources/hooks/model-config/use-model-config'
import { AppPreloader } from '../loader/pre-loader'
import { useFormContext, UseFormWatch } from 'react-hook-form'
import { Alert, AlertDescription } from '@/modules/shadcn/ui/alert'
import { TriangleAlert } from 'lucide-react'
import { useTools } from '@/resources/hooks/tools/use-tools'
import { BuiltinToolType } from '@/resources/queries/tools'
import { Checkbox } from '@/modules/shadcn/ui/checkbox'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/modules/shadcn/ui/form'

const PARAM_EXPLANATIONS = {
  temperature:
    'How random or "creative" the answers are. Low (near 0) = safe, predictable, to-the-point. High (above 1) = more varied and surprising, but more likely to ramble or go off-topic.',
  top_p:
    'A second, alternative way to control randomness — most people leave this alone and only adjust Temperature instead. Some providers only allow one of Temperature or Top P to be set at a time; the form will grey out the other one automatically when that applies.',
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
  const configType = watch('config_type')
  const hasEmbeddingCapabilityMetadata = providers.some(
    (provider) => provider.capabilities !== undefined || provider.embedding_models !== undefined
  )
  const providerOptions =
    configType === 'embedding'
      ? providers.filter((provider) =>
          hasEmbeddingCapabilityMetadata
            ? provider.capabilities?.embeddings === true || !!provider.embedding_models?.length
            : provider.id === 'openai'
        )
      : providers
  const embeddingModels = selectedProvider?.embedding_models ?? []

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
    const switchingProviderExclusive = !!provider?.parameters?.exclusive_parameter_groups?.some(
      (group) => group.includes('temperature') && group.includes('top_p')
    )
    if (switchingProviderExclusive) {
      // Only one of temperature/top_p can be set for this provider — prefer temperature
      // (the more commonly tuned parameter) and leave top_p blank, or vice versa if only
      // top_p has a default. Prevents carrying over a value from the previous provider that
      // would otherwise leave both fields populated and fail validation on save.
      if (provider?.parameters?.temperature?.default != null) {
        setValue('temperature', provider.parameters.temperature.default)
        setValue('top_p', '' as any)
      } else if (provider?.parameters?.top_p?.default != null) {
        setValue('top_p', provider.parameters.top_p.default)
        setValue('temperature', '' as any)
      } else {
        setValue('temperature', '' as any)
        setValue('top_p', '' as any)
      }
    } else {
      if (provider?.parameters?.temperature?.default != null)
        setValue('temperature', provider.parameters.temperature.default)
      if (provider?.parameters?.top_p?.default != null)
        setValue('top_p', provider.parameters.top_p.default)
    }
    if (provider?.parameters?.max_tokens?.default != null)
      setValue('max_tokens', provider.parameters.max_tokens.default)
  }

  const isDifferentFromDefault = createDefaultChecker(watch, params)

  const hasValue = (value: unknown): boolean =>
    value !== null && value !== undefined && value !== ''

  const tempTopPExclusive = !!params?.exclusive_parameter_groups?.some(
    (group) => group.includes('temperature') && group.includes('top_p')
  )
  const temperatureValue = watch('temperature')
  const topPValue = watch('top_p')
  const topPDisabledByTemperature = tempTopPExclusive && hasValue(temperatureValue)
  const temperatureDisabledByTopP = tempTopPExclusive && hasValue(topPValue)

  return (
    <>
      <Form.ComboBox
        field="provider"
        label="Provider"
        placeholder="Select a provider..."
        options={providerOptions}
        getOptionId={(p) => p.id}
        getOptionLabel={(p) => p.name}
        getSearchValue={(p) => p.name}
        renderOption={(p) => <span className="font-medium">{p.name}</span>}
        onChange={(value) => handleProviderChange(value ?? undefined)}
        isLoading={isProvidersLoading}
        required
      />
      {configType === 'embedding' && embeddingModels.length === 0 ? (
        <Form.Input
          field="model"
          label="Embedding model"
          placeholder="text-embedding-3-small"
          description="The backend provider catalog currently lists chat models only. Enter an embedding model supported by the selected provider."
          required
        />
      ) : (
        <Form.ComboBox
          field="model"
          label="Model"
          placeholder={selectedProvider ? 'Select a model...' : 'Select a provider first'}
          options={configType === 'embedding' ? embeddingModels : (selectedProvider?.models ?? [])}
          getOptionId={(p) => p.id}
          getOptionLabel={(p) => p.name}
          getSearchValue={(p) => `${p.name} ${p.description ?? ''}`}
          renderOption={(p) => (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="font-medium">{p.name}</span>
                {(p.input_price_per_mtok || p.output_price_per_mtok) && (
                  <Badge variant="outline" className="py-0">
                    <span className="text-xs">
                      {p.input_price_per_mtok ? formatCost(p.input_price_per_mtok) : '—'} in /{' '}
                      {p.output_price_per_mtok ? formatCost(p.output_price_per_mtok) : '—'} out per
                      MTok
                    </span>
                  </Badge>
                )}
              </div>
              {p.description && <p className="text-sm">{p.description}</p>}
            </div>
          )}
          isLoading={isProvidersLoading}
          disabled={!selectedProvider}
          required
        />
      )}
      {configType !== 'embedding' && (
        <div className="grid grid-cols-2 gap-4">
          <Form.Input
            field="temperature"
            label="Temperature"
            type="number"
            className="no-num-spinner"
            step={0.1}
            description={
              temperatureDisabledByTopP
                ? `Turned off because Top P is set for this provider — it only allows one of the two. Clear Top P to use Temperature instead.`
                : params?.temperature
                  ? `${PARAM_EXPLANATIONS.temperature} (allowed range: ${params.temperature.min}–${params.temperature.max}, default: ${params.temperature.default})`
                  : PARAM_EXPLANATIONS.temperature
            }
            min={params?.temperature?.min ?? undefined}
            max={params?.temperature?.max ?? undefined}
            disabled={!selectedProvider || temperatureDisabledByTopP}
            onChange={(e) => {
              if (tempTopPExclusive && e.target.value !== '') setValue('top_p', '' as any)
            }}
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
                      onClick: () =>
                        setValue('max_tokens', params?.max_tokens?.default ?? undefined),
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
              topPDisabledByTemperature
                ? `Turned off because Temperature is set for this provider — it only allows one of the two. Clear Temperature to use Top P instead.`
                : params?.top_p
                  ? `${PARAM_EXPLANATIONS.top_p} (allowed range: ${params.top_p.min}–${params.top_p.max}, default: ${params.top_p.default})`
                  : PARAM_EXPLANATIONS.top_p
            }
            min={params?.top_p?.min ?? undefined}
            max={params?.top_p?.max ?? undefined}
            disabled={!selectedProvider || topPDisabledByTemperature}
            onChange={(e) => {
              if (tempTopPExclusive && e.target.value !== '') setValue('temperature', '' as any)
            }}
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
      )}
    </>
  )
}

function TypeSpecificFields({
  tools,
  isToolsLoading,
  toolsError,
  embeddingDescription,
}: {
  tools: BuiltinToolType[]
  isToolsLoading: boolean
  toolsError: Error | null
  embeddingDescription?: string
}) {
  const form = useFormContext<ModelConfigFormValue>()
  const configType = form.watch('config_type') as ModelConfigFormValue['config_type']
  const previousType = useRef(configType)

  useEffect(() => {
    if (previousType.current === configType) return
    form.setValue('model', '', { shouldDirty: true, shouldValidate: true })
    if (configType === 'embedding') {
      form.setValue('system_prompt_id', null, { shouldDirty: true })
      form.setValue('temperature', null, { shouldDirty: true })
      form.setValue('max_tokens', null, { shouldDirty: true })
      form.setValue('top_p', null, { shouldDirty: true })
      form.setValue('output_schema', {}, { shouldDirty: true })
      form.setValue(
        'params',
        form.getValues('params') ?? {
          chunk_size: 1000,
          chunk_overlap: 100,
          strategy: 'fixed_size',
        },
        { shouldDirty: true, shouldValidate: true }
      )
      form.setValue('enabled_tools', null, { shouldDirty: true })
    } else {
      form.setValue('params', null, { shouldDirty: true })
      if (configType !== 'chat') form.setValue('enabled_tools', null, { shouldDirty: true })
      if (configType === 'chat' && form.getValues('enabled_tools') == null) {
        form.setValue('enabled_tools', [], { shouldDirty: true })
      }
    }
    previousType.current = configType
  }, [configType, form])

  if (configType === 'embedding') {
    return (
      <div className="space-y-4">
        <Alert variant="warning">
          <TriangleAlert className="h-4 w-4" />
          <AlertDescription>
            {embeddingDescription ??
              'Changing the provider or model on an in-use embedding config can invalidate existing knowledge chunks. Create a new embedding config when rotating models.'}
          </AlertDescription>
        </Alert>
        <div className="grid grid-cols-2 gap-4">
          <Form.Input
            field="params.chunk_size"
            label="Chunk size"
            type="number"
            min={256}
            max={8192}
            required
          />
          <Form.Input
            field="params.chunk_overlap"
            label="Chunk overlap"
            type="number"
            min={0}
            required
          />
        </div>
        <Form.Select
          field="params.strategy"
          label="Chunking strategy"
          options={[{ value: 'fixed_size', label: 'Fixed size' }]}
          required
        />
      </div>
    )
  }

  if (configType !== 'chat') return null

  return (
    <FormField
      control={form.control}
      name="enabled_tools"
      render={({ field }) => {
        const selected = (field.value ?? []) as string[]
        return (
          <FormItem>
            <FormLabel>Built-in tools</FormLabel>
            <FormControl>
              <div className="space-y-3 rounded-sm border border-input p-4">
                {isToolsLoading && <p className="text-sm text-muted-foreground">Loading tools…</p>}
                {toolsError && (
                  <p className="text-sm text-destructive">
                    Tools could not be loaded: {toolsError.message}
                  </p>
                )}
                {!isToolsLoading && !toolsError && tools.length === 0 && (
                  <p className="text-sm text-muted-foreground">No built-in tools are available.</p>
                )}
                {tools.map((tool) => {
                  const id = `enabled-tool-${tool.name}`
                  return (
                    <div key={tool.name} className="flex items-start gap-3">
                      <Checkbox
                        id={id}
                        checked={selected.includes(tool.name)}
                        onCheckedChange={(checked) =>
                          field.onChange(
                            checked
                              ? [...selected, tool.name]
                              : selected.filter((name) => name !== tool.name)
                          )
                        }
                      />
                      <div>
                        <label htmlFor={id} className="cursor-pointer text-sm font-medium">
                          {tool.name}
                        </label>
                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

function NonEmbeddingFields({ children }: { children: ReactNode }) {
  const { watch } = useFormContext<ModelConfigFormValue>()
  return watch('config_type') === 'embedding' ? null : children
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
  const { data: tools, isLoading: isToolsLoading, error: toolsError } = useTools(config)

  const handleSubmit = async (data: ModelConfigFormValue) => {
    const mutatesEmbeddingModel =
      !!defaultValues.id &&
      defaultValues.config_type === 'embedding' &&
      (data.provider !== defaultValues.provider || data.model !== defaultValues.model)
    if (
      mutatesEmbeddingModel &&
      !window.confirm(
        'Changing an in-use embedding provider or model can invalidate existing chunks. Continue anyway?'
      )
    ) {
      return
    }
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
              <div>
                <span className="font-medium">{p.name}</span>
                <p className="text-sm">{p.description}</p>
              </div>
            )}
            isLoading={isPromptTypeloading}
          />
          <LLMParamsForm
            providers={providers ?? []}
            isProvidersLoading={isProvidersLoading}
            defaultValues={defaultValues}
            onLimitsChange={setLimits}
          />
          <Form.Switch field="is_default" label="Is Default" />
          <TypeSpecificFields
            tools={tools ?? []}
            isToolsLoading={isToolsLoading}
            toolsError={toolsError}
            embeddingDescription={
              promptTypes?.items.find((type) => type.id === 'embedding')?.description
            }
          />
          <NonEmbeddingFields>
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
          </NonEmbeddingFields>
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
