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
import { useChatCompletion } from '@/resources/hooks/completion/use-completion'
import { IQueryConfig } from '@/resources/queries'
import type { ChatCompletionResponse, ChatMessage } from '@/resources/queries/completion'
import { useEffect, useMemo, useState } from 'react'
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
}

export function TestConfigDialog({ open, onOpenChange, config, slug }: TestConfigDialogProps) {
  const [model, setModel] = useState(slug)
  const [messagesText, setMessagesText] = useState(DEFAULT_MESSAGES)
  const [isValidJson, setIsValidJson] = useState(true)
  const [response, setResponse] = useState<ChatCompletionResponse | null>(null)

  // Keep the model in sync with the config slug
  useEffect(() => {
    setModel(slug)
  }, [slug])

  const { mutate: runCompletion, isPending } = useChatCompletion(config, {
    onSuccess: (res) => {
      setResponse(res)
      toast.success('Chat completion ran successfully', { duration: 3000 })
    },
  })

  const handleMessagesChange = (value: string) => {
    setMessagesText(value)
    try {
      const parsed = JSON.parse(value)
      setIsValidJson(Array.isArray(parsed))
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

  const canSend = !!model.trim() && isValidJson && !isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Test Model Config</DialogTitle>
          <DialogDescription>
            Send a chat completion request using this model config.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="test-model">
              Model
            </label>
            <Input id="test-model" value={model} readOnly placeholder="Model config slug" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Messages</label>
            <JsonEditor
              value={messagesText}
              onChange={handleMessagesChange}
              label="messages"
              minHeight={180}
            />
            {!isValidJson && (
              <p className="text-xs text-destructive">Messages must be a valid JSON array.</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={handleSend} disabled={!canSend} className="gap-2">
              {isPending ? 'Sending...' : 'Send'}
            </Button>
          </div>

          {response && (
            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Response</label>
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  {assistantContent ? (
                    <Markdown>{assistantContent}</Markdown>
                  ) : (
                    <p className="text-sm text-muted-foreground">No text content returned.</p>
                  )}
                </div>
              </div>

              {response.usage && (
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>Prompt tokens: {response.usage.prompt_tokens ?? '-'}</span>
                  <span>Completion tokens: {response.usage.completion_tokens ?? '-'}</span>
                  <span>Total tokens: {response.usage.total_tokens ?? '-'}</span>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Raw response</label>
                <JsonEditor value={JSON.stringify(response, null, 2)} readOnly minHeight={180} />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
