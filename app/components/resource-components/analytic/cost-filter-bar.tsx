import { X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/modules/shadcn/ui/select'
import { cn } from '@/modules/shadcn/lib/utils'
import { IQueryConfig } from '@/resources/queries'
import { useLLMProviders } from '@/resources/hooks/model-config/use-model-config'
import { LLMProvider } from '@/resources/queries/model-config'
import { useState } from 'react'
import { Form } from '@/components/form'
import { useSearchParams } from 'react-router'
import { Button } from '@/modules/shadcn/ui/button'
import { ComboBoxSelect } from '@/components/form/form-command-custom'

interface Props {
  config: IQueryConfig
  projects?: string[]
  className?: string
}

export function CostFilterBar({ config, projects = [], className }: Props) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: providers, isLoading: isProvidersLoading } = useLLMProviders(config)

  const [selectedProvider, setSelectedProvider] = useState<LLMProvider | undefined>()

  const provider = searchParams.get('provider')
  const model = searchParams.get('model')
  const project = searchParams.get('project')

  const hasActiveFilters = provider || model || project

  const handleFilterChange = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(searchParams)
    if (!value || value === 'all') {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    setSearchParams(next)
  }

  const handleClearAll = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('provider')
    next.delete('model')
    next.delete('project')
    setSearchParams(next)
  }

  const activeFilterBadges = [
    provider && { key: 'provider', value: provider },
    model && { key: 'model', value: model },
    project && { key: 'project', value: project },
  ].filter(Boolean) as { key: string; value: string }[]

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-row items-center gap-2 max-w-1/3">
        <span className="text-sm font-medium text-muted-foreground">Filters:</span>

        <Select
          value={provider || 'all'}
          onValueChange={(v) => {
            handleFilterChange('provider', v)
            setSelectedProvider(providers?.find((p) => p.id === v))
          }}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All providers</SelectItem> {/* already deletes param */}
            {providers?.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={model || 'all'} onValueChange={(v) => handleFilterChange('model', v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All models</SelectItem> {/* already deletes param */}
            {selectedProvider?.models.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={project || 'all'}
          onValueChange={(v: string) => handleFilterChange('project', v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-muted-foreground hover:text-foreground">
            Clear all
          </Button>
        )}
      </div>

      {activeFilterBadges.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Active:</span>
          {activeFilterBadges.map((badge) => (
            <span
              key={badge.key}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5
                text-xs font-medium text-secondary-foreground">
              <span className="text-muted-foreground capitalize">{badge.key}:</span>
              {badge.value}
              <button
                type="button"
                onClick={() => handleFilterChange(badge.key, undefined)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-muted">
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {badge.key} filter</span>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
