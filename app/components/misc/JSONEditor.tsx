import { Button } from '@/modules/shadcn/ui/button'
import { useRef, useState, useCallback } from 'react'

type ValidationState = 'empty' | 'valid' | 'invalid'

interface JsonEditorProps {
  value: string
  onChange?: (value: string) => void
  onValidChange?: (parsed: Record<string, unknown>) => void
  label?: string
  minHeight?: number
}

export function JsonEditor({
  value,
  onChange,
  onValidChange,
  label = 'JSON',
  minHeight = 240,
}: JsonEditorProps) {
  const taRef = useRef<HTMLTextAreaElement>(null)
  const linesRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<ValidationState>('empty')
  const [error, setError] = useState<string | null>(null)
  const [errorLine, setErrorLine] = useState(-1)
  const [copied, setCopied] = useState(false)

  const getLineFromError = (msg: string): number => {
    const posMatch = msg.match(/position (\d+)/i)
    if (posMatch && taRef.current) {
      const pos = parseInt(posMatch[1])
      return taRef.current.value.substring(0, pos).split('\n').length
    }
    const lineMatch = msg.match(/line (\d+)/i)
    return lineMatch ? parseInt(lineMatch[1]) : -1
  }

  const validate = useCallback(
    (val: string) => {
      if (!val.trim()) {
        setStatus('empty')
        setError(null)
        setErrorLine(-1)
        return
      }
      try {
        const parsed = JSON.parse(val)
        setStatus('valid')
        setError(null)
        setErrorLine(-1)
        onValidChange?.(parsed) // ← only fires on valid JSON
      } catch (e) {
        const msg = (e as Error).message
        const ln = getLineFromError(msg)
        setStatus('invalid')
        setError(ln > 0 ? `line ${ln}: ${msg}` : msg)
        setErrorLine(ln)
      }
    },
    [onValidChange]
  )

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value)
    validate(e.target.value)
  }

  const handleScroll = () => {
    if (linesRef.current && taRef.current) {
      linesRef.current.scrollTop = taRef.current.scrollTop
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

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  const lineCount = (value || '').split('\n').length
  const hasContent = value.trim().length > 0

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-background">
      {/* toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-muted border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </span>
          {status === 'valid' && (
            <span className="text-xs text-green-600 flex items-center gap-1">✓ valid JSON</span>
          )}
          {status === 'invalid' && (
            <span className="text-xs text-destructive flex items-center gap-1">✕ invalid</span>
          )}
          {status === 'empty' && <span className="text-xs text-muted-foreground">empty</span>}
        </div>
        <div className="flex gap-1">
          {/* <Button
            variant={'outline'}
            size={'sm'}
            onClick={handleCopy}
            disabled={!hasContent}
            className="...">
            {copied ? 'copied' : 'copy'}
          </Button>
          <Button
            variant={'outline'}
            size={'sm'}
            onClick={() => {
              onChange?.('')
              validate('')
            }}
            disabled={!hasContent}
            className="...">
            clear
          </Button> */}
          <Button
            variant={'outline'}
            size={'sm'}
            onClick={handleFormat}
            disabled={!hasContent}
            type="button">
            format
          </Button>
        </div>
      </div>

      {/* editor */}
      <div className="flex" style={{ minHeight }}>
        <div
          ref={linesRef}
          className="py-3 bg-muted border-r border-border overflow-hidden select-none min-w-[40px]">
          {Array.from({ length: lineCount }, (_, i) => (
            <span
              key={i}
              className={`block text-right px-2.5 font-mono text-xs leading-relaxed ${
                i + 1 === errorLine ? 'text-destructive font-medium' : 'text-muted-foreground'
              }`}>
              {i + 1}
            </span>
          ))}
        </div>
        <textarea
          ref={taRef}
          value={value}
          onChange={handleChange}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="flex-1 p-3 font-mono text-sm leading-relaxed bg-transparent outline-none
            resize-y"
          style={{ minHeight }}
          placeholder={'{\n  "type": "object",\n  "properties": {}\n}'}
        />
      </div>

      {/* error bar */}
      {error && (
        <div
          className="px-3 py-2 text-xs font-mono text-destructive bg-destructive/10 border-t
            border-destructive/20">
          {error}
        </div>
      )}
    </div>
  )
}
