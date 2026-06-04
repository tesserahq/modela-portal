import { redirect } from 'react-router'

export async function loader({ params }: { params: { promptID: string } }) {
  return redirect(`/system-prompts/${params.promptID}/overview`)
}

export default function SystemPromptDetailIndex() {
  return null
}
