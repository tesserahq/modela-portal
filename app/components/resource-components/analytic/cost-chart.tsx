import { Bar, BarChart, XAxis, YAxis, Cell } from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/modules/shadcn/ui/chart'
import { AnalyticCostSummaryType } from '@/resources/queries/analytic'
import { formatCost } from './cost-utils'

const chartConfig = {
  total_cost_usd: {
    label: 'Cost (USD)',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig

interface CostChartProps {
  data: AnalyticCostSummaryType[]
}

export function CostChart({ data }: CostChartProps) {
  const chartData = data.map((item, index) => ({
    name: item.group_details
      ? `${item.group_details.first_name ?? ''} ${item.group_details.last_name ?? ''}`.trim()
      : (item.group_value ?? 'Unattributed'),
    total_cost_usd: item.total_cost_usd,
    fill: index === 0 ? 'hsl(var(--chart-1))' : 'hsl(var(--chart-2))',
  }))

  return (
    <ChartContainer config={chartConfig} className="max-h-[400px] w-full">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ left: 20, right: 40, top: 10, bottom: 10 }}>
        <XAxis
          type="number"
          tickFormatter={(value) => `$${value.toLocaleString()}`}
          fontSize={12}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={140}
          tickLine={false}
          axisLine={false}
          fontSize={12}
        />
        <ChartTooltip
          cursor={{ fill: 'hsl(var(--muted))' }}
          content={
            <ChartTooltipContent
              formatter={(value) => (
                <span className="font-mono font-medium">
                  {formatCost(value?.toString() ?? '0')}
                </span>
              )}
            />
          }
        />
        <Bar dataKey="total_cost_usd" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
