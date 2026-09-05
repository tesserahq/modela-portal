import type { UIMessage, UIMessageChunk } from 'ai'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ModelaChatTransport } from './modela-chat-transport'

const encoder = new TextEncoder()

function sseResponse(frames: string[]) {
  return new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        frames.forEach((frame) => controller.enqueue(encoder.encode(frame)))
        controller.close()
      },
    }),
    { status: 200, headers: { 'Content-Type': 'text/event-stream' } }
  )
}

async function readChunks(stream: ReadableStream<UIMessageChunk>) {
  const chunks: UIMessageChunk[] = []
  const reader = stream.getReader()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }
  return chunks
}

afterEach(() => vi.unstubAllGlobals())

describe('ModelaChatTransport', () => {
  it('posts the full text transcript to Modela and converts its SSE response', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        sseResponse([
          'data: {"choices":[{"delta":{"role":"assistant","content":"Hello"}}]}\n\n',
          'data: {"choices":[{"delta":{"content":" there"}}]}\n\n',
          'data: [DONE]\n\n',
        ])
      )
    vi.stubGlobal('fetch', fetchMock)

    const messages: UIMessage[] = [
      { id: 'user-1', role: 'user', parts: [{ type: 'text', text: 'Hi' }] },
      { id: 'assistant-1', role: 'assistant', parts: [{ type: 'text', text: 'Hello' }] },
      { id: 'user-2', role: 'user', parts: [{ type: 'text', text: 'How are you?' }] },
    ]
    const transport = new ModelaChatTransport({
      apiUrl: 'https://modela.example/api/',
      token: 'access-token',
    })

    const stream = await transport.sendMessages({
      trigger: 'submit-message',
      chatId: 'chat-1',
      messageId: undefined,
      messages,
      abortSignal: undefined,
    })
    const chunks = await readChunks(stream)

    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://modela.example/api/chat/completions')
    expect(init.headers).toEqual({
      'Content-Type': 'application/json',
      Authorization: 'Bearer access-token',
    })
    expect(JSON.parse(init.body)).toEqual({
      messages: [
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello' },
        { role: 'user', content: 'How are you?' },
      ],
      stream: true,
    })
    expect(chunks.map((chunk) => chunk.type)).toEqual([
      'start',
      'text-start',
      'text-delta',
      'text-delta',
      'text-end',
      'finish',
    ])
    expect(
      chunks.filter((chunk) => chunk.type === 'text-delta').map((chunk) => chunk.delta)
    ).toEqual(['Hello', ' there'])
  })

  it('includes Modela response details in request errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('No default config', { status: 404 }))
    )
    const transport = new ModelaChatTransport({
      apiUrl: 'https://modela.example/api',
      token: 'access-token',
    })

    await expect(
      transport.sendMessages({
        trigger: 'submit-message',
        chatId: 'chat-1',
        messageId: undefined,
        messages: [{ id: 'user-1', role: 'user', parts: [{ type: 'text', text: 'Hi' }] }],
        abortSignal: undefined,
      })
    ).rejects.toThrow('Modela chat request failed: 404 No default config')
  })
})
