import { DataTable } from '@/components/data-table'
import { AppPreloader } from '@/components/loader/pre-loader'
import { JsonEditor } from '@/components/misc/JSONEditor'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/modules/shadcn/ui/dialog'
import {
  useMcpServerTools,
  useRefreshMcpServerTools,
} from '@/resources/hooks/mcp-servers/use-mcp-server'
import { McpCatalogTool } from '@/resources/queries/mcp-servers/mcp-server.type'
import { Button } from '@shadcn/ui/button'
import { ColumnDef } from '@tanstack/react-table'
import { Eye, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLoaderData } from 'react-router'
import { useApp } from 'tessera-ui'
import { EmptyContent } from 'tessera-ui/components'

export async function loader({ params }: { params: { mcpServerID: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.mcpServerID }
}

export default function McpServerTools() {
  const { apiUrl, nodeEnv, id } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const [selectedTool, setSelectedTool] = useState<McpCatalogTool | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const { data, isLoading, error, isFetching } = useMcpServerTools(config, id, { enabled: !!token })

  const { mutateAsync: refreshTools } = useRefreshMcpServerTools(config, {
    onSuccess: () => setIsRefreshing(false),
    onError: () => setIsRefreshing(false),
  })

  const handleRefresh = () => {
    setIsRefreshing(true)
    refreshTools(id)
  }

  const columns = useMemo<ColumnDef<McpCatalogTool>[]>(
    () => [
      {
        accessorKey: 'qualified_name',
        header: 'Tool',
        size: 260,
        cell: ({ row }) => {
          const value = row.original.qualified_name
          return (
            <div className="max-w-[260px] truncate font-mono text-sm" title={value}>
              {value}
            </div>
          )
        },
      },
      {
        accessorKey: 'description',
        header: 'Description',
        size: 360,
        cell: ({ row }) => {
          const value = row.original.description
          return (
            <div className="max-w-[360px] truncate" title={value ?? undefined}>
              {value || '—'}
            </div>
          )
        },
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        cell: ({ row }) => (
          <Button
            size="icon"
            variant="ghost"
            className="px-0 hover:bg-transparent"
            aria-label="View input schema"
            onClick={() => setSelectedTool(row.original)}>
            <Eye size={18} />
          </Button>
        ),
      },
    ],
    []
  )

  if ((isLoading || !token) && !data) {
    return <AppPreloader />
  }

  if (error) {
    return (
      <EmptyContent
        image="/images/error.png"
        title="Failed to load tools"
        description={error.message}
      />
    )
  }

  const tools = data?.tools ?? []

  return (
    <div className="h-full page-content">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="page-title">Tools ({tools.length})</h1>
        <Button
          variant="outline"
          className="gap-2"
          onClick={handleRefresh}
          disabled={isRefreshing || isFetching}>
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : undefined} />
          {isRefreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>

      {tools.length === 0 ? (
        <EmptyContent
          image="/images/empty-data.png"
          title="No tools found"
          description="This MCP server hasn't reported any tools yet. Try refreshing."
        />
      ) : (
        <DataTable columns={columns} data={tools} isLoading={isLoading} />
      )}

      <Dialog open={!!selectedTool} onOpenChange={(open) => !open && setSelectedTool(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-mono">{selectedTool?.qualified_name}</DialogTitle>
            <DialogDescription>
              {selectedTool?.description || 'No description provided.'}
            </DialogDescription>
          </DialogHeader>

          {selectedTool && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Input schema</label>
              <JsonEditor
                value={JSON.stringify(selectedTool.input_schema, null, 2)}
                readOnly
                minHeight={240}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
