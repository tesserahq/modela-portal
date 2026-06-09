import { DataTable } from '@/components/data-table'
import { AppPreloader } from '@/components/loader/pre-loader'
import { Badge } from '@/modules/shadcn/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/modules/shadcn/ui/popover'
import {
  useDeleteModelConfig,
  useModelConfigs,
} from '@/resources/hooks/model-config/use-model-config'
import { ModelConfigType } from '@/resources/queries/model-config'
import { ensureCanonicalPagination } from '@/utils/helpers/pagination.helper'
import { Button } from '@shadcn/ui/button'
import { ColumnDef } from '@tanstack/react-table'
import { Edit, EllipsisVertical, EyeIcon, Trash2 } from 'lucide-react'
import { useMemo, useRef } from 'react'
import { Link, useLoaderData, useNavigate } from 'react-router'
import { ResourceID, useApp } from 'tessera-ui'
import { DateTime, EmptyContent, NewButton } from 'tessera-ui/components'
import DeleteConfirmation, {
  type DeleteConfirmationHandle,
} from 'tessera-ui/components/delete-confirmation'

export async function loader({ request }: { request: Request }) {
  const pagination = ensureCanonicalPagination(request, {
    defaultSize: 25,
    defaultPage: 1,
  })

  if (pagination instanceof Response) {
    return pagination
  }

  const apiUrl = process.env.API_URL
  const nodeEnv = process.env.NODE_ENV

  return { apiUrl, nodeEnv, pagination }
}

export default function ModelConfigsIndex() {
  const { apiUrl, nodeEnv, pagination } = useLoaderData<typeof loader>()
  const { token, isLoadingIdenties } = useApp()
  const navigate = useNavigate()
  const deleteConfirmationRef = useRef<DeleteConfirmationHandle>(null)

  const config = { apiUrl: apiUrl!, token: token!, nodeEnv: nodeEnv }

  const { data, isLoading, error } = useModelConfigs(
    config,
    { page: pagination.page, size: pagination.size },
    { enabled: !!token && !isLoadingIdenties }
  )

  const { mutateAsync: deleteModelConfig } = useDeleteModelConfig(config, {
    onSuccess: () => {
      deleteConfirmationRef.current?.close()
    },
    onError: () => {
      deleteConfirmationRef?.current?.updateConfig({ isLoading: false })
    },
  })

  const handleDelete = (data: ModelConfigType) => {
    deleteConfirmationRef.current?.open({
      title: 'Delete Model Config',
      description: `Are you sure you want to delete "${data.name}"? This action cannot be undone.`,
      onDelete: async () => {
        deleteConfirmationRef?.current?.updateConfig({ isLoading: true })
        await deleteModelConfig(data.id)
      },
    })
  }

  const columns = useMemo<ColumnDef<ModelConfigType>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        size: 200,
        cell: ({ row }) => {
          const { name } = row.original
          const isDefault = row.original.is_default
          return (
            <Link to={`/model-configs/${row.original.id}`} className="button-link">
              <div className="max-w-[200px] truncate" title={name}>
                <span>{name || '-'}</span>
                {isDefault && (
                  <Badge variant="outline" className="border ml-2 border-green-500 text-green-600">
                    <span className="text-xs">default</span>
                  </Badge>
                )}
              </div>
            </Link>
          )
        },
      },
      {
        accessorKey: 'slug',
        header: 'Slug',
        size: 180,
        cell: ({ row }) => {
          const value = row.original.slug
          return (
            <div className="max-w-[180px] truncate" title={value}>
              {value || '-'}
            </div>
          )
        },
      },
      {
        accessorKey: 'provider',
        header: 'Provider',
        size: 150,
        cell: ({ row }) => {
          const value = row.original.provider
          return (
            <div className="max-w-[150px] truncate" title={value}>
              {value || '-'}
            </div>
          )
        },
      },
      {
        accessorKey: 'model',
        header: 'Model',
        size: 180,
        cell: ({ row }) => {
          const value = row.original.model
          return (
            <div className="max-w-[180px] truncate" title={value}>
              {value || '-'}
            </div>
          )
        },
      },
      {
        accessorKey: 'config_type',
        header: 'Config Type',
        size: 120,
        cell: ({ row }) => row.original.config_type || '-',
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        size: 200,
        cell: ({ row }) => {
          const date = row.getValue('created_at') as string
          return <DateTime date={date} formatStr="dd/MM/yyyy HH:mm" />
        },
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated At',
        size: 200,
        cell: ({ row }) => {
          const date = row.getValue('updated_at') as string
          return <DateTime date={date} formatStr="dd/MM/yyyy HH:mm" />
        },
      },
      {
        accessorKey: 'id',
        header: 'ID',
        size: 150,
        cell: ({ row }) => <ResourceID value={row.original.id} />,
      },
      {
        id: 'actions',
        header: '',
        size: 20,
        cell: ({ row }) => {
          const config = row.original
          return (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="px-0 hover:bg-transparent"
                  aria-label="Open actions"
                  tabIndex={0}>
                  <EllipsisVertical size={18} />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" side="left" className="w-40 p-2">
                <Button
                  variant="ghost"
                  className="flex w-full justify-start gap-2"
                  onClick={() => navigate(`/model-configs/${config.id}`)}>
                  <EyeIcon size={18} />
                  <span>Overview</span>
                </Button>
                <Button
                  variant="ghost"
                  className="flex w-full justify-start gap-2"
                  onClick={() => navigate(`/model-configs/${config.id}/edit`)}
                  aria-label="Edit model config"
                  tabIndex={0}>
                  <Edit size={18} />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  className="hover:bg-destructive hover:text-destructive-foreground flex w-full
                    justify-start gap-2"
                  onClick={() => handleDelete(config)}
                  aria-label="Delete model config"
                  tabIndex={0}>
                  <Trash2 size={18} />
                  <span>Delete</span>
                </Button>
              </PopoverContent>
            </Popover>
          )
        },
      },
    ],
    [navigate]
  )

  if (isLoading || isLoadingIdenties) {
    return <AppPreloader />
  }

  if (error) {
    return (
      <EmptyContent
        image="/images/error.png"
        title="Failed to get model config"
        description={error.message}
      />
    )
  }

  if (data?.total === 0) {
    return (
      <EmptyContent
        image="/images/empty-data.png"
        title="No model configs found"
        description="Get started by creating first config.">
        <Button onClick={() => navigate('/model-configs/new')} variant="black">
          Start Creating
        </Button>
      </EmptyContent>
    )
  }

  const meta = data
    ? {
        page: data.page,
        pages: data.pages,
        size: data.size,
        total: data.total,
      }
    : undefined

  return (
    <div className="h-full page-content">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="page-title">Model Configs</h1>
        <NewButton
          label="New Credential"
          onClick={() => navigate('/model-configs/new')}
          disabled={isLoading}
        />
      </div>

      <DataTable columns={columns} data={data?.items || []} meta={meta} isLoading={isLoading} />

      <DeleteConfirmation ref={deleteConfirmationRef} />
    </div>
  )
}
