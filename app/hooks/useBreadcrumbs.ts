/* eslint-disable @typescript-eslint/no-explicit-any */
import { type QueryKey, useQueries } from '@tanstack/react-query'
import { NodeENVType } from '@/libraries/fetch'
import { BreadcrumbItemData } from 'tessera-ui'
import { IQueryConfig } from '@/resources/queries'
import { generateBreadcrumbs } from '@/utils/helpers/breadcumb.helper'
import { getCredential } from '@/resources/queries/credentials/credential.queries'
import { getMcpServer } from '@/resources/queries/mcp-servers/mcp-server.queries'
import { getModelConfig } from '@/resources/queries/model-config'
import { getSystemPrompt } from '@/resources/queries/system-prompt'
import { getCompletionRequest } from '@/resources/queries/completion'
import { getKnowledgeDocument } from '@/resources/queries/knowledge-documents'
import { credentialQueryKeys } from '@/resources/hooks/credentials/use-credential'
import { mcpServerQueryKeys } from '@/resources/hooks/mcp-servers/use-mcp-server'
import { modelConfigQueryKeys } from '@/resources/hooks/model-config/use-model-config'
import { systemPromptQueryKeys } from '@/resources/hooks/system-prompt/use-system-prompt'
import { knowledgeDocumentQueryKeys } from '@/resources/hooks/knowledge-documents/use-knowledge-document'
import { completionQueryKeys } from '@/resources/hooks/completion/use-completion'

/**
 * Resource state per breadcrumb
 */
export type BreadcrumbResourceState<T = any> = {
  data?: T
  isLoading: boolean
  error?: Error | null
}

/**
 * Breadcrumb hook config
 */
interface BreadcrumbConfigType {
  pathname: string
  params: Record<string, string | undefined>
  token: string
  apiUrl: string
  nodeEnv: NodeENVType
}

/**
 * Internal query config
 */
type BreadcrumbQueryConfig = {
  paramKey: string
  queryKey: QueryKey
  queryFn: () => Promise<any>
  enabled: boolean
  staleTime: number
}

/**
 * Fetcher registry (NO HOOKS)
 */
const breadcrumbFetchers = {
  credentialID: {
    queryKey: credentialQueryKeys.detail,
    fetch: (config: IQueryConfig, id: string) => getCredential(config, id),
  },
  mcpServerID: {
    queryKey: mcpServerQueryKeys.detail,
    fetch: (config: IQueryConfig, id: string) => getMcpServer(config, id),
  },
  modelConfigID: {
    queryKey: modelConfigQueryKeys.detail,
    fetch: (config: IQueryConfig, id: string) => getModelConfig(config, id),
  },
  promptID: {
    queryKey: systemPromptQueryKeys.detail,
    fetch: (config: IQueryConfig, id: string) => getSystemPrompt(config, id),
  },
  completionID: {
    queryKey: completionQueryKeys.detail,
    fetch: (config: IQueryConfig, id: string) => getCompletionRequest(config, id),
  },
  knowledgeDocumentID: {
    queryKey: knowledgeDocumentQueryKeys.detail,
    fetch: (config: IQueryConfig, id: string) => getKnowledgeDocument(config, id),
  },
}

export default function useBreadcrumb(config: BreadcrumbConfigType): BreadcrumbItemData[] {
  const { pathname, params, apiUrl, nodeEnv, token } = config

  const pathParts = pathname.split('/').filter(Boolean)

  const queriesConfig = pathParts
    .map((part) => {
      const matched = Object.entries(params).find(([, value]) => value === part)

      if (!matched) return null

      const [paramKey] = matched
      const id = part
      const resolver = breadcrumbFetchers[paramKey as keyof typeof breadcrumbFetchers]

      if (!resolver) return null

      return {
        paramKey,
        queryKey: resolver.queryKey(id) as QueryKey,
        queryFn: () => resolver.fetch({ apiUrl, token, nodeEnv }, id),
        enabled: Boolean(token),
        staleTime: 5 * 60 * 1000,
      }
    })
    .filter((q): q is BreadcrumbQueryConfig => q !== null)

  const queryResults = useQueries({
    queries: queriesConfig.map(({ paramKey, ...q }) => q),
  })

  /**
   * Build resource map WITH loading state
   */
  const resourceData = queriesConfig.reduce<Record<string, BreadcrumbResourceState>>(
    (acc, config, index) => {
      const result = queryResults[index]

      acc[config.paramKey] = {
        data: result?.data,
        isLoading: result?.isFetching ?? false,
        error: result?.error as Error | null,
      }

      return acc
    },
    {}
  )

  return generateBreadcrumbs({
    pathname,
    params,
    resourceData,
  })
}
