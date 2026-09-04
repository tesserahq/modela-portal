/* eslint-disable @typescript-eslint/no-explicit-any */
import { IQueryConfig, IQueryParams } from '@/resources/queries'
import {
  ModelConfigData,
  getModelConfig,
  getModelConfigs,
  ModelConfigType,
  UpdateModelConfigData,
  createModelConfig,
  deleteModelConfig,
  updateModelConfig,
  getModelConfigMCPServer,
  AttachModelConfigMCPServerData,
} from '@/resources/queries/model-config'
import {
  checkProviderCatalog,
  createModelConfigMCPServer,
  deleteModelConfigMCPServer,
  getLLMProviders,
  getModelConfigPromptType,
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
  mcpServers: () => [...contextSourceQueryKeys.all, 'mcp-servers'] as const,
  mcpServersList: (id: string, params: IQueryParams) =>
    [...contextSourceQueryKeys.mcpServers(), id, params] as const,
  llmProviders: () => [...contextSourceQueryKeys.all, 'providers'] as const,
  promptType: () => [...contextSourceQueryKeys.all, 'prompt-type'] as const,
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
    mutationFn: async (data: ModelConfigData) => {
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

export function useUpdateModelConfig(
  config: IQueryConfig,
  options?: {
    onSuccess?: (data: ModelConfigType) => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateModelConfigData }) => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await updateModelConfig(config, id, data)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(contextSourceQueryKeys.detail(data.id), data)
      queryClient.invalidateQueries({ queryKey: contextSourceQueryKeys.lists() })
      toast.success('Model config  updated successfully', { duration: 3000 })
      options?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      toast.error('Failed to update model config ', { description: error.message })
      options?.onError?.(error)
    },
  })
}

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
      toast.error('Failed to delete model config', { description: error.message })
      options?.onError?.(error)
    },
  })
}

export function useModelConfigMCPServers(
  config: IQueryConfig,
  params: IQueryParams,
  id: string,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: contextSourceQueryKeys.mcpServersList(id, params),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await getModelConfigMCPServer(config, params, id)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000,
    enabled: options?.enabled !== false && !!config.token,
  })
}

export function useAttachModelConfigMCPServer(
  config: IQueryConfig,
  id: string,
  options?: {
    onSuccess?: (data: string) => void
    onError?: (error: Error) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: AttachModelConfigMCPServerData) => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await createModelConfigMCPServer(config, id, data)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: contextSourceQueryKeys.mcpServers() })
      toast.success('MCP Server attached successfully', { duration: 3000 })
      options?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      toast.error('Failed to attach MCP Server', { description: error.message })
      options?.onError?.(error)
    },
  })
}

export function useDetachModelConfigMCPServer(
  config: IQueryConfig,
  options?: {
    onSuccess?: () => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, serverID }: { id: string; serverID: string }) => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await deleteModelConfigMCPServer(config, id, serverID)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contextSourceQueryKeys.mcpServers() })
      toast.success('MCP Server detached successfully', { duration: 3000 })
      options?.onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error('Failed to detached MCP Server', { description: error.message })
      options?.onError?.(error)
    },
  })
}

export function useLLMProviders(
  config: IQueryConfig,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: contextSourceQueryKeys.llmProviders(),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await getLLMProviders(config)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000,
    enabled: options?.enabled !== false && !!config.token,
  })
}

export function useCheckProviderCatalog(
  config: IQueryConfig,
  options?: {
    onSuccess?: () => void
    onError?: (error: Error) => void
  }
) {
  return useMutation({
    mutationFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await checkProviderCatalog(config)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    onSuccess: () => {
      toast.success(
        'Model catalog check queued — new/removed models will publish an event shortly',
        {
          duration: 4000,
        }
      )
      options?.onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error('Failed to trigger model catalog check', { description: error.message })
      options?.onError?.(error)
    },
  })
}

export function useModelConfigPromptType(
  config: IQueryConfig,
  params?: IQueryParams,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: contextSourceQueryKeys.promptType(),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        const param = params ?? { size: 100, page: 1 }

        return await getModelConfigPromptType(config, param)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000,
    enabled: options?.enabled !== false && !!config.token,
  })
}
