/* eslint-disable @typescript-eslint/no-explicit-any */
import { IQueryConfig, IQueryParams } from '@/resources/queries'
import {
  createSystemPromptVersion,
  CreateSystemPromptVersionData,
  getSystemPrompts,
  getSystemPromptVersions,
  SystemPromptVersionType,
} from '@/resources/queries/system-prompt'
import {
  createSystemPrompt,
  deleteSystemPrompt,
  getSystemPrompt,
  updateSystemPrompt,
} from '@/resources/queries/system-prompt'
import {
  CreateSystemPromptData,
  SystemPromptType,
  UpdateSystemPromptData,
} from '@/resources/queries/system-prompt'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'tessera-ui'

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

export const systemPromptQueryKeys = {
  all: ['system-prompt'] as const,
  lists: () => [...systemPromptQueryKeys.all, 'list'] as const,
  list: (config: IQueryConfig, params: IQueryParams) =>
    [...systemPromptQueryKeys.lists(), config, params] as const,
  details: () => [...systemPromptQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...systemPromptQueryKeys.details(), id] as const,
  versions: () => [...systemPromptQueryKeys.all, 'versions'] as const,
  versionList: (name: string, params: IQueryParams) =>
    [...systemPromptQueryKeys.versions(), name, params] as const,
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
    queryKey: systemPromptQueryKeys.list(config, params),
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

export function useSystemPrompt(
  config: IQueryConfig,
  id: string,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: systemPromptQueryKeys.detail(id),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await getSystemPrompt(config, id)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000,
    enabled: options?.enabled !== false && !!config.token,
  })
}

export function useCreateSystemPrompt(
  config: IQueryConfig,
  options?: {
    onSuccess?: (data: SystemPromptType) => void
    onError?: (error: Error) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateSystemPromptData) => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await createSystemPrompt(config, data)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: systemPromptQueryKeys.lists() })
      toast.success('System prompt created successfully', { duration: 3000 })
      options?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      toast.error('Failed to create System prompt', { description: error.message })
      options?.onError?.(error)
    },
  })
}

export function useUpdateSystemPrompt(
  config: IQueryConfig,
  options?: {
    onSuccess?: (data: SystemPromptType) => void
    onError?: (error: QueryError) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSystemPromptData }) => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await updateSystemPrompt(config, id, data)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(systemPromptQueryKeys.detail(data.id), data)
      queryClient.invalidateQueries({ queryKey: systemPromptQueryKeys.lists() })
      toast.success('System prompt  updated successfully', { duration: 3000 })
      options?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      toast.error('Failed to update system prompt', { description: error.message })
      options?.onError?.(error)
    },
  })
}

export function useDeleteSystemPrompt(
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

        return await deleteSystemPrompt(config, id)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: systemPromptQueryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: systemPromptQueryKeys.lists() })
      toast.success('System prompt deleted successfully', { duration: 3000 })
      options?.onSuccess?.()
    },
    onError: (error: Error) => {
      toast.error('Failed to delete system prompt', { description: error.message })
      options?.onError?.(error)
    },
  })
}

export function useSystemPromptVersions(
  config: IQueryConfig,
  params: IQueryParams,
  name: string,
  options?: {
    enabled?: boolean
    staleTime?: number
  }
) {
  return useQuery({
    queryKey: systemPromptQueryKeys.versionList(name, params),
    queryFn: async () => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await getSystemPromptVersions(config, name, params)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    staleTime: options?.staleTime || 5 * 60 * 1000,
    enabled: options?.enabled !== false && !!config.token,
  })
}

export function useCreateSystemPromptVersion(
  config: IQueryConfig,
  options?: {
    onSuccess?: (data: SystemPromptVersionType) => void
    onError?: (error: Error) => void
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ data, name }: { data: CreateSystemPromptVersionData; name: string }) => {
      try {
        if (!config.token) {
          throw new QueryError('Token is required', 'TOKEN_REQUIRED')
        }

        return await createSystemPromptVersion(config, name, data)
      } catch (error: any) {
        throw new QueryError(error)
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: systemPromptQueryKeys.versions() })
      toast.success('New prompt version created successfully', { duration: 3000 })
      options?.onSuccess?.(data)
    },
    onError: (error: Error) => {
      toast.error('Failed to create new version for system prompt', { description: error.message })
      options?.onError?.(error)
    },
  })
}
