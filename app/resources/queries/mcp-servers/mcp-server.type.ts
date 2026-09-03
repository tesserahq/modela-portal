/**
 * MCP server connectivity status (optional - API may provide or UI can derive)
 */
export type McpServerStatus = 'connected' | 'unreachable' | 'refreshing' | 'unknown'

/**
 * MCP server type (list/detail item from API)
 */
export type McpServerType = {
  id: string
  server_id: string
  name: string
  url: string
  credential_id: string
  tool_prefix: string
  tool_cache_ttl_seconds: number
  enabled: boolean
  extended_info?: Record<string, unknown>
  created_at: string
  updated_at: string
  /** Optional status from API or set by UI (e.g. when refreshing or after connection errors) */
  status?: McpServerStatus
}

/**
 * Create MCP server data (POST body)
 */
export type CreateMcpServerData = {
  server_id: string
  name: string
  url: string
  credential_id: string
  tool_prefix?: string
  tool_cache_ttl_seconds?: number
  enabled: boolean
  extended_info?: Record<string, unknown>
}

/**
 * Update MCP server data (PUT body, all fields optional)
 */
export type UpdateMcpServerData = Partial<CreateMcpServerData>

/**
 * MCP server form data (for form submission)
 */
export type McpServerFormData = CreateMcpServerData

/**
 * A single tool in an MCP server's catalog (GET /mcp-servers/{id}/tools item)
 */
export type McpCatalogTool = {
  qualified_name: string
  original_name: string
  description: string | null
  input_schema: Record<string, unknown>
  server_id: string
}

/**
 * Response for GET /mcp-servers/{id}/tools
 */
export type McpServerToolsResponse = {
  server_id: string
  tools: McpCatalogTool[]
}
