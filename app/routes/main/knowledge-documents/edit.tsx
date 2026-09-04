import { KnowledgeDocumentForm } from '@/components/crud-forms/knowledge-document-form'
import { AppPreloader } from '@/components/loader/pre-loader'
import {
  useKnowledgeDocument,
  useUpdateKnowledgeDocument,
} from '@/resources/hooks/knowledge-documents/use-knowledge-document'
import { IQueryConfig } from '@/resources/queries'
import {
  getChangedKnowledgeDocumentUpdateData,
  knowledgeDocumentToFormValues,
} from '@/resources/queries/knowledge-documents'
import { Button } from '@/modules/shadcn/ui/button'
import { useLoaderData, useNavigate, useParams } from 'react-router'
import { EmptyContent, useApp } from 'tessera-ui'

export async function loader() {
  return { apiUrl: process.env.API_URL, nodeEnv: process.env.NODE_ENV }
}

export default function EditKnowledgeDocument() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()
  const { knowledgeDocumentID } = useParams()
  const config: IQueryConfig = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv! }
  const { data, isLoading, error } = useKnowledgeDocument(config, knowledgeDocumentID!, {
    enabled: !!knowledgeDocumentID && !!token,
  })
  const { mutateAsync: updateDocument } = useUpdateKnowledgeDocument(config)

  if (isLoading) return <AppPreloader />
  if (error || !data) {
    return (
      <EmptyContent
        image="/images/error.png"
        title="Failed to load knowledge document"
        description={error?.message ?? 'The document was not returned by the API.'}>
        <Button onClick={() => navigate('/knowledge-documents')}>Back to listing</Button>
      </EmptyContent>
    )
  }

  const originalValues = knowledgeDocumentToFormValues(data)
  return (
    <KnowledgeDocumentForm
      defaultValues={originalValues}
      submitLabel="Update"
      onSubmit={async (values) => {
        const changed = getChangedKnowledgeDocumentUpdateData(originalValues, values)
        if (Object.keys(changed).length === 0) {
          navigate(`/knowledge-documents/${data.id}`)
          return
        }
        const updated = await updateDocument({ id: data.id, data: changed })
        navigate(`/knowledge-documents/${updated.id}`, {
          state: { reindexingQueued: changed.raw_content !== undefined },
        })
      }}
    />
  )
}
