import { DataTable } from '@/components/data-table'
import { AppPreloader } from '@/components/loader/pre-loader'
import { Badge } from '@/modules/shadcn/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/modules/shadcn/ui/popover'
import {
  useDeleteSystemPrompt,
  useSystemPrompts,
} from '@/resources/hooks/system-prompt/use-system-prompt'
import { SystemPromptType } from '@/resources/queries/system-prompt'
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

export default function SystemPromptsIndex() {
  const { apiUrl, nodeEnv, pagination } = useLoaderData<typeof loader>()
  const { token, isLoadingIdenties } = useApp()
  const navigate = useNavigate()
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const { data, isLoading, error } = useSystemPrompts(
    config,
    { page: pagination.page, size: pagination.size },
    { enabled: !!token && !isLoadingIdenties }
  )

  const { mutateAsync: deletePrompt } = useDeleteSystemPrompt(config, {
    onSuccess: () => {
      deleteConfirmationRef.current?.close()
    },
    onError: () => {
      deleteConfirmationRef?.current?.updateConfig({ isLoading: false })
    },
  })

  const handleDelete = (data: SystemPromptType) => {
    deleteConfirmationRef.current?.open({
      title: 'Delete Prompt',
      description: `Are you sure you want to delete "${data.name}"? This action cannot be undone.`,
      onDelete: async () => {
        deleteConfirmationRef?.current?.updateConfig({ isLoading: true })
        await deletePrompt(data.id)
      },
    })
  }

  const columns = useMemo<ColumnDef<SystemPromptType>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        size: 200,
        cell: ({ row }) => {
          const { name } = row.original
          return (
            <Link to={`/system-prompts/${row.original.id}`} className="button-link">
              <div className="max-w-[200px] truncate" title={name}>
                {name || '-'}
              </div>
            </Link>
          )
        },
      },
      {
        accessorKey: 'current_version',
        header: 'Current Version',
        size: 150,
        cell: ({ row }) => {
          if (!row.original.current_version) return <span>-</span>
          return (
            <Badge variant="outline" className="border border-green-500 text-green-600 py-0">
              <span className="text-xs">v.{row.original.current_version.version_number}</span>
            </Badge>
          )
        },
      },
      {
        accessorKey: 'current_version_id',
        header: 'Current Version ID',
        size: 150,
        cell: ({ row }) => {
          if (!row.original.current_version_id) return <span>-</span>
          return <ResourceID value={row.original.current_version_id} />
        },
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
      {
        accessorKey: 'updated_at',
        header: 'Updated At',
        size: 200,
        cell: ({ row }) => {
          const date = row.getValue('updated_at') as string
          return <DateTime date={date} formatStr="dd/MM/yyyy HH:mm" />
        },
      },
      {
        accessorKey: 'id',
        header: 'ID',
        size: 150,
        cell: ({ row }) => <ResourceID value={row.original.id} />,
      },
      {
        id: 'actions',
        header: '',
        size: 20,
        cell: ({ row }) => {
          const data = row.original
          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="px-0 hover:bg-transparent"
                  aria-label="Open actions"
                  tabIndex={0}>
                  <EllipsisVertical size={18} />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" side="left" className="w-40 p-2">
                <Button
                  variant="ghost"
                  className="flex w-full justify-start gap-2"
                  onClick={() => navigate(`/system-prompts/${data.id}`)}>
                  <EyeIcon size={18} />
                  <span>Overview</span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex w-full justify-start gap-2"
                  onClick={() => navigate(`/system-prompts/${data.id}/edit`)}
                  aria-label="Edit system prompt"
                  tabIndex={0}>
                  <Edit size={18} />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  className="hover:bg-destructive hover:text-destructive-foreground flex w-full
                    justify-start gap-2"
                  onClick={() => handleDelete(data)}
                  aria-label="Delete system prompt"
                  tabIndex={0}>
                  <Trash2 size={18} />
                  <span>Delete</span>
                </Button>
              </PopoverContent>
            </Popover>
          )
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
        title="Failed to get system prompt"
        description={error.message}
      />
    )
  }

  if (data?.total === 0) {
    return (
      <EmptyContent
        image="/images/empty-data.png"
        title="No system prompts found"
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
        <h1 className="page-title">System prompts</h1>
        <NewButton
          label="New Prompt"
          onClick={() => navigate('/system-prompts/new')}
          disabled={isLoading}
        />
      </div>

      <DataTable columns={columns} data={data?.items || []} meta={meta} isLoading={isLoading} />

      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
