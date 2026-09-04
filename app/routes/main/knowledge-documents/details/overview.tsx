import { DetailContent } from '@/components/detail-content'
import { AppPreloader } from '@/components/loader/pre-loader'
import Markdown from '@/components/makrdown/markdown'
import { JsonEditor } from '@/components/misc/JSONEditor'
import { Alert, AlertDescription } from '@/modules/shadcn/ui/alert'
import { Popover, PopoverContent, PopoverTrigger } from '@/modules/shadcn/ui/popover'
import {
  useDeleteKnowledgeDocument,
  useKnowledgeDocument,
} from '@/resources/hooks/knowledge-documents/use-knowledge-document'
import { Button } from '@shadcn/ui/button'
import { Edit, EllipsisVertical, RefreshCw, Trash2, TriangleAlert } from 'lucide-react'
import { useRef } from 'react'
import { useLoaderData, useLocation, useNavigate } from 'react-router'
import { ResourceID, useApp } from 'tessera-ui'
import { DateTime } from 'tessera-ui/components'
import DeleteConfirmation, {
  type DeleteConfirmationHandle,
} from 'tessera-ui/components/delete-confirmation'

export function loader({ params }: { params: { knowledgeDocumentID: string } }) {
  return {
    apiUrl: process.env.API_URL,
    nodeEnv: process.env.NODE_ENV,
    id: params.knowledgeDocumentID,
  }
}

export default function KnowledgeDocumentOverview() {
  const { apiUrl, nodeEnv, id } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)
  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv! }
  const { data, isLoading, isFetching, refetch } = useKnowledgeDocument(config, id)
  const { mutateAsync: deleteDocument } = useDeleteKnowledgeDocument(config, {
    onSuccess: () => {
      deleteConfirmationRef.current?.close()
      navigate('/knowledge-documents')
    },
    onError: () => deleteConfirmationRef.current?.updateConfig({ isLoading: false }),
  })

  if (isLoading || !token || !data) return <AppPreloader className="min-h-screen" />

  const handleDelete = () => {
    deleteConfirmationRef.current?.open({
      title: 'Delete Knowledge Document',
      description: `Are you sure you want to delete "${data.title}" and all of its chunks? This action cannot be undone.`,
      onDelete: async () => {
        deleteConfirmationRef.current?.updateConfig({ isLoading: true })
        await deleteDocument(data.id)
      },
    })
  }

  return (
    <div className="animate-slide-up space-y-5">
      {location.state?.reindexingQueued && (
        <Alert variant="warning">
          <TriangleAlert className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>
              Re-indexing was queued. The backend does not expose job status yet; refresh to
              retrieve the latest chunk count.
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}>
              <RefreshCw className={isFetching ? 'animate-spin' : undefined} /> Refresh
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <DetailContent
        title="Knowledge Document Detail"
        actions={
          <Popover>
            <PopoverTrigger asChild>
              <Button size="icon" variant="ghost">
                <EllipsisVertical size={18} />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" side="left" className="w-40 p-2">
              <Button
                variant="ghost"
                className="flex w-full justify-start gap-2"
                onClick={() => navigate(`/knowledge-documents/${id}/edit`)}>
                <Edit size={18} /> Edit
              </Button>
              <Button
                variant="ghost"
                className="flex w-full justify-start gap-2 hover:bg-destructive
                  hover:text-destructive-foreground"
                onClick={handleDelete}>
                <Trash2 size={18} /> Delete
              </Button>
            </PopoverContent>
          </Popover>
        }>
        <div className="d-list">
          <div className="d-item pb-1!">
            <dt className="d-label">ID</dt>
            <dd className="d-content">
              <ResourceID value={data.id} />
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Title</dt>
            <dd className="d-content">{data.title}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Chunks</dt>
            <dd className="d-content">{data.chunk_count}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Created At</dt>
            <dd className="d-content">
              <DateTime date={data.created_at} />
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Updated At</dt>
            <dd className="d-content">
              <DateTime date={data.updated_at} />
            </dd>
          </div>
        </div>
      </DetailContent>
      <DetailContent title="Metadata">
        <JsonEditor value={JSON.stringify(data.metadata ?? {}, null, 2)} readOnly />
      </DetailContent>
      <DetailContent title="Content">
        <Markdown>{data.content || '-'}</Markdown>
      </DetailContent>
      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
