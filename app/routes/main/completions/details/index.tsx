import { redirect } from 'react-router'

export async function loader({ params }: { params: { completionID: string } }) {
  return redirect(`/completions/${params.completionID}/overview`)
}

export default function CompletionDetailIndex() {
  return null
}
