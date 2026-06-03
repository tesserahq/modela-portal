import { DataTable } from '@/components/data-table'
import { AnalyticCostSummaryType } from '@/resources/queries/analytic'
import { ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'

type Props = {
  data: AnalyticCostSummaryType[] | undefined
  isLoading: boolean
}

export function CostTable({ data, isLoading }: Props) {
  const columns = useMemo<ColumnDef<AnalyticCostSummaryType>[]>(
    () => [
      {
        id: 'number',
        header: 'Rank',
        size: 20,
        cell: ({ row }) => <span className="text-muted-foreground">{row.index + 1}</span>,
      },
      {
        accessorKey: 'group',
        header: 'Group',
        size: 500,
        cell: ({ row }) => {
          const { group_value } = row.original
          return <div className="max-w-[200px] truncate">{group_value || 'Unattributed'}</div>
        },
      },
      {
        accessorKey: 'total_cost',
        header: 'Total Cost (USD)',
        meta: { headerClassName: 'text-right' },
        size: 100,
        cell: ({ row }) => {
          const { total_cost_usd } = row.original
          return (
            <div className="max-w-[200px] truncate text-right">
              $
              {Number(total_cost_usd).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          )
        },
      },
    ],
    [data]
  )

  return <DataTable columns={columns} data={data || []} isLoading={isLoading} fixed={false} />
}
