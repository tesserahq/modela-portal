import { AppPreloader } from '@/components/loader/pre-loader'
import { DetailContent } from '@/components/detail-content'
import { ResourceID, useApp } from 'tessera-ui'
import { Popover, PopoverContent, PopoverTrigger } from '@/modules/shadcn/ui/popover'
import { Button } from '@shadcn/ui/button'
import { Edit, EllipsisVertical, Trash2 } from 'lucide-react'
import { Activity, useRef } from 'react'
import { useLoaderData, useNavigate } from 'react-router'
import { DateTime } from 'tessera-ui/components'
import DeleteConfirmation, {
  type DeleteConfirmationHandle,
} from 'tessera-ui/components/delete-confirmation'
import Markdown from '@/components/makrdown/markdown'
import {
  useDeleteModelConfig,
  useModelConfig,
} from '@/resources/hooks/model-config/use-model-config'
import { Badge } from '@/modules/shadcn/ui/badge'
import { useSystemPrompt } from '@/resources/hooks/system-prompt/use-system-prompt'

export async function loader({ params }: { params: { promptID: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.promptID }
}

export default function SystemPromptOverview() {
  const { apiUrl, nodeEnv, id } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const { data, isLoading } = useSystemPrompt(config, id)

  const { mutateAsync: deleteCredential } = useDeleteModelConfig(config, {
    onSuccess: () => {
      deleteConfirmationRef.current?.close()
      navigate('/system-prompts')
    },
  })

  const handleDelete = () => {
    if (!data) return
    deleteConfirmationRef.current?.open({
      title: 'Delete System Prompt',
      description: `Are you sure you want to delete "${data.name}"? This action cannot be undone.`,
      onDelete: async () => {
        deleteConfirmationRef?.current?.updateConfig({ isLoading: true })
        await deleteCredential(data.id)
      },
    })
  }

  if (isLoading || !token) {
    return <AppPreloader className="min-h-screen" />
  }

  // Error has been handled in the layout.tsx

  return (
    <div className="animate-slide-up space-y-5">
      <DetailContent
        title={'System Prompt Detail'}
        actions={
          <Popover>
            <PopoverTrigger asChild>
              <Button size="icon" variant="ghost" className="px-0">
                <EllipsisVertical size={18} />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" side="left" className="w-40 p-2">
              <Button
                variant="ghost"
                className="flex w-full justify-start gap-2"
                onClick={() => navigate(`/system-prompts/${id}/edit`)}>
                <Edit size={18} />
                <span>Edit</span>
              </Button>
              <Button
                variant="ghost"
                className="hover:bg-destructive hover:text-destructive-foreground flex w-full
                  justify-start gap-2"
                onClick={handleDelete}>
                <Trash2 size={18} />
                <span>Delete</span>
              </Button>
            </PopoverContent>
          </Popover>
        }>
        <div className="d-list">
          <div className="d-item pb-1!">
            <dt className="d-label">ID</dt>
            <dd className="d-content break-all">
              <ResourceID value={data?.id || ''} />
            </dd>
          </div>
          <div className="d-item pb-1!">
            <dt className="d-label">Name</dt>
            <dd className="d-content">{data?.name || 'N/A'}</dd>
          </div>
          <div className="d-item pb-1!">
            <dt className="d-label">Current Version ID</dt>
            <dd className="d-content">
              {data?.current_version_id ? (
                <ResourceID value={data.current_version_id || ''} />
              ) : (
                'N/A'
              )}
            </dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Created At</dt>
            <dd className="d-content">{data?.created_at && <DateTime date={data.created_at} />}</dd>
          </div>
          <div className="d-item">
            <dt className="d-label">Updated At</dt>
            <dd className="d-content">{data?.updated_at && <DateTime date={data.updated_at} />}</dd>
          </div>
        </div>
      </DetailContent>

      <Activity mode={data?.current_version_id ? 'visible' : 'hidden'}>
        <DetailContent title={'Current Version Detail'}>
          <div className="d-list">
            <div className="d-item">
              <dt className="d-label">Version</dt>
              <dd className="d-content">
                {data?.current_version?.version_number ? (
                  <Badge variant="outline" className="border border-green-500 text-green-600 py-0">
                    <span className="text-xs">v.{data?.current_version?.version_number}</span>
                  </Badge>
                ) : (
                  'N/A'
                )}
              </dd>
            </div>
            <div className="d-item">
              <dt className="d-label">Note</dt>
              <dd className="d-content">{data?.current_version?.note || 'N/A'}</dd>
            </div>
            <Activity mode={data?.current_version?.content ? 'visible' : 'hidden'}>
              <div className="d-item mb-7">
                <dt className="d-label">Content</dt>
              </div>
            </Activity>
          </div>
          <Activity mode={data?.current_version?.content ? 'visible' : 'hidden'}>
            <DetailContent title={''}>
              <Markdown>{data?.current_version?.content ?? '-'}</Markdown>
            </DetailContent>
          </Activity>
        </DetailContent>
      </Activity>

      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
