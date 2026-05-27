import { redirect } from 'react-router'

export async function loader({ params }: { params: { modelConfigID: string } }) {
  return redirect(`/model-configs/${params.modelConfigID}/overview`)
}

export default function ModelConfigDetailIndex() {
  return null
}
