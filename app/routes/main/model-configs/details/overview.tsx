import { AppPreloader } from '@/components/loader/pre-loader'
import { DetailContent } from '@/components/detail-content'
import { ResourceID, useApp } from 'tessera-ui'
import { Popover, PopoverContent, PopoverTrigger } from '@/modules/shadcn/ui/popover'
import { Button } from '@shadcn/ui/button'
import { Edit, EllipsisVertical, FlaskConical, Trash2 } from 'lucide-react'
import { Activity, useRef, useState } from 'react'
import { useLoaderData, useNavigate, useParams } from 'react-router'
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
import { JsonEditor } from '@/components/misc/JSONEditor'
import { TestConfigDialog } from '@/components/model-config/test-config-dialog'

export async function loader({ params }: { params: { modelConfigID: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.modelConfigID }
}

export default function ModelConfiglOverview() {
  const { apiUrl, nodeEnv, id } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)
  const [isTestOpen, setIsTestOpen] = useState(false)

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const { data, isLoading } = useModelConfig(config, id)

  const { mutateAsync: deleteCredential } = useDeleteModelConfig(config, {
    onSuccess: () => {
      deleteConfirmationRef.current?.close()
      navigate('/model-configs')
    },
  })

  const handleDelete = () => {
    if (!data) return
    deleteConfirmationRef.current?.open({
      title: 'Delete Model Config',
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
        title={'Model Config Detail'}
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
                onClick={() => setIsTestOpen(true)}>
                <FlaskConical size={18} />
                <span>Test</span>
              </Button>
              <Button
                variant="ghost"
                className="flex w-full justify-start gap-2"
                onClick={() => navigate(`/model-configs/${id}/edit`)}>
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
            <dt className="d-label">Slug</dt>
            <dd className="d-content">{data?.slug || 'N/A'}</dd>
          </div>
          <div className="d-item pb-1!">
            <dt className="d-label">Provider</dt>
            <dd className="d-content">{data?.provider || 'N/A'}</dd>
          </div>
          <div className="d-item pb-1!">
            <dt className="d-label">Model</dt>
            <dd className="d-content">{data?.model || 'N/A'}</dd>
          </div>
          <div className="d-item pb-1!">
            <dt className="d-label">Config Type</dt>
            <dd className="d-content">{data?.config_type || 'N/A'}</dd>
          </div>
          <div className="d-item pb-1!">
            <dt className="d-label">Default</dt>
            <dd className="d-content">
              {data?.is_default ? (
                <Badge variant="outline" className="border border-green-500 text-green-600">
                  <span className="text-xs">Yes</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="border border-red-500 text-red-600">
                  <span className="text-xs">No</span>
                </Badge>
              )}
            </dd>
          </div>
          {data?.config_type === 'chat' && (
            <div className="d-item pb-1!">
              <dt className="d-label">Built-in Tools</dt>
              <dd className="d-content">
                {data.enabled_tools?.length ? data.enabled_tools.join(', ') : 'None'}
              </dd>
            </div>
          )}
          <div className="d-item pb-1!">
            <dt className="d-label">Temperature</dt>
            <dd className="d-content">{data?.temperature ?? 'N/A'}</dd>
          </div>
          <div className="d-item pb-1!">
            <dt className="d-label">Max Tokens</dt>
            <dd className="d-content">{data?.max_tokens ?? 'N/A'}</dd>
          </div>
          <div className="d-item pb-1!">
            <dt className="d-label">Top P</dt>
            <dd className="d-content">{data?.top_p ?? 'N/A'}</dd>
          </div>
          {/* <div className="d-item pb-1!">
            <dt className="d-label">Max Tool Rounds</dt>
            <dd className="d-content">{data?.max_tool_rounds ?? 'N/A'}</dd>
          </div> */}
          <Activity
            mode={
              data?.output_schema && Object.keys(data.output_schema).length > 0
                ? 'visible'
                : 'hidden'
            }>
            <div className="d-item items-start! pb-0! mt-3!">
              <dt className="d-label">Output Schema</dt>
              <dd className="d-content flex-1">
                <div className="flex-1 w-full">
                  <JsonEditor value={JSON.stringify(data?.output_schema, null, 2)} readOnly />
                </div>
              </dd>
            </div>
          </Activity>
          <Activity mode={data?.config_type === 'embedding' && data?.params ? 'visible' : 'hidden'}>
            <div className="d-item items-start! pb-0! mt-3!">
              <dt className="d-label">Embedding Parameters</dt>
              <dd className="d-content flex-1">
                <JsonEditor value={JSON.stringify(data?.params, null, 2)} readOnly />
              </dd>
            </div>
          </Activity>
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

      <Activity mode={data?.system_prompt_id ? 'visible' : 'hidden'}>
        <DetailContent title={'System Prompt'}>
          <div className="d-list">
            <div className="d-item">
              <dt className="d-label">ID</dt>
              <dd className="d-content">
                <ResourceID value={data?.system_prompt_id || ''} />
              </dd>
            </div>
            <div className="d-item">
              <dt className="d-label">Name</dt>
              <dd className="d-content">{data?.system_prompt?.name || 'N/A'}</dd>
            </div>
            <Activity mode={data?.system_prompt?.content ? 'visible' : 'hidden'}>
              <div className="d-item mb-7">
                <dt className="d-label">Content</dt>
              </div>
            </Activity>
          </div>
          <Activity mode={data?.system_prompt?.content ? 'visible' : 'hidden'}>
            <DetailContent title={''}>
              <Markdown>{data?.system_prompt?.content ?? '-'}</Markdown>
            </DetailContent>
          </Activity>
        </DetailContent>
      </Activity>

      <TestConfigDialog
        open={isTestOpen}
        onOpenChange={setIsTestOpen}
        config={config}
        slug={data?.slug || ''}
      />

      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
