// CostAnalytics page
import { AppPreloader } from '@/components/loader/pre-loader'
import { EmptyContent } from 'tessera-ui/components'
import { useApp } from 'tessera-ui'
import { useLoaderData, useSearchParams } from 'react-router'
import { useMemo } from 'react'
import { format, subDays } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { AnalyticCostGroupEnum } from '@/resources/queries/analytic'
import { useAnalyticCosts } from '@/resources/hooks/analytic/use-analytic'
import { CostAnalyticsContent } from '@/components/resource-components/analytic'

export async function loader() {
  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV
  return { apiUrl, nodeEnv }
}

export default function CostAnalytics() {
  const { apiUrl, nodeEnv } = useLoaderData<typeof loader>()
  const { token, isLoadingIdenties } = useApp()
  const [searchParams] = useSearchParams()

  const group_by = (searchParams.get('group_by') || 'user') as AnalyticCostGroupEnum
  const start_date = searchParams.get('start_date') || format(subDays(new Date(), 30), 'yyyy-MM-dd')
  const end_date = searchParams.get('end_date') || format(new Date(), 'yyyy-MM-dd')

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv }

  const params = useMemo(
    () => ({ group_by, start_date, end_date }),
    [group_by, start_date, end_date]
  )

  const { data, isLoading, error, isFetching } = useAnalyticCosts(config, params, {
    enabled: !!token && !isLoadingIdenties,
  })

  if (isLoading || isLoadingIdenties) return <AppPreloader />

  if (error) {
    return (
      <EmptyContent
        image="/images/error.png"
        title="Failed to load analytics"
        description={error.message}
      />
    )
  }

  return <CostAnalyticsContent config={config} data={data} isLoading={isLoading || isFetching} />
}
