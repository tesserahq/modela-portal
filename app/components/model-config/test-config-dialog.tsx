import { JsonEditor } from '@/components/misc/JSONEditor'
import Markdown from '@/components/makrdown/markdown'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/modules/shadcn/ui/dialog'
import { Button } from '@shadcn/ui/button'
import { Input } from '@shadcn/ui/input'
import { Textarea } from '@shadcn/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shadcn/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shadcn/ui/tabs'
import {
  useChatCompletion,
  useScanFile,
  useSummarize,
} from '@/resources/hooks/completion/use-completion'
import { IQueryConfig } from '@/resources/queries'
import type {
  ChatCompletionResponse,
  ChatMessage,
  FileRequest,
} from '@/resources/queries/completion'
import type { ModelConfigTypeName } from '@/resources/queries/model-config/model-config.type'
import { ReactNode, useMemo, useState } from 'react'
import { toast } from 'tessera-ui/components'

const DEFAULT_MESSAGES = JSON.stringify(
  [
    {
      role: 'user',
      content: 'Hello, what are you?',
    },
  ],
  null,
  2
)

const MIME_TYPES = [
  { value: 'application/pdf', label: 'PDF', extensions: ['pdf'] },
  { value: 'image/png', label: 'PNG image', extensions: ['png'] },
  { value: 'image/jpeg', label: 'JPEG image', extensions: ['jpg', 'jpeg'] },
  { value: 'image/webp', label: 'WebP image', extensions: ['webp'] },
  { value: 'image/gif', label: 'GIF image', extensions: ['gif'] },
  { value: 'text/plain', label: 'Plain text', extensions: ['txt'] },
] as const

const DESCRIPTIONS: Record<ModelConfigTypeName, string> = {
  chat: 'Send a chat completion request (POST /chat/completions) using this model config.',
  summary: 'Summarize text or a file (POST /summarize/text or /summarize/file).',
  scan: 'Extract structured data from a file using the output schema (POST /scan/file).',
  generation: 'Generation configs cannot be tested from here yet.',
  embedding: 'Embedding configs cannot be tested from here yet.',
}

function inferMimeType(url: string): string | null {
  const path = url.split(/[?#]/)[0] ?? ''
  const ext = path.split('.').pop()?.toLowerCase()
  if (!ext) return null
  const match = MIME_TYPES.find((m) => (m.extensions as readonly string[]).includes(ext))
  return match?.value ?? null
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

function getAssistantContent(response: ChatCompletionResponse): string {
  const message = response.choices?.[0]?.message
  if (!message) return ''
  const content = (message as { content?: unknown }).content
  return typeof content === 'string' ? content : ''
}

interface TestConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  config: IQueryConfig
  slug: string
  configType?: ModelConfigTypeName
  outputSchema?: Record<string, unknown> | null
}

export function TestConfigDialog({
  open,
  onOpenChange,
  config,
  slug,
  configType = 'chat',
  outputSchema,
}: TestConfigDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Test Model Config</DialogTitle>
          <DialogDescription>{DESCRIPTIONS[configType]}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <Field label="Model" htmlFor="test-model">
            <Input id="test-model" value={slug} readOnly placeholder="Model config slug" />
          </Field>

          {/* key on slug so per-type state resets when the config changes */}
          {configType === 'chat' && <ChatTest key={slug} config={config} model={slug} />}
          {configType === 'summary' && <SummaryTest key={slug} config={config} model={slug} />}
          {configType === 'scan' && (
            <ScanTest key={slug} config={config} model={slug} outputSchema={outputSchema} />
          )}
          {(configType === 'generation' || configType === 'embedding') && (
            <p
              className="rounded-lg border border-border bg-muted/20 p-4 text-sm
                text-muted-foreground">
              Modela does not expose an endpoint for testing <strong>{configType}</strong> configs.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* -------------------------------------------------------------------------- */
/*                                Shared pieces                               */
/* -------------------------------------------------------------------------- */

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  )
}

function SendButton({
  onClick,
  disabled,
  isPending,
}: {
  onClick: () => void
  disabled: boolean
  isPending: boolean
}) {
  return (
    <div className="flex justify-end gap-2">
      <Button onClick={onClick} disabled={disabled || isPending} className="gap-2">
        {isPending ? 'Sending...' : 'Send'}
      </Button>
    </div>
  )
}

function RawResponse({ value }: { value: unknown }) {
  return (
    <Field label="Raw response">
      <JsonEditor value={JSON.stringify(value, null, 2)} readOnly minHeight={180} />
    </Field>
  )
}

function useFileFields() {
  const [fileUrl, setFileUrl] = useState('')
  const [mimeType, setMimeType] = useState<string>('application/pdf')

  const onUrlChange = (value: string) => {
    setFileUrl(value)
    const inferred = inferMimeType(value)
    if (inferred) setMimeType(inferred)
  }

  const trimmed = fileUrl.trim()
  const isValid = isHttpsUrl(trimmed)
  const showError = trimmed.length > 0 && !isValid

  const fields = (
    <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
      <Field label="File URL" htmlFor="test-file-url">
        <Input
          id="test-file-url"
          value={fileUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://example.com/document.pdf"
        />
        {showError ? (
          <p className="text-xs text-destructive">Must be a public HTTPS URL.</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Modela fetches the file itself, so it must be publicly reachable over HTTPS.
          </p>
        )}
      </Field>
      <Field label="MIME type">
        <Select value={mimeType} onValueChange={setMimeType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MIME_TYPES.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
    </div>
  )

  return { fields, isValid, body: { file_url: trimmed, mime_type: mimeType } }
}

/* -------------------------------------------------------------------------- */
/*                                    Chat                                    */
/* -------------------------------------------------------------------------- */

function ChatTest({ config, model }: { config: IQueryConfig; model: string }) {
  const [messagesText, setMessagesText] = useState(DEFAULT_MESSAGES)
  const [isValidJson, setIsValidJson] = useState(true)
  const [response, setResponse] = useState<ChatCompletionResponse | null>(null)

  const { mutate: runCompletion, isPending } = useChatCompletion(config, {
    onSuccess: (res) => {
      setResponse(res)
      toast.success('Successfully tested model config', { duration: 3000 })
    },
  })

  const handleMessagesChange = (value: string) => {
    setMessagesText(value)
    try {
      setIsValidJson(Array.isArray(JSON.parse(value)))
    } catch {
      setIsValidJson(false)
    }
  }

  const handleSend = () => {
    let messages: ChatMessage[]
    try {
      messages = JSON.parse(messagesText)
    } catch {
      setIsValidJson(false)
      return
    }
    if (!Array.isArray(messages)) {
      setIsValidJson(false)
      return
    }
    setResponse(null)
    runCompletion({ model, messages })
  }

  const assistantContent = useMemo(
    () => (response ? getAssistantContent(response) : ''),
    [response]
  )

  return (
    <>
      <Field label="Messages">
        <JsonEditor
          value={messagesText}
          onChange={handleMessagesChange}
          label="messages"
          minHeight={180}
        />
        {!isValidJson && (
          <p className="text-xs text-destructive">Messages must be a valid JSON array.</p>
        )}
      </Field>

      <SendButton
        onClick={handleSend}
        disabled={!model.trim() || !isValidJson}
        isPending={isPending}
      />

      {response && (
        <div className="space-y-3 border-t border-border pt-4">
          <Field label="Response">
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              {assistantContent ? (
                <Markdown>{assistantContent}</Markdown>
              ) : (
                <p className="text-sm text-muted-foreground">No text content returned.</p>
              )}
            </div>
          </Field>

          {response.usage && (
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span>Prompt tokens: {response.usage.prompt_tokens ?? '-'}</span>
              <span>Completion tokens: {response.usage.completion_tokens ?? '-'}</span>
              <span>Total tokens: {response.usage.total_tokens ?? '-'}</span>
            </div>
          )}

          <RawResponse value={response} />
        </div>
      )}
    </>
  )
}

/* -------------------------------------------------------------------------- */
/*                                   Summary                                  */
/* -------------------------------------------------------------------------- */

function SummaryTest({ config, model }: { config: IQueryConfig; model: string }) {
  const [mode, setMode] = useState<'text' | 'file'>('text')
  const [content, setContent] = useState('')
  const file = useFileFields()

  const {
    mutate,
    data: response,
    isPending,
    reset,
  } = useSummarize(config, {
    onSuccess: () => toast.success('Successfully tested model config', { duration: 3000 }),
  })

  const canSend = !!model.trim() && (mode === 'text' ? !!content.trim() : file.isValid)

  const handleSend = () => {
    reset()
    if (mode === 'text') mutate({ model, content })
    else mutate({ model, ...file.body } satisfies FileRequest)
  }

  return (
    <>
      <Tabs value={mode} onValueChange={(v) => setMode(v as 'text' | 'file')}>
        <TabsList>
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="file">File URL</TabsTrigger>
        </TabsList>
        <TabsContent value="text" className="pt-3">
          <Field label="Content" htmlFor="test-summary-content">
            <Textarea
              id="test-summary-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste the text to summarize..."
              rows={8}
            />
          </Field>
        </TabsContent>
        <TabsContent value="file" className="pt-3">
          {file.fields}
        </TabsContent>
      </Tabs>

      <SendButton onClick={handleSend} disabled={!canSend} isPending={isPending} />

      {response && (
        <div className="space-y-3 border-t border-border pt-4">
          <Field label="Summary">
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              {response.summary ? (
                <Markdown>{response.summary}</Markdown>
              ) : (
                <p className="text-sm text-muted-foreground">No summary returned.</p>
              )}
            </div>
          </Field>
          <RawResponse value={response} />
        </div>
      )}
    </>
  )
}

/* -------------------------------------------------------------------------- */
/*                                    Scan                                    */
/* -------------------------------------------------------------------------- */

function ScanTest({
  config,
  model,
  outputSchema,
}: {
  config: IQueryConfig
  model: string
  outputSchema?: Record<string, unknown> | null
}) {
  const file = useFileFields()
  const hasSchema = !!outputSchema && Object.keys(outputSchema).length > 0

  const {
    mutate,
    data: response,
    isPending,
    reset,
  } = useScanFile(config, {
    onSuccess: () => toast.success('Successfully tested model config', { duration: 3000 }),
  })

  const handleSend = () => {
    reset()
    mutate({ model, ...file.body })
  }

  return (
    <>
      {!hasSchema && (
        <p
          className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm
            text-destructive">
          This config has no output schema. Scan requires one; set it on the config before testing.
        </p>
      )}

      {file.fields}

      <SendButton
        onClick={handleSend}
        disabled={!model.trim() || !file.isValid || !hasSchema}
        isPending={isPending}
      />

      {response && (
        <div className="space-y-3 border-t border-border pt-4">
          <Field label="Extracted data">
            <JsonEditor value={JSON.stringify(response.data, null, 2)} readOnly minHeight={180} />
          </Field>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>Request ID: {response.request_id}</span>
          </div>
        </div>
      )}
    </>
  )
}
