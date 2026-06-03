import { useSearchParams } from 'react-router'
import { useMemo } from 'react'
import { format, subDays } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { AnalyticCostGroupEnum, AnalyticCostSummaryType } from '@/resources/queries/analytic'
import { ToggleGroup, ToggleGroupItem } from '@/modules/shadcn/ui/toggle'
import { Card, CardContent, CardHeader, CardTitle } from '@/modules/shadcn/ui/card'
import { CostChart } from '@/components/resource-components/analytic'
import { Skeleton } from '@/modules/shadcn/ui/skeleton'
import { IQueryConfig } from '@/resources/queries'
import { CostTable } from './cost-table'
import { DateRangePicker } from './cost-date-range-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/modules/shadcn/ui/select'

type Props = {
  config: IQueryConfig
  data: AnalyticCostSummaryType[] | undefined
  isLoading: boolean
}

const GROUP_LABELS: Record<AnalyticCostGroupEnum, string> = {
  user: 'User',
  provider: 'Provider',
  model: 'Model',
  project_id: 'Project',
}

export function CostAnalyticsContent({ config, data, isLoading }: Props) {
  const [searchParams, setSearchParams] = useSearchParams()

  const groupBy = (searchParams.get('group_by') || 'user') as AnalyticCostGroupEnum
  const start_date = searchParams.get('start_date') || format(subDays(new Date(), 30), 'yyyy-MM-dd')
  const end_date = searchParams.get('end_date') || format(new Date(), 'yyyy-MM-dd')
  const limit = Number(searchParams.get('limit') || '10')

  const dateRange: DateRange = {
    from: new Date(start_date),
    to: new Date(end_date),
  }

  const handleGroupByChange = (v: string) => {
    const next = new URLSearchParams(searchParams)
    next.set('group_by', v)
    setSearchParams(next)
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    const next = new URLSearchParams(searchParams)
    if (range?.from) next.set('start_date', format(range.from, 'yyyy-MM-dd'))
    if (range?.to) next.set('end_date', format(range.to, 'yyyy-MM-dd'))
    setSearchParams(next)
  }

  const totalSpend = useMemo(
    () => data?.reduce((sum, item) => sum + parseFloat(item.total_cost_usd), 0) ?? 0,
    [data]
  )

  return (
    <div className="page-content h-full">
      <div className="mb-5">
        <h1 className="page-title">Cost analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Identify who or what is driving the most cost across your organization.
        </p>
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between">
          <ToggleGroup
            type="single"
            size="sm"
            value={groupBy}
            onValueChange={handleGroupByChange}
            className="p-1.5 bg-border">
            {Object.entries(GROUP_LABELS).map(([value, label]) => (
              <ToggleGroupItem key={value} value={value} size="sm">
                {label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>

          <div className="flex items-center gap-2">
            <DateRangePicker dateRange={dateRange} onDateRangeChange={handleDateRangeChange} />
            <Select
              value={String(limit)}
              onValueChange={(v) => {
                const next = new URLSearchParams(searchParams)
                next.set('limit', v)
                setSearchParams(next)
              }}>
              <SelectTrigger className="w-28 text-sm rounded-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 25, 50, 100].map((l) => (
                  <SelectItem key={l} value={String(l)}>
                    Top {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-flow-row gap-y-5 mb-10">
        <Card>
          <CardHeader>
            <CardTitle>Total spend</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-full" />
            ) : (
              <p className="text-3xl font-medium">
                $
                {totalSpend.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Cost by <span className="capitalize">{groupBy}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : data?.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No data matches the current filters
              </div>
            ) : (
              <CostChart data={data ?? []} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cost breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No data
              </div>
            ) : (
              <CostTable data={data} isLoading={isLoading} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
