/* eslint-disable @typescript-eslint/no-explicit-any */
import { IQueryConfig, IQueryParams } from '@/resources/queries'
import { getSystemPrompts } from '@/resources/queries/system-prompt'
import { useQuery } from '@tanstack/react-query'

class QueryError extends Error {
  code?: string
  details?: unknown

  constructor(message: string, code?: string, details?: unknown) {
    super(message)
    this.name = 'QueryError'
    this.code = code
    this.details = details
  }
}

export const contextSourceQueryKeys = {
  all: ['system-prompt'] as const,
  lists: () => [...contextSourceQueryKeys.all, 'list'] as const,
  list: (config: IQueryConfig, params: IQueryParams) =>
    [...contextSourceQueryKeys.lists(), config, params] as const,
  details: () => [...contextSourceQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...contextSourceQueryKeys.details(), id] as const,
}

export function useSystemPrompts(
  config: IQueryConfig,
  params: IQueryParams,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: contextSourceQueryKeys.list(config, params),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await getSystemPrompts(config, params)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000,
    enabled: options?.enabled !== false && !!config.token,
  })
}
