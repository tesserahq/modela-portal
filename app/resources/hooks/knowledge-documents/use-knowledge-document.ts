import { IQueryConfig, IQueryParams } from '@/resources/queries'
import {
  createKnowledgeDocument,
  CreateKnowledgeDocumentData,
  deleteKnowledgeDocument,
  getKnowledgeDocument,
  getKnowledgeDocuments,
  KnowledgeDocumentType,
  updateKnowledgeDocument,
  UpdateKnowledgeDocumentData,
} from '@/resources/queries/knowledge-documents'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'tessera-ui/components'

class QueryError extends Error {
  constructor(error: unknown) {
    super(error instanceof Error ? error.message : String(error))
    this.name = 'QueryError'
  }
}

export const knowledgeDocumentQueryKeys = {
  all: ['knowledge-document'] as const,
  lists: () => [...knowledgeDocumentQueryKeys.all, 'list'] as const,
  list: (config: IQueryConfig, params: IQueryParams) =>
    [...knowledgeDocumentQueryKeys.lists(), config, params] as const,
  details: () => [...knowledgeDocumentQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...knowledgeDocumentQueryKeys.details(), id] as const,
}

export function useKnowledgeDocuments(
  config: IQueryConfig,
  params: IQueryParams,
  options?: { enabled?: boolean; staleTime?: number }
) {
  return useQuery({
    queryKey: knowledgeDocumentQueryKeys.list(config, params),
    queryFn: () => getKnowledgeDocuments(config, params),
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
    enabled: options?.enabled !== false && !!config.token,
  })
}

export function useKnowledgeDocument(
  config: IQueryConfig,
  id: string,
  options?: { enabled?: boolean; staleTime?: number }
) {
  return useQuery({
    queryKey: knowledgeDocumentQueryKeys.detail(id),
    queryFn: () => getKnowledgeDocument(config, id),
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
    enabled: options?.enabled !== false && !!id && !!config.token,
  })
}

export function useCreateKnowledgeDocument(
  config: IQueryConfig,
  options?: {
    onSuccess?: (data: KnowledgeDocumentType) => void
    onError?: (error: Error) => void
  }
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateKnowledgeDocumentData) => createKnowledgeDocument(config, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: knowledgeDocumentQueryKeys.lists() })
      toast.success('Knowledge document created successfully')
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      const queryError = new QueryError(error)
      toast.error('Failed to create knowledge document', { description: queryError.message })
      options?.onError?.(queryError)
    },
  })
}

export function useUpdateKnowledgeDocument(
  config: IQueryConfig,
  options?: {
    onSuccess?: (data: KnowledgeDocumentType) => void
    onError?: (error: Error) => void
  }
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateKnowledgeDocumentData }) =>
      updateKnowledgeDocument(config, id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(knowledgeDocumentQueryKeys.detail(data.id), data)
      queryClient.invalidateQueries({ queryKey: knowledgeDocumentQueryKeys.lists() })
      toast.success(
        variables.data.raw_content === undefined
          ? 'Knowledge document updated successfully'
          : 'Knowledge document updated; re-indexing has been queued'
      )
      options?.onSuccess?.(data)
    },
    onError: (error) => {
      const queryError = new QueryError(error)
      toast.error('Failed to update knowledge document', { description: queryError.message })
      options?.onError?.(queryError)
    },
  })
}

export function useDeleteKnowledgeDocument(
  config: IQueryConfig,
  options?: { onSuccess?: () => void; onError?: (error: Error) => void }
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteKnowledgeDocument(config, id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: knowledgeDocumentQueryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: knowledgeDocumentQueryKeys.lists() })
      toast.success('Knowledge document deleted successfully')
      options?.onSuccess?.()
    },
    onError: (error) => {
      const queryError = new QueryError(error)
      toast.error('Failed to delete knowledge document', { description: queryError.message })
      options?.onError?.(queryError)
    },
  })
}
