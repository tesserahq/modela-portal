/* eslint-disable @typescript-eslint/no-explicit-any */
import { IQueryConfig, IQueryParams } from '@/resources/queries'
import {
  CreateModelConfigData,
  getModelConfig,
  getModelConfigs,
  ModelConfigType,
} from '@/resources/queries/model-config'
import {
  createModelConfig,
  deleteModelConfig,
} from '@/resources/queries/model-config/model-config.queries'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

export const contextSourceQueryKeys = {
  all: ['model-config'] as const,
  lists: () => [...contextSourceQueryKeys.all, 'list'] as const,
  list: (config: IQueryConfig, params: IQueryParams) =>
    [...contextSourceQueryKeys.lists(), config, params] as const,
  details: () => [...contextSourceQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...contextSourceQueryKeys.details(), id] as const,
}

export function useModelConfigs(
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

        return await getModelConfigs(config, params)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000,
    enabled: options?.enabled !== false && !!config.token,
  })
}

export function useModelConfig(
  config: IQueryConfig,
  id: string,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: contextSourceQueryKeys.detail(id),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await getModelConfig(config, id)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000,
    enabled: options?.enabled !== false && !!id && !!config.token,
  })
}

export function useCreateModelConfig(
  config: IQueryConfig,
  options?: {
    onSuccess?: (data: ModelConfigType) => void
    onError?: (error: Error) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateModelConfigData) => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await createModelConfig(config, data)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: contextSourceQueryKeys.lists() })
      toast.success('Model config created successfully', { duration: 3000 })
      options?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      toast.error('Failed to create model config', { description: error.message })
      options?.onError?.(error)
    },
  })
}

// export function useUpdateContextSource(
//   config: IQueryConfig,
//   options?: {
//     onSuccess?: (data: ContextSourceType) => void
//     onError?: (error: QueryError) => void
//   }
// ) {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: async ({ id, data }: { id: string; data: UpdateContextSourceData }) => {
//       try {
//         if (!config.token) {
//           throw new QueryError('Token is required', 'TOKEN_REQUIRED')
//         }

//         return await updateContextSource(config, id, data)
//       } catch (error: any) {
//         throw new QueryError(error)
//       }
//     },
//     onSuccess: (data) => {
//       queryClient.setQueryData(contextSourceQueryKeys.detail(data.id), data)
//       queryClient.invalidateQueries({ queryKey: contextSourceQueryKeys.lists() })
//       toast.success('Context source updated successfully', { duration: 3000 })
//       options?.onSuccess?.(data)
//     },
//     onError: (error: Error) => {
//       toast.error('Failed to update context source', { description: error.message })
//       options?.onError?.(error)
//     },
//   })
// }

export function useDeleteModelConfig(
  config: IQueryConfig,
  options?: {
    onSuccess?: () => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await deleteModelConfig(config, id)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: contextSourceQueryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: contextSourceQueryKeys.lists() })
      toast.success('Model config deleted successfully', { duration: 3000 })
      options?.onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error('Failed to delete context source', { description: error.message })
      options?.onError?.(error)
    },
  })
}
