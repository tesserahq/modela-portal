import useBreadcrumb from '@/hooks/useBreadcrumbs'
import { Button } from '@/modules/shadcn/ui/button'
import { FileText, Layers, Server } from 'lucide-react'
import { Outlet, useLoaderData, useLocation, useNavigate, useParams } from 'react-router'
import { useApp } from 'tessera-ui'
import { EmptyContent } from 'tessera-ui/components'
import { DetailItemsProps, Layout } from 'tessera-ui/layouts'
import { useCredential } from '@/resources/hooks/credentials/use-credential'
import { useModelConfig } from '@/resources/hooks/model-config/use-model-config'
import { useSystemPrompt } from '@/resources/hooks/system-prompt/use-system-prompt'

export function loader({ params }: { params: { promptID: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.promptID }
}

export default function SystemPromptDetailLayout() {
  const { apiUrl, nodeEnv, id } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()
  const params = useParams()
  const { pathname } = useLocation()

  const menuItems: DetailItemsProps[] = [
    {
      title: 'Overview',
      path: `/system-prompts/${id}/overview`,
      icon: FileText,
    },
    {
      title: 'Versions',
      path: `/system-prompts/${id}/versions`,
      icon: Layers,
    },
  ]

  const { data, isLoading, error } = useSystemPrompt(
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
        title="Oops No System Prompt Found"
        image="/images/empty-data.png"
        description={`We can't find System Prompt with ID ${id}. ${(error as Error)?.message ?? ''}`}>
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
