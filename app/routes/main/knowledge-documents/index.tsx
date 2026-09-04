import { DataTable } from '@/components/data-table'
import { AppPreloader } from '@/components/loader/pre-loader'
import { Popover, PopoverContent, PopoverTrigger } from '@/modules/shadcn/ui/popover'
import {
  useDeleteKnowledgeDocument,
  useKnowledgeDocuments,
} from '@/resources/hooks/knowledge-documents/use-knowledge-document'
import { KnowledgeDocumentType } from '@/resources/queries/knowledge-documents'
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
  const pagination = ensureCanonicalPagination(request, { defaultSize: 25, defaultPage: 1 })
  if (pagination instanceof Response) return pagination
  return { apiUrl: process.env.API_URL, nodeEnv: process.env.NODE_ENV, pagination }
}

export default function KnowledgeDocumentsIndex() {
  const { apiUrl, nodeEnv, pagination } = useLoaderData<typeof loader>()
  const { token, isLoadingIdenties } = useApp()
  const navigate = useNavigate()
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)
  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv! }
  const { data, isLoading, error } = useKnowledgeDocuments(
    config,
    { page: pagination.page, size: pagination.size },
    { enabled: !!token && !isLoadingIdenties }
  )
  const { mutateAsync: deleteDocument } = useDeleteKnowledgeDocument(config, {
    onSuccess: () => deleteConfirmationRef.current?.close(),
    onError: () => deleteConfirmationRef.current?.updateConfig({ isLoading: false }),
  })

  const handleDelete = (document: KnowledgeDocumentType) => {
    deleteConfirmationRef.current?.open({
      title: 'Delete Knowledge Document',
      description: `Are you sure you want to delete "${document.title}" and all of its chunks? This action cannot be undone.`,
      onDelete: async () => {
        deleteConfirmationRef.current?.updateConfig({ isLoading: true })
        await deleteDocument(document.id)
      },
    })
  }

  const columns = useMemo<ColumnDef<KnowledgeDocumentType>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
        size: 260,
        cell: ({ row }) => (
          <Link to={`/knowledge-documents/${row.original.id}`} className="button-link">
            <div className="max-w-[260px] truncate" title={row.original.title}>
              {row.original.title}
            </div>
          </Link>
        ),
      },
      { accessorKey: 'chunk_count', header: 'Chunks', size: 90 },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        size: 180,
        cell: ({ row }) => <DateTime date={row.original.created_at} formatStr="dd/MM/yyyy HH:mm" />,
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated At',
        size: 180,
        cell: ({ row }) => <DateTime date={row.original.updated_at} formatStr="dd/MM/yyyy HH:mm" />,
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
        cell: ({ row }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button size="icon" variant="ghost" aria-label="Open actions">
                <EllipsisVertical size={18} />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" side="left" className="w-40 p-2">
              <Button
                variant="ghost"
                className="flex w-full justify-start gap-2"
                onClick={() => navigate(`/knowledge-documents/${row.original.id}`)}>
                <EyeIcon size={18} /> Overview
              </Button>
              <Button
                variant="ghost"
                className="flex w-full justify-start gap-2"
                onClick={() => navigate(`/knowledge-documents/${row.original.id}/edit`)}>
                <Edit size={18} /> Edit
              </Button>
              <Button
                variant="ghost"
                className="flex w-full justify-start gap-2 hover:bg-destructive
                  hover:text-destructive-foreground"
                onClick={() => handleDelete(row.original)}>
                <Trash2 size={18} /> Delete
              </Button>
            </PopoverContent>
          </Popover>
        ),
      },
    ],
    [navigate]
  )

  if (isLoading || isLoadingIdenties) return <AppPreloader />
  if (error) {
    return (
      <EmptyContent
        image="/images/error.png"
        title="Failed to load knowledge documents"
        description={error.message}
      />
    )
  }
  if (data?.total === 0) {
    return (
      <EmptyContent
        image="/images/empty-data.png"
        title="No knowledge documents found"
        description="Create the first document in the knowledge base.">
        <Button onClick={() => navigate('/knowledge-documents/new')} variant="black">
          Start Creating
        </Button>
      </EmptyContent>
    )
  }

  const meta = data
    ? { page: data.page, pages: data.pages, size: data.size, total: data.total }
    : undefined
  return (
    <div className="h-full page-content">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="page-title">Knowledge Documents</h1>
        <NewButton
          label="New Knowledge Document"
          onClick={() => navigate('/knowledge-documents/new')}
          disabled={isLoading}
        />
      </div>
      <DataTable columns={columns} data={data?.items ?? []} meta={meta} isLoading={isLoading} />
      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
