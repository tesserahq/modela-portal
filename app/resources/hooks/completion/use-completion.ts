/* eslint-disable @typescript-eslint/no-explicit-any */
import { IQueryConfig, IQueryParams } from '@/resources/queries'
import {
  ChatCompletionRequest,
  ChatCompletionResponse,
  createChatCompletion,
  getCompletionRequest,
  getCompletionRequests,
} from '@/resources/queries/completion'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'tessera-ui/components'

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

export const completionQueryKeys = {
  all: ['completions'] as const,
  lists: () => [...completionQueryKeys.all, 'list'] as const,
  list: (config: IQueryConfig, params: IQueryParams) =>
    [...completionQueryKeys.lists(), config, params] as const,
  details: () => [...completionQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...completionQueryKeys.details(), id] as const,
}

export function useCompletionRequests(
  config: IQueryConfig,
  params: IQueryParams,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: completionQueryKeys.list(config, params),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await getCompletionRequests(config, params)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000,
    enabled: options?.enabled !== false && !!config.token,
  })
}

export function useChatCompletion(
  config: IQueryConfig,
  options?: {
    onSuccess?: (data: ChatCompletionResponse) => void
    onError?: (error: Error) => void
  }
) {
  return useMutation({
    mutationFn: async (body: ChatCompletionRequest) => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await createChatCompletion(config, body)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      toast.error('Failed to run chat completion', { description: error.message })
      options?.onError?.(error)
    },
  })
}

export function useCompletionRequest(
  config: IQueryConfig,
  id: string,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: completionQueryKeys.detail(id),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await getCompletionRequest(config, id)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000,
    enabled: options?.enabled !== false && !!config.token,
  })
}
