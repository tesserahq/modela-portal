import { fetchApi } from '@/libraries/fetch'
import { IQueryConfig } from '@/resources/queries'
import { BuiltinToolType } from './tool.type'

export async function getTools(config: IQueryConfig): Promise<BuiltinToolType[]> {
  const { apiUrl, token, nodeEnv } = config
  return (await fetchApi(`${apiUrl}/tools`, token, nodeEnv, { method: 'GET' })) as BuiltinToolType[]
}
