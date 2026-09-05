import { redirect } from 'react-router'

export async function loader({ params }: { params: { knowledgeDocumentID: string } }) {
  return redirect(`/knowledge-documents/${params.knowledgeDocumentID}/overview`)
}

export default function KnowledgeDocumentDetailIndex() {
  return null
}
