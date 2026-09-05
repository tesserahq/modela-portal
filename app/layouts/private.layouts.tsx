import { AppPreloader } from '@/components/loader/pre-loader'
import { useHandleApiError } from '@/hooks/useHandleApiError'
import { useRequestInfo } from '@/hooks/useRequestInfo'
import { ROUTE_PATH as THEME_PATH } from '@/routes/resources/update-theme'
import { SITE_CONFIG } from '@/utils/config/site.config'
import { useAuth0 } from '@auth0/auth0-react'
import {
  BrainCog,
  ChartBar,
  CloudCog,
  Database,
  KeyRound,
  PackageCheck,
  Server,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Outlet, useLoaderData, useLocation, useNavigate, useParams, useSubmit } from 'react-router'
import { Layout, MainItemProps, TesseraProvider } from 'tessera-ui'

export function loader() {
  const identiesApiUrl = process.env.IDENTIES_API_URL
  return {
    identiesApiUrl,
  }
}

export default function PrivateLayout() {
  const { identiesApiUrl } = useLoaderData<typeof loader>()
  const { isLoading, isAuthenticated, getAccessTokenSilently } = useAuth0()
  const [token, setToken] = useState<string>('')
  const handleApiError = useHandleApiError()
  const requestInfo = useRequestInfo()
  const submit = useSubmit()
  const params = useParams()
  const navigate = useNavigate()
  const isEditPage = useLocation().pathname.includes('edit')
  const shouldCollapseSidebar =
    (Boolean(params['modelConfigID']) ||
      Boolean(params['promptID']) ||
      Boolean(params['credentialID']) ||
      Boolean(params['completionID']) ||
      Boolean(params['knowledgeDocumentID']) ||
      Boolean(params['mcpServerID'])) &&
    !isEditPage

  const onSetTheme = (theme: string) => {
    submit(
      { theme },
      {
        method: 'POST',
        action: THEME_PATH,
        navigate: false,
        fetcherKey: 'theme-fetcher',
      }
    )
  }
  const fetchToken = async () => {
    try {
      const token = await getAccessTokenSilently()
      setToken(token)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      handleApiError!(error)
    }
  }

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      fetchToken()
    }
  }, [isLoading, isAuthenticated])

  const menuItems: MainItemProps[] = [
    {
      title: 'Analytics',
      path: `/analytics`,
      icon: ChartBar,
    },
    {
      title: 'System Prompts',
      path: `/system-prompts`,
      icon: CloudCog,
    },
    {
      title: 'Credentials',
      path: `/credentials`,
      icon: KeyRound,
    },
    {
      title: 'MCP Servers',
      path: `/mcp-servers`,
      icon: Server,
    },
    {
      title: 'Knowledge Documents',
      path: `/knowledge-documents`,
      icon: Database,
    },
    {
      title: 'Model Configs',
      path: `/model-configs`,
      icon: BrainCog,
    },
    {
      title: 'Completions',
      path: `/completions`,
      icon: PackageCheck,
    },
  ]

  if (isLoading) {
    return <AppPreloader className="min-h-screen" />
  }

  return (
    <TesseraProvider identiesApiUrl={identiesApiUrl!} token={token}>
      <Layout.Main menuItems={menuItems} collapseSidebar={shouldCollapseSidebar}>
        <Layout.Header
          actionLogout={() => navigate('/logout')}
          actionProfile={() => {}}
          defaultLogo={'/images/logo.png'}
          onSetTheme={(theme) => onSetTheme(theme)}
          selectedTheme={requestInfo.userPrefs.theme || 'system'}
          title={SITE_CONFIG.siteTitle}
        />
        <Outlet />
      </Layout.Main>
    </TesseraProvider>
  )
}
