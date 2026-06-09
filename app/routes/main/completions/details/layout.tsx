import useBreadcrumb from '@/hooks/useBreadcrumbs'
import { Button } from '@/modules/shadcn/ui/button'
import { Box } from 'lucide-react'
import { Outlet, useLoaderData, useLocation, useNavigate, useParams } from 'react-router'
import { useApp } from 'tessera-ui'
import { EmptyContent } from 'tessera-ui/components'
import { DetailItemsProps, Layout } from 'tessera-ui/layouts'
import { useCompletionRequest } from '@/resources/hooks/completion/use-completion'

export function loader({ params }: { params: { completionID: string } }) {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, id: params.completionID }
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
      path: `/completions/${id}/overview`,
      icon: Box,
    },
  ]

  const { data, isLoading, error } = useCompletionRequest(
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
        title="Oops No Request Found"
        image="/images/empty-data.png"
        description={`We can't find Request with ID ${id}. ${(error as Error)?.message ?? ''}`}>
        <Button onClick={() => navigate('/completions')}>Back to Listing</Button>
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
