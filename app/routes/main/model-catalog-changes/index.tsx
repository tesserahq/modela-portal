import { DataTable } from '@/components/data-table'
import { AppPreloader } from '@/components/loader/pre-loader'
import { Badge } from '@/modules/shadcn/ui/badge'
import { Button } from '@shadcn/ui/button'
import {
  useProviderCatalogChanges,
  useSetProviderCatalogChangeReviewed,
} from '@/resources/hooks/provider-catalog/use-provider-catalog'
import {
  ProviderCatalogChangeKind,
  ProviderCatalogChangeType,
} from '@/resources/queries/provider-catalog'
import { ensureCanonicalPagination } from '@/utils/helpers/pagination.helper'
import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useLoaderData, useSearchParams } from 'react-router'
import { useApp } from 'tessera-ui'
import { DateTime, EmptyContent } from 'tessera-ui/components'

export async function loader({ request }: { request: Request }) {
  const pagination = ensureCanonicalPagination(request, {
    defaultSize: 25,
    defaultPage: 1,
  })

  if (pagination instanceof Response) {
    return pagination
  }

  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, pagination }
}

type ReviewFilter = 'all' | 'unreviewed' | 'reviewed'

const REVIEW_FILTERS: { value: ReviewFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unreviewed', label: 'Unreviewed' },
  { value: 'reviewed', label: 'Reviewed' },
]

const KIND_FILTERS: { value: ProviderCatalogChangeKind | 'all'; label: string }[] = [
  { value: 'all', label: 'Any change' },
  { value: 'added', label: 'Added' },
  { value: 'removed', label: 'Removed' },
  { value: 'check_failed', label: 'Check failed' },
]

const KIND_LABEL: Record<ProviderCatalogChangeKind, string> = {
  added: 'Added',
  removed: 'Removed',
  check_failed: 'Check failed',
}

function describeChange(row: ProviderCatalogChangeType): string {
  if (row.kind === 'check_failed') {
    return `Could not check catalog${row.error_category ? ` (${row.error_category.replace('_', ' ')})` : ''}`
  }
  return row.model_id ?? '-'
}

export default function ModelCatalogChangesIndex() {
  const { apiUrl, nodeEnv, pagination } = useLoaderData<typeof loader>()
  const { token, isLoadingIdenties } = useApp()
  const [searchParams, setSearchParams] = useSearchParams()

  const reviewFilter: ReviewFilter =
    searchParams.get('reviewed') === 'true'
      ? 'reviewed'
      : searchParams.get('reviewed') === 'false'
        ? 'unreviewed'
        : 'all'
  const kindFilter = (searchParams.get('kind') || 'all') as ProviderCatalogChangeKind | 'all'

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const filters = {
    reviewed: reviewFilter === 'all' ? undefined : reviewFilter === 'reviewed',
    kind: kindFilter === 'all' ? undefined : kindFilter,
  }

  const { data, isLoading, error } = useProviderCatalogChanges(
    config,
    { page: pagination.page, size: pagination.size, ...filters },
    { enabled: !!token && !isLoadingIdenties }
  )

  const { mutate: setReviewed, isPending: isSavingReview } =
    useSetProviderCatalogChangeReviewed(config)

  const updateFilter = (key: 'reviewed' | 'kind', value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value === 'all') {
      next.delete(key)
    } else if (key === 'reviewed') {
      next.set(key, value === 'reviewed' ? 'true' : 'false')
    } else {
      next.set(key, value)
    }
    next.delete('page')
    setSearchParams(next)
  }

  const columns = useMemo<ColumnDef<ProviderCatalogChangeType>[]>(
    () => [
      {
        accessorKey: 'detected_at',
        header: 'Detected',
        size: 170,
        cell: ({ row }) => (
          <DateTime date={row.original.detected_at} formatStr="dd/MM/yyyy HH:mm" />
        ),
      },
      {
        accessorKey: 'provider_id',
        header: 'Provider',
        size: 120,
        cell: ({ row }) => <span className="capitalize">{row.original.provider_id}</span>,
      },
      {
        accessorKey: 'kind',
        header: 'Change',
        size: 130,
        cell: ({ row }) => (
          <Badge variant="outline" className="py-0">
            {KIND_LABEL[row.original.kind]}
          </Badge>
        ),
      },
      {
        id: 'model',
        header: 'Model',
        size: 260,
        cell: ({ row }) => (
          <span className="font-mono text-sm">{describeChange(row.original)}</span>
        ),
      },
      {
        id: 'review',
        header: 'Review',
        size: 170,
        cell: ({ row }) => {
          const item = row.original
          // A failed check has no model to review; it only records that the check ran.
          if (item.kind === 'check_failed') {
            return <span className="text-muted-foreground">-</span>
          }
          const reviewed = item.reviewed_at !== null
          return (
            <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
              <Button
                size="sm"
                variant={reviewed ? 'outline' : 'black'}
                disabled={isSavingReview}
                onClick={() => setReviewed({ id: item.id, reviewed: !reviewed })}>
                {reviewed ? 'Mark unreviewed' : 'Mark reviewed'}
              </Button>
            </div>
          )
        },
      },
    ],
    [setReviewed, isSavingReview]
  )

  if (isLoading || isLoadingIdenties) {
    return <AppPreloader />
  }

  const filterBar = (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {REVIEW_FILTERS.map((f) => (
        <Button
          key={f.value}
          size="sm"
          variant={reviewFilter === f.value ? 'black' : 'outline'}
          onClick={() => updateFilter('reviewed', f.value)}>
          {f.label}
        </Button>
      ))}
      <span className="mx-2 h-5 w-px bg-border" aria-hidden />
      {KIND_FILTERS.map((f) => (
        <Button
          key={f.value}
          size="sm"
          variant={kindFilter === f.value ? 'black' : 'outline'}
          onClick={() => updateFilter('kind', f.value)}>
          {f.label}
        </Button>
      ))}
    </div>
  )

  if (error) {
    return (
      <div className="h-full page-content">
        <h1 className="page-title mb-5">Model catalog changes</h1>
        <EmptyContent
          image="/images/error.png"
          title="Failed to load model catalog changes"
          description={error.message}
        />
      </div>
    )
  }

  const meta = data
    ? {
        page: data.page,
        pages: data.pages,
        size: data.size,
        total: data.total,
      }
    : undefined

  return (
    <div className="h-full page-content">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="page-title">Model catalog changes</h1>
      </div>

      {filterBar}

      {data?.total === 0 ? (
        <EmptyContent
          image="/images/empty-data.png"
          title="No model catalog changes"
          description="Changes appear here after the weekly provider check finds a new, removed, or failed model list."
        />
      ) : (
        <DataTable columns={columns} data={data?.items || []} meta={meta} isLoading={isLoading} />
      )}
    </div>
  )
}
