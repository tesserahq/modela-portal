import { IQueryConfig } from '@/resources/queries'
import { getTools } from '@/resources/queries/tools'
import { useQuery } from '@tanstack/react-query'

export const toolQueryKeys = {
  all: ['tools'] as const,
}

export function useTools(config: IQueryConfig, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: toolQueryKeys.all,
    queryFn: () => getTools(config),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled !== false && !!config.token,
  })
}
