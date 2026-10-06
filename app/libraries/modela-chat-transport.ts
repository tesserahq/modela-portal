import type { ChatTransport, UIMessage, UIMessageChunk } from 'ai'
import { type ModelaChatData, type ModelaEvent, modelaEventSchema } from './modela-events'

export type ModelaUIMessage = UIMessage<unknown, ModelaChatData>

export interface ModelaChatTransportOptions {
  /** Modela API base URL. */
  apiUrl: string
  /** Bearer token for the current user (Tessera JWT). */
  token: string
}

/**
 * ChatTransport that talks directly to Modela's POST /chat/completions.
 * Modela returns OpenAI-compatible SSE events, which are converted into
 * the UIMessageChunk events that useChat expects.
 */
export class ModelaChatTransport implements ChatTransport<ModelaUIMessage> {
  private apiUrl: string
  private token: string

  constructor(options: ModelaChatTransportOptions) {
    this.apiUrl = options.apiUrl.replace(/\/$/, '')
    this.token = options.token
  }

  async sendMessages(
    options: Parameters<ChatTransport<ModelaUIMessage>['sendMessages']>[0]
  ): Promise<ReadableStream<UIMessageChunk<unknown, ModelaChatData>>> {
    const { messages, abortSignal } = options

    const openAiMessages = messages
      .filter((message) => message.role === 'user' || message.role === 'assistant')
      .map((message) => ({
        role: message.role,
        content: message.parts
          .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
          .map((part) => part.text)
          .join(''),
      }))
      .filter((message) => message.content.length > 0)

    const response = await fetch(`${this.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        messages: openAiMessages,
        stream: true,
        include: ['events'],
      }),
      signal: abortSignal,
    })

    if (!response.ok || !response.body) {
      const detail = await response.text().catch(() => '')
      throw new Error(`Modela chat request failed: ${response.status} ${detail}`)
    }

    return modelaSseToUIMessageChunks(response.body)
  }

  async reconnectToStream(): Promise<ReadableStream<UIMessageChunk> | null> {
    // Modela does not support resuming an in-flight stream after reload.
    return null
  }
}

/** Parses Modela's OpenAI-compatible SSE body into UIMessageChunk events. */
function modelaSseToUIMessageChunks(
  body: ReadableStream<Uint8Array>
): ReadableStream<UIMessageChunk<unknown, ModelaChatData>> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let textPartId: string | null = null
  let started = false
  let finished = false

  const finish = (
    controller: ReadableStreamDefaultController<UIMessageChunk<unknown, ModelaChatData>>
  ) => {
    if (finished) return
    finished = true
    if (textPartId) {
      controller.enqueue({ type: 'text-end', id: textPartId })
      textPartId = null
    }
    controller.enqueue({ type: 'finish' })
    controller.close()
  }

  return new ReadableStream<UIMessageChunk<unknown, ModelaChatData>>({
    async pull(controller) {
      if (finished) return

      const { done, value } = await reader.read()
      if (done) {
        finish(controller)
        return
      }

      buffer += decoder.decode(value, { stream: true })
      const frames = buffer.split('\n\n')
      buffer = frames.pop() ?? ''

      for (const frame of frames) {
        const line = frame.trim()
        if (!line.startsWith('data:')) continue
        const data = line.slice('data:'.length).trim()

        if (data === '[DONE]') {
          finish(controller)
          return
        }

        let chunk: {
          choices?: { delta?: { role?: string; content?: string }; finish_reason?: string | null }[]
          extensions?: { event?: unknown }
        }
        try {
          chunk = JSON.parse(data)
        } catch {
          controller.enqueue({ type: 'error', errorText: `Malformed chunk: ${data}` })
          continue
        }

        if (!started) {
          controller.enqueue({ type: 'start' })
          started = true
        }

        if (chunk.extensions?.event !== undefined) {
          const parsedEvent = modelaEventSchema.safeParse(chunk.extensions.event)
          if (!parsedEvent.success) {
            controller.enqueue({
              type: 'error',
              errorText: 'Modela returned an invalid domain event.',
            })
            continue
          }
          controller.enqueue(toEventChunk(parsedEvent.data))
        }

        const delta = chunk.choices?.[0]?.delta
        if (delta?.content) {
          if (!textPartId) {
            textPartId = crypto.randomUUID()
            controller.enqueue({ type: 'text-start', id: textPartId })
          }
          controller.enqueue({ type: 'text-delta', id: textPartId, delta: delta.content })
        }
      }
    },
    cancel() {
      reader.cancel()
    },
  })
}

function toEventChunk(event: ModelaEvent): UIMessageChunk<unknown, ModelaChatData> {
  return {
    type: 'data-event',
    id: event.id,
    data: event,
  }
}
