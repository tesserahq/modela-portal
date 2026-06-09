import { DataTable } from '@/components/data-table'
import { AppPreloader } from '@/components/loader/pre-loader'
import { formatCost } from '@/components/resource-components/analytic/cost-utils'
import { useCompletionRequests } from '@/resources/hooks/completion/use-completion'
import { CompletionRequestType } from '@/resources/queries/completion'
import { ensureCanonicalPagination } from '@/utils/helpers/pagination.helper'
import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { useLoaderData, useNavigate } from 'react-router'
import { ResourceID, useApp } from 'tessera-ui'
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

export default function CompletionsIndex() {
  const { apiUrl, nodeEnv, pagination } = useLoaderData<typeof loader>()
  const { token, isLoadingIdenties } = useApp()
  const navigate = useNavigate()

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const { data, isLoading, error } = useCompletionRequests(
    config,
    { page: pagination.page, size: pagination.size },
    { enabled: !!token && !isLoadingIdenties }
  )

  const columns = useMemo<ColumnDef<CompletionRequestType>[]>(
    () => [
      {
        accessorKey: 'created_at',
        header: 'Date',
        size: 180,
        cell: ({ row }) => {
          const date = row.getValue('created_at') as string
          return <DateTime date={date} formatStr="dd/MM/yyyy HH:mm" />
        },
      },
      {
        accessorKey: 'request_id',
        header: 'Request ID',
        size: 150,
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <ResourceID value={row.original.request_id} />
          </div>
        ),
      },
      {
        accessorKey: 'provider',
        header: 'Provider',
        size: 120,
        cell: ({ row }) => <span>{row.original.provider || '-'}</span>,
      },
      {
        accessorKey: 'model',
        header: 'Model',
        size: 150,
        cell: ({ row }) => <span>{row.original.model || '-'}</span>,
      },
      {
        accessorKey: 'input_tokens',
        header: 'Input Tokens',
        size: 120,
        cell: ({ row }) => {
          const val = row.original.input_tokens
          return <span>{val != null ? val.toLocaleString() : '-'}</span>
        },
      },
      {
        accessorKey: 'output_tokens',
        header: 'Output Tokens',
        size: 120,
        cell: ({ row }) => {
          const val = row.original.output_tokens
          return <span>{val != null ? val.toLocaleString() : '-'}</span>
        },
      },
      {
        accessorKey: 'latency_ms',
        header: 'Latency',
        size: 100,
        cell: ({ row }) => {
          const val = row.original.latency_ms
          return <span>{val != null ? `${val.toLocaleString()}ms` : '-'}</span>
        },
      },
      {
        accessorKey: 'cost_estimate_usd',
        header: 'Cost',
        size: 100,
        cell: ({ row }) => {
          const val = row.original.cost_estimate_usd
          const display = formatCost(val)
          return <span>{display}</span>
        },
      },
      {
        accessorKey: 'finish_reason',
        header: 'Finish Reason',
        size: 130,
        cell: ({ row }) => {
          const val = row.original.finish_reason
          return <span>{val ?? '-'}</span>
        },
      },
    ],
    [navigate]
  )

  if (isLoading || isLoadingIdenties) {
    return <AppPreloader />
  }

  if (error) {
    return (
      <EmptyContent
        image="/images/error.png"
        title="Failed to get completion requests history"
        description={error.message}
      />
    )
  }

  if (data?.total === 0) {
    return (
      <EmptyContent image="/images/empty-data.png" title="No completion request history found" />
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
        <h1 className="page-title">Completion Requests</h1>
      </div>

      <DataTable
        columns={columns}
        data={data?.items || []}
        meta={meta}
        isLoading={isLoading}
        onRowClick={(row) => navigate(`/completions/${row.id}`)}
      />
    </div>
  )
}
