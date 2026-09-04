import { KnowledgeDocumentForm } from '@/components/crud-forms/knowledge-document-form'
import { useCreateKnowledgeDocument } from '@/resources/hooks/knowledge-documents/use-knowledge-document'
import { IQueryConfig } from '@/resources/queries'
import { knowledgeDocumentFormDefaultValue } from '@/resources/queries/knowledge-documents'
import { useLoaderData, useNavigate } from 'react-router'
import { useApp } from 'tessera-ui'

export async function loader() {
  return { apiUrl: process.env.API_URL, nodeEnv: process.env.NODE_ENV }
}

export default function NewKnowledgeDocument() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token } = useApp()
  const navigate = useNavigate()
  const config: IQueryConfig = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv! }
  const { mutateAsync: createDocument } = useCreateKnowledgeDocument(config, {
    onSuccess: (document) =>
      navigate(`/knowledge-documents/${document.id}`, { state: { reindexingQueued: true } }),
  })

  return (
    <KnowledgeDocumentForm
      defaultValues={knowledgeDocumentFormDefaultValue}
      onSubmit={async (data) => {
        await createDocument(data)
      }}
    />
  )
}
