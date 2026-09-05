import { type RouteConfig, index, layout, route } from '@react-router/dev/routes'

export default [
  // Theme
  route('/resources/update-theme', 'routes/resources/update-theme.ts'),

  // Home Route
  route('/', 'routes/index.tsx', { id: 'home' }),

  route('setup', 'routes/setup/index.tsx'),

  // Private Routes
  layout('layouts/private.layouts.tsx', [
    route('/knowledge-documents', 'routes/main/knowledge-documents/layout.tsx', [
      index('routes/main/knowledge-documents/index.tsx'),
      route('new', 'routes/main/knowledge-documents/new.tsx'),
      route(':knowledgeDocumentID/edit', 'routes/main/knowledge-documents/edit.tsx'),
      route(':knowledgeDocumentID', 'routes/main/knowledge-documents/details/layout.tsx', [
        index('routes/main/knowledge-documents/details/index.tsx'),
        route('overview', 'routes/main/knowledge-documents/details/overview.tsx'),
      ]),
    ]),
    route('/credentials', 'routes/main/credentials/layout.tsx', [
      index('routes/main/credentials/index.tsx'),
      route('new', 'routes/main/credentials/new.tsx'),
      route(':credentialID/edit', 'routes/main/credentials/edit.tsx'),
      route(':credentialID', 'routes/main/credentials/details/layout.tsx', [
        index('routes/main/credentials/details/index.tsx'),
        route('overview', 'routes/main/credentials/details/overview.tsx'),
      ]),
    ]),
    route('/mcp-servers', 'routes/main/mcp-servers/layout.tsx', [
      index('routes/main/mcp-servers/index.tsx'),
      route('new', 'routes/main/mcp-servers/new.tsx'),
      route(':mcpServerID/edit', 'routes/main/mcp-servers/edit.tsx'),
      route(':mcpServerID', 'routes/main/mcp-servers/details/layout.tsx', [
        index('routes/main/mcp-servers/details/index.tsx'),
        route('overview', 'routes/main/mcp-servers/details/overview.tsx'),
        route('tools', 'routes/main/mcp-servers/details/tools.tsx'),
      ]),
    ]),
    route('/model-configs', 'routes/main/model-configs/layout.tsx', [
      index('routes/main/model-configs/index.tsx'),
      route('new', 'routes/main/model-configs/new.tsx'),
      route(':modelConfigID/edit', 'routes/main/model-configs/edit.tsx'),
      route(':modelConfigID', 'routes/main/model-configs/details/layout.tsx', [
        index('routes/main/model-configs/details/index.tsx'),
        route('overview', 'routes/main/model-configs/details/overview.tsx'),
        route('mcp-servers', 'routes/main/model-configs/details/mcp-servers/index.tsx'),
        route('mcp-servers/new', 'routes/main/model-configs/details/mcp-servers/new.tsx'),
      ]),
    ]),

    route('/system-prompts', 'routes/main/system-prompts/layout.tsx', [
      index('routes/main/system-prompts/index.tsx'),
      route('new', 'routes/main/system-prompts/new.tsx'),
      route(':promptID/edit', 'routes/main/system-prompts/edit.tsx'),
      route(':promptID', 'routes/main/system-prompts/details/layout.tsx', [
        index('routes/main/system-prompts/details/index.tsx'),
        route('overview', 'routes/main/system-prompts/details/overview.tsx'),
        route('versions', 'routes/main/system-prompts/details/versions/index.tsx'),
        route('versions/new', 'routes/main/system-prompts/details/versions/new.tsx'),
      ]),
    ]),

    route('/completions', 'routes/main/completions/layout.tsx', [
      index('routes/main/completions/index.tsx'),
      route(':completionID', 'routes/main/completions/details/layout.tsx', [
        index('routes/main/completions/details/index.tsx'),
        route('overview', 'routes/main/completions/details/overview.tsx'),
      ]),
    ]),

    route('/chat', 'routes/main/chat/index.tsx'),

    route('/analytics', 'routes/main/analytics/index.tsx'),
  ]),

  // Access Denied
  route('access-denies', 'routes/access-denies.tsx'),

  // Logout Route
  route('logout', 'routes/logout.tsx', { id: 'logout' }),

  // Catch-all route for 404 errors - must be last
  route('*', 'routes/not-found.tsx'),
] as RouteConfig
