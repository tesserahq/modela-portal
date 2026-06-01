import useBreadcrumb from '@/hooks/useBreadcrumbs'
import { Button } from '@/modules/shadcn/ui/button'
import { FileText, Server } from 'lucide-react'
import { Outlet, useLoaderData, useLocation, useNavigate, useParams } from 'react-router'
import { useApp } from 'tessera-ui'
import { EmptyContent } from 'tessera-ui/components'
import { DetailItemsProps, Layout } from 'tessera-ui/layouts'
import { useCredential } from '@/resources/hooks/credentials/use-credential'
import { useModelConfig } from '@/resources/hooks/model-config/use-model-config'

export function loader({ params }: { params: { modelConfigID: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.modelConfigID }
}

export default function ModelConfigDetailLayout() {
  const { apiUrl, nodeEnv, id } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()
  const params = useParams()
  const { pathname } = useLocation()

  const menuItems: DetailItemsProps[] = [
    {
      title: 'Overview',
      path: `/model-configs/${id}/overview`,
      icon: FileText,
    },
    {
      title: 'MCP Servers',
      path: `/model-configs/${id}/mcp-servers`,
      icon: Server,
    },
  ]

  const { data, isLoading, error } = useModelConfig(
    { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv },
    id,
    { enabled: !!token }
  )

  const breadcrumbs = useBreadcrumb({
    pathname,
    params,
    apiUrl,
    nodeEnv,
    token: token ?? undefined,
  })

  if (!isLoading && (error || !data)) {
    return (
      <EmptyContent
        title="Oops No Model Config Found"
        image="/images/empty-data.png"
        description={`We can't find model config with ID ${id}. ${(error as Error)?.message ?? ''}`}>
        <Button onClick={() => navigate('/model-configs')}>Back to Listing</Button>
      </EmptyContent>
    )
  }

  return (
    <Layout.Detail
      menuItems={menuItems}
      breadcrumbs={breadcrumbs}
      isLoading={breadcrumbs.length === 0 || !token || !id}>
      <div className="max-w-screen-2xl mx-auto p-3">
        <Outlet />
      </div>
    </Layout.Detail>
  )
}
