import { Clipboard, ClipboardCheck, Trash2, Wand2 } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

type JsonValue = string | number | boolean | null | JsonObject | JsonArray
type JsonObject = { [key: string]: JsonValue }
type JsonArray = JsonValue[]

type ValidationState = 'empty' | 'valid' | 'invalid'

interface JsonEditorProps {
  value: string
  onChange?: (value: string) => void
  onValidChange?: (parsed: JsonValue) => void
  onClear?: () => void
  label?: string
  minHeight?: number
  readOnly?: boolean
}

export function JsonEditor({
  value,
  onChange,
  onValidChange,
  onClear,
  label = 'JSON',
  minHeight = 240,
  readOnly = false,
}: JsonEditorProps) {
  const taRef = useRef<HTMLTextAreaElement>(null)
  const linesRef = useRef<HTMLDivElement>(null)
  const highlightRef = useRef<HTMLPreElement>(null)

  const [status, setStatus] = useState<ValidationState>('empty')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [errorLine, setErrorLine] = useState(-1)
  const [copied, setCopied] = useState(false)

  const getLineFromError = (msg: string, val: string): number => {
    const posMatch = msg.match(/position (\d+)/i)
    if (posMatch) {
      return val.substring(0, parseInt(posMatch[1])).split('\n').length
    }
    const lineMatch = msg.match(/line (\d+)/i)
    return lineMatch ? parseInt(lineMatch[1]) : -1
  }

  const tokenize = (jsonString: string) => {
    const parts: Array<{ text: string; className: string }> = []
    let lastIndex = 0
    const regex =
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g
    let match
    while ((match = regex.exec(jsonString)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ text: jsonString.slice(lastIndex, match.index), className: 'text-foreground' })
      }
      let className = 'text-blue-600 dark:text-blue-400'
      if (/^"/.test(match[0])) {
        className = /:$/.test(match[0])
          ? 'text-purple-600 dark:text-purple-400'
          : 'text-green-600 dark:text-green-400'
      } else if (/true|false/.test(match[0])) {
        className = 'text-orange-500 dark:text-orange-400'
      } else if (/null/.test(match[0])) {
        className = 'text-muted-foreground'
      }
      parts.push({ text: match[0], className })
      lastIndex = regex.lastIndex
    }
    if (lastIndex < jsonString.length) {
      parts.push({ text: jsonString.slice(lastIndex), className: 'text-foreground' })
    }
    return parts
  }

  const validate = useCallback(
    (val: string) => {
      if (!val.trim()) {
        setStatus('empty')
        setErrorMsg(null)
        setErrorLine(-1)
        return
      }
      try {
        const parsed = JSON.parse(val)
        setStatus('valid')
        setErrorMsg(null)
        setErrorLine(-1)
        onValidChange?.(parsed)
      } catch (e) {
        const msg = (e as Error).message
        const ln = getLineFromError(msg, val)
        setStatus('invalid')
        setErrorMsg(ln > 0 ? `line ${ln}: ${msg}` : msg)
        setErrorLine(ln)
      }
    },
    [onValidChange]
  )

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value)
    validate(e.target.value)
  }

  const syncScroll = () => {
    if (!taRef.current) return
    const { scrollTop, scrollLeft } = taRef.current
    if (linesRef.current) linesRef.current.scrollTop = scrollTop
    if (highlightRef.current) {
      highlightRef.current.scrollTop = scrollTop
      highlightRef.current.scrollLeft = scrollLeft
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = taRef.current!
      const s = ta.selectionStart
      const end = ta.selectionEnd
      const next = value.substring(0, s) + '  ' + value.substring(end)
      onChange?.(next)
      validate(next)
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = s + 2
      })
    }
  }

  const handleFormat = () => {
    try {
      const formatted = JSON.stringify(JSON.parse(value), null, 2)
      onChange?.(formatted)
      validate(formatted)
    } catch (_) {}
  }

  const handleClear = () => {
    onChange?.('')
    validate('')
    onClear?.()
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const lineCount = (value || '').split('\n').length
  const hasContent = value.trim().length > 0
  const tokens = status !== 'invalid' && hasContent ? tokenize(value) : null

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border">
      {/* toolbar */}
      <div
        className="flex items-center justify-between border-b border-border bg-muted/40 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
          {status === 'valid' && (
            <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              valid JSON
            </span>
          )}
          {status === 'invalid' && (
            <span className="flex items-center gap-1 text-xs text-destructive">invalid</span>
          )}
          {status === 'empty' && <span className="text-xs text-muted-foreground">empty</span>}
        </div>
        {!readOnly && (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!hasContent}
              className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs
                text-muted-foreground transition-colors hover:bg-muted hover:text-foreground
                disabled:opacity-40">
              {copied ? <ClipboardCheck size={12} /> : <Clipboard size={12} />}
              {copied ? 'copied' : 'copy'}
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={!hasContent}
              className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs
                text-muted-foreground transition-colors hover:bg-muted hover:text-foreground
                disabled:opacity-40">
              <Trash2 size={12} />
              clear
            </button>
            <button
              type="button"
              onClick={handleFormat}
              disabled={!hasContent || status === 'invalid'}
              className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs
                text-muted-foreground transition-colors hover:bg-muted hover:text-foreground
                disabled:opacity-40">
              <Wand2 size={12} />
              format
            </button>
          </div>
        )}
      </div>

      {/* editor */}
      <div className="flex" style={{ minHeight }}>
        {/* line numbers */}
        <div
          ref={linesRef}
          className="select-none overflow-hidden border-r border-border bg-muted/20 py-2 text-right"
          style={{ minWidth: 44 }}>
          {Array.from({ length: lineCount }, (_, i) => (
            <div
              key={i}
              className={`px-3 font-mono text-xs leading-6 ${
                i + 1 === errorLine ? 'text-destructive font-medium' : 'text-muted-foreground'
              }`}>
              {i + 1}
            </div>
          ))}
        </div>

        {/* overlay + textarea */}
        <div className="relative flex-1 overflow-auto">
          {/* syntax highlight layer */}
          <pre
            ref={highlightRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap
              wrap-break-words px-3 py-2 font-mono text-sm leading-6">
            {tokens ? (
              tokens.map((part, i) => (
                <span key={i} className={part.className}>
                  {part.text}
                </span>
              ))
            ) : (
              <span className="text-foreground">{value}</span>
            )}
            {/* trailing newline to keep heights in sync */}
            {'\n'}
          </pre>

          {/* editable textarea — transparent text so highlight layer shows through */}
          <textarea
            ref={taRef}
            value={value}
            onChange={handleChange}
            onScroll={syncScroll}
            onKeyDown={handleKeyDown}
            readOnly={readOnly}
            spellCheck={false}
            // style={{ minHeight, tabSize: 2, caretColor: 'var(--color-foreground)' }}
            className="absolute inset-0 h-full w-full resize-none bg-transparent px-3 py-2 font-mono
              text-sm leading-6 text-foreground outline-none selection:bg-primary/20"
            placeholder="{}"
          />
        </div>
      </div>

      {/* error bar */}
      {errorMsg && (
        <div
          className="flex items-center gap-2 border-t border-destructive/20 bg-destructive/10 px-3
            py-2 font-mono text-xs text-destructive">
          {errorMsg}
        </div>
      )}
    </div>
  )
}
