import { DataTable } from '@/components/data-table'
import { AppPreloader } from '@/components/loader/pre-loader'
import { Popover, PopoverContent, PopoverTrigger } from '@/modules/shadcn/ui/popover'
import {
  useDetachModelConfigMCPServer,
  useModelConfigMCPServers,
} from '@/resources/hooks/model-config/use-model-config'
import { McpServerType } from '@/resources/queries/mcp-servers/mcp-server.type'
import { ensureCanonicalPagination } from '@/utils/helpers/pagination.helper'
import { Button } from '@shadcn/ui/button'
import { ColumnDef } from '@tanstack/react-table'
import { Edit, EllipsisVertical, EyeIcon, Unlink } from 'lucide-react'
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
  params: { modelConfigID: string }
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

  return { apiUrl, nodeEnv, pagination, id: params.modelConfigID }
}

export default function ModelConfigMcpServersIndex() {
  const { apiUrl, nodeEnv, pagination, id } = useLoaderData<typeof loader>()
  const { token, isLoadingIdenties } = useApp()
  const navigate = useNavigate()
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const { data, isLoading, error } = useModelConfigMCPServers(
    config,
    { page: pagination.page, size: pagination.size },
    id,
    { enabled: !!token && !isLoadingIdenties && !!id }
  )

  const { mutateAsync: detachMcpServer } = useDetachModelConfigMCPServer(config, {
    onSuccess: () => {
      deleteConfirmationRef.current?.close()
    },
    onError: () => {
      deleteConfirmationRef?.current?.updateConfig({ isLoading: false })
    },
  })

  const handleDelete = (server: McpServerType) => {
    deleteConfirmationRef.current?.open({
      title: 'Detach MCP Server',
      description: `Are you sure you want to detach "${server.name}"? This action cannot be undone.`,
      onDelete: async () => {
        deleteConfirmationRef?.current?.updateConfig({ isLoading: true })
        await detachMcpServer({ id, serverID: server.server_id })
      },
    })
  }

  const columns = useMemo<ColumnDef<McpServerType>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        size: 200,
        cell: ({ row }) => {
          const { name } = row.original
          return (
            <Link to={`/mcp-servers/${row.original.id}`} className="button-link">
              <div className="max-w-[200px] truncate" title={name}>
                {name || '-'}
              </div>
            </Link>
          )
        },
      },
      {
        accessorKey: 'server_id',
        header: 'Server ID',
        size: 180,
        cell: ({ row }) => {
          const value = row.original.server_id
          return (
            <div className="max-w-[180px] truncate" title={value}>
              {value || '-'}
            </div>
          )
        },
      },
      {
        accessorKey: 'url',
        header: 'URL',
        size: 240,
        cell: ({ row }) => {
          const value = row.original.url
          return (
            <div className="max-w-[240px] truncate" title={value}>
              {value || '-'}
            </div>
          )
        },
      },
      {
        accessorKey: 'enabled',
        header: 'Enabled',
        size: 100,
        cell: ({ row }) => (row.original.enabled ? 'Yes' : 'No'),
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
          const server = row.original

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
                  onClick={() => navigate(`/mcp-servers/${server.id}`)}>
                  <EyeIcon size={18} />
                  <span>Overview</span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex w-full justify-start gap-2"
                  onClick={() => navigate(`/mcp-servers/${server.id}/edit`)}
                  aria-label="Edit MCP server"
                  tabIndex={0}>
                  <Edit size={18} />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  className="hover:bg-destructive hover:text-destructive-foreground flex w-full
                    justify-start gap-2"
                  onClick={() => handleDelete(server)}
                  aria-label="Detach MCP server"
                  tabIndex={0}>
                  <Unlink size={18} />
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
        title="Failed to get MCP servers"
        description={error.message}
      />
    )
  }

  if (data?.total === 0) {
    return (
      <EmptyContent
        image="/images/empty-data.png"
        title="No MCP servers found for this Model Config"
        description="Get started by connect to available MCP server.">
        <Button onClick={() => navigate(`/model-configs/${id}/mcp-servers/new`)} variant="black">
          Start Connection
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
        <h1 className="page-title">MCP Servers</h1>
        <NewButton
          label="Attach New MCP Server"
          onClick={() => navigate(`/model-configs/${id}/mcp-servers/new`)}
          disabled={isLoading}
        />
      </div>

      <DataTable columns={columns} data={data?.items || []} meta={meta} isLoading={isLoading} />

      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
