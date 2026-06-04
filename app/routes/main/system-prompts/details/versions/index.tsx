import { DataTable } from '@/components/data-table'
import { AppPreloader } from '@/components/loader/pre-loader'
import { Badge } from '@/modules/shadcn/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/modules/shadcn/ui/popover'
import {
  useDeleteSystemPrompt,
  useSystemPrompt,
  useSystemPrompts,
  useSystemPromptVersions,
} from '@/resources/hooks/system-prompt/use-system-prompt'
import { SystemPromptType, SystemPromptVersionType } from '@/resources/queries/system-prompt'
import { ensureCanonicalPagination } from '@/utils/helpers/pagination.helper'
import { Button } from '@shadcn/ui/button'
import { ColumnDef } from '@tanstack/react-table'
import { Edit, EllipsisVertical, EyeIcon, Trash2 } from 'lucide-react'
import { useMemo, useRef } from 'react'
import { Link, useLoaderData, useNavigate } from 'react-router'
import { ResourceID, useApp } from 'tessera-ui'
import { DateTime, EmptyContent, NewButton } from 'tessera-ui/components'
import DeleteConfirmation, {
  type DeleteConfirmationHandle,
} from 'tessera-ui/components/delete-confirmation'

export async function loader({
  request,
  params,
}: {
  request: Request
  params: { promptID: string }
}) {
  const pagination = ensureCanonicalPagination(request, {
    defaultSize: 25,
    defaultPage: 1,
  })

  if (pagination instanceof Response) {
    return pagination
  }

  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, pagination, id: params.promptID }
}

export default function SystemPromptVersionsIndex() {
  const { apiUrl, nodeEnv, pagination, id } = useLoaderData<typeof loader>()
  const { token, isLoadingIdenties } = useApp()
  const navigate = useNavigate()
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }
  const params = { page: pagination.page, size: pagination.size }

  const {
    data: systemPrompt,
    isLoading: isSystemPromptLoading,
    error: systemPromptError,
  } = useSystemPrompt(config, id)

  const { data, isLoading, error } = useSystemPromptVersions(config, params, systemPrompt?.name!, {
    enabled: !!token && !isLoadingIdenties && !!systemPrompt?.name,
  })

  const columns = useMemo<ColumnDef<SystemPromptVersionType>[]>(
    () => [
      {
        accessorKey: 'version',
        header: 'Version',
        size: 200,
        cell: ({ row }) => {
          const { version_number } = row.original
          return (
            // <Link to={`/system-prompts/${row.original.id}`} className="button-link">
            <div className="max-w-[200px] truncate">
              <Badge variant="outline" className="border border-green-500 text-green-600 py-0">
                <span className="text-xs">v.{version_number}</span>
              </Badge>
            </div>
            // </Link>
          )
        },
      },
      {
        accessorKey: 'id',
        header: 'ID',
        size: 150,
        cell: ({ row }) => <ResourceID value={row.original.id} />,
      },
      {
        accessorKey: 'prompt_id',
        header: 'System Prompt ID',
        size: 150,
        cell: ({ row }) => <ResourceID value={row.original.system_prompt_id} />,
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        size: 200,
        cell: ({ row }) => {
          const date = row.getValue('created_at') as string
          return <DateTime date={date} formatStr="dd/MM/yyyy HH:mm" />
        },
      },
    ],
    [navigate]
  )

  if (isLoading || isLoadingIdenties || isSystemPromptLoading) {
    return <AppPreloader />
  }

  if (error || systemPromptError) {
    return (
      <EmptyContent
        image="/images/error.png"
        title="Failed to load data"
        description={error?.message ?? systemPromptError?.message}
      />
    )
  }

  if (data?.total === 0) {
    return (
      <EmptyContent
        image="/images/empty-data.png"
        title="No version found"
        description="Get started by creating first prompt.">
        <Button onClick={() => navigate('/system-prompts/new')} variant="black">
          Start Creating
        </Button>
      </EmptyContent>
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
        <h1 className="page-title">System Prompt Version </h1>
        <NewButton
          label="New Version"
          onClick={() => navigate(`/system-prompts/${id}/versions/new`)}
          disabled={isLoading}
        />
      </div>

      <DataTable columns={columns} data={data?.items || []} meta={meta} isLoading={isLoading} />

      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
