import { IQueryConfig, IQueryParams } from '@/resources/queries'
import {
  getProviderCatalogChanges,
  ProviderCatalogChangeFilters,
  setProviderCatalogChangeReviewed,
} from '@/resources/queries/provider-catalog'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'tessera-ui/components'

export const providerCatalogQueryKeys = {
  all: ['provider-catalog-changes'] as const,
  lists: () => [...providerCatalogQueryKeys.all, 'list'] as const,
  list: (
    config: Pick<IQueryConfig, 'apiUrl' | 'token'>,
    params: IQueryParams & ProviderCatalogChangeFilters
  ) => [...providerCatalogQueryKeys.lists(), config.apiUrl, params] as const,
}

export function useProviderCatalogChanges(
  config: IQueryConfig,
  params: IQueryParams & ProviderCatalogChangeFilters,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: providerCatalogQueryKeys.list(config, params),
    queryFn: () => getProviderCatalogChanges(config, params),
    enabled: options?.enabled !== false && !!config.token,
    staleTime: 60 * 1000,
  })
}

export function useSetProviderCatalogChangeReviewed(config: IQueryConfig) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reviewed }: { id: string; reviewed: boolean }) =>
      setProviderCatalogChangeReviewed(config, id, reviewed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: providerCatalogQueryKeys.lists() })
    },
    onError: (error: Error) => {
      toast.error('Failed to update review status', { description: error.message })
    },
  })
}
