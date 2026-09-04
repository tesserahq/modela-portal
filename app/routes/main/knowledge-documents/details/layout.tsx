import useBreadcrumb from '@/hooks/useBreadcrumbs'
import { useKnowledgeDocument } from '@/resources/hooks/knowledge-documents/use-knowledge-document'
import { Button } from '@shadcn/ui/button'
import { FileText } from 'lucide-react'
import { Outlet, useLoaderData, useLocation, useNavigate, useParams } from 'react-router'
import { EmptyContent, useApp } from 'tessera-ui'
import { DetailItemsProps, Layout } from 'tessera-ui/layouts'

export function loader({ params }: { params: { knowledgeDocumentID: string } }) {
  return {
    apiUrl: process.env.API_URL,
    nodeEnv: process.env.NODE_ENV,
    id: params.knowledgeDocumentID,
  }
}

export default function KnowledgeDocumentDetailLayout() {
  const { apiUrl, nodeEnv, id } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()
  const params = useParams()
  const { pathname } = useLocation()
  const { data, isLoading, error } = useKnowledgeDocument(
    { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv! },
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
  const menuItems: DetailItemsProps[] = [
    { title: 'Overview', path: `/knowledge-documents/${id}/overview`, icon: FileText },
  ]

  if (!isLoading && (error || !data)) {
    return (
      <EmptyContent
        title="Knowledge document not found"
        image="/images/empty-data.png"
        description={(error as Error)?.message ?? `No document exists with ID ${id}.`}>
        <Button onClick={() => navigate('/knowledge-documents')}>Back to listing</Button>
      </EmptyContent>
    )
  }

  return (
    <Layout.Detail
      menuItems={menuItems}
      breadcrumbs={breadcrumbs}
      isLoading={breadcrumbs.length === 0 || !token || !id}>
      <div className="mx-auto max-w-screen-2xl p-3">
        <Outlet />
      </div>
    </Layout.Detail>
  )
}
