import { Form } from '@/components/form'
import { Button } from '@shadcn/ui/button'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { FormLayout } from '../form/form-layout'
import { useNavigate, useParams } from 'react-router'
import { IQueryConfig } from '@/resources/queries'
import {
  AttachModelConfigMCPServerData,
  ModelConfigMCPServerFormValue,
  modelConfigMCPServerSchema,
} from '@/resources/queries/model-config'
import { useMcpServers } from '@/resources/hooks/mcp-servers/use-mcp-server'
import { EmptyContent } from 'tessera-ui'
import { AppPreloader } from '../loader/pre-loader'

interface Props {
  config: IQueryConfig
  defaultValues: ModelConfigMCPServerFormValue
  onSubmit: (data: AttachModelConfigMCPServerData) => void | Promise<void>
  submitLabel?: string
}

export function ModelConfigMCPServerForm({
  defaultValues,
  onSubmit,
  submitLabel = 'Save',
  config,
}: Props) {
  const navigate = useNavigate()
  const params = useParams()
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const isEditMode = !!defaultValues?.server_id
  const title = isEditMode ? 'Edit Model Config Server MCP' : 'Attach MCP Server'

  const { data: mcpServers, isLoading } = useMcpServers(config, {
    page: 1,
    size: 100,
  })

  const handleSubmit = async (rawData: ModelConfigMCPServerFormValue) => {
    setIsSubmitting(true)
    try {
      const data = {
        server_id: rawData.server_id,
      }
      await onSubmit(data)
    } catch {
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <AppPreloader className="min-h-screen" />
  }

  if (mcpServers?.total === 0) {
    return (
      <EmptyContent
        image="/images/error.png"
        title="There is no MCP Server Available"
        description="To start attaching MCP Server to Model Config, Please start by registering MCP Server.">
        <Button onClick={() => navigate('/mcp-servers/new')} variant="black">
          Start Register
        </Button>
      </EmptyContent>
    )
  }

  return (
    <div className="pt-5">
      <Form
        schema={modelConfigMCPServerSchema}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        mode="onChange"
        reValidateMode="onChange">
        <FormLayout title={title}>
          <Form.ComboBox
            field="server_id"
            label="MCP Server"
            placeholder="Search available MCP Server..."
            options={mcpServers?.items ?? []}
            getOptionId={(p) => p.server_id}
            getOptionLabel={(p) => p.name}
            getSearchValue={(p) => `${p.name} ${p.id}`}
            renderOption={(p) => (
              <div className="flex flex-col">
                <span className="font-medium">{p.name}</span>
                <span className="text-muted-foreground text-xs">{p.server_id}</span>
              </div>
            )}
            isLoading={isLoading}
          />
          <Form.Input
            field="server_id"
            label="Server ID"
            placeholder="Select available MCP Server above"
            readOnly
            disabled
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/model-configs/${params.modelConfigID}/mcp-servers`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </FormLayout>
      </Form>
    </div>
  )
}
