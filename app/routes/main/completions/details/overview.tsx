import { AppPreloader } from '@/components/loader/pre-loader'
import { DetailContent } from '@/components/detail-content'
import { ResourceID, useApp } from 'tessera-ui'
import { useLoaderData } from 'react-router'
import { DateTime } from 'tessera-ui/components'
import { useCompletionRequest } from '@/resources/hooks/completion/use-completion'
import { formatCost } from '@/components/resource-components/analytic/cost-utils'
import { Activity } from 'react'

export async function loader({ params }: { params: { completionID: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.completionID }
}

export default function CompletionOverview() {
  const { apiUrl, nodeEnv, id } = useLoaderData<typeof loader>()
  const { token } = useApp()

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const { data, isLoading } = useCompletionRequest(config, id)

  if (isLoading || !token || !data) {
    return <AppPreloader className="min-h-screen" />
  }

  // Error has been handled in the layout.tsx

  const costValue = formatCost(data.cost_estimate_usd)

  return (
    <div className="animate-slide-up space-y-5">
      <DetailContent title={'Request Log Detail'}>
        <div className="d-list">
          <div className="d-item pb-1!">
            <dt className="d-label">ID</dt>
            <dd className="d-content break-all">
              <ResourceID value={data?.id || ''} />
            </dd>
          </div>
          <div className="d-item pb-1!">
            <dt className="d-label">Request ID</dt>
            <dd className="d-content break-all">
              <ResourceID value={data?.request_id || ''} />
            </dd>
          </div>
          <div className="d-item pb-1!">
            <dt className="d-label">Project ID</dt>
            <dd className="d-content break-all">
              <ResourceID value={data?.project_id || ''} />
            </dd>
          </div>
          <Activity mode={data?.created_by_id ? 'visible' : 'hidden'}>
            <div className="d-item pb-1!">
              <dt className="d-label">Created By</dt>
              <dd className="d-content break-all">
                {`${data.created_by.first_name ?? ''} ${data.created_by.last_name ?? ''}`.trim()}
              </dd>
            </div>
          </Activity>
          <div className="d-item pb-1!">
            <dt className="d-label">Provider</dt>
            <dd className="d-content">{data?.provider || 'N/A'}</dd>
          </div>
          <div className="d-item pb-1!">
            <dt className="d-label">Model</dt>
            <dd className="d-content">{data?.model || 'N/A'}</dd>
          </div>
          <div className="d-item pb-1!">
            <dt className="d-label">Model Config Slug</dt>
            <dd className="d-content">{data?.model_config_slug || 'N/A'}</dd>
          </div>
          <div className="d-item pb-1!">
            <dt className="d-label">Input Tokens</dt>
            <dd className="d-content">
              {data?.input_tokens != null ? data.input_tokens.toLocaleString() : 'N/A'}
            </dd>
          </div>
          <div className="d-item pb-1!">
            <dt className="d-label">Output Tokens</dt>
            <dd className="d-content">
              {data?.output_tokens != null ? data.output_tokens.toLocaleString() : 'N/A'}
            </dd>
          </div>
          <div className="d-item pb-1!">
            <dt className="d-label">Latency</dt>
            <dd className="d-content">
              {data?.latency_ms != null ? `${data.latency_ms.toLocaleString()}ms` : 'N/A'}
            </dd>
          </div>
          <div className="d-item pb-1!">
            <dt className="d-label">Cost</dt>
            <dd className="d-content">{costValue}</dd>
          </div>
          <div className="d-item pb-1!">
            <dt className="d-label">Finish Reason</dt>
            <dd className="d-content">{data?.finish_reason ?? 'N/A'}</dd>
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
    </div>
  )
}
