import { useFormContext } from '@/components/form'
import { Button } from '@shadcn/ui/button'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { JsonEditor } from '../misc/JSONEditor'

interface FormSchemaMapProps {
  field: string
  label: string
  required?: boolean
  description?: string
  useJsonEditor?: boolean
}

export function FormSchemaMap({
  field,
  label,
  required,
  description,
  useJsonEditor = false,
}: FormSchemaMapProps) {
  const { form } = useFormContext()
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('') // only used when !useJsonEditor
  const [keyError, setKeyError] = useState<string | null>(null)
  const [entryValues, setEntryValues] = useState<Record<string, string>>({}) // only used when useJsonEditor

  const formValue: Record<string, unknown> = form.watch(field) ?? {}
  const entries = Object.keys(formValue)

  const handleAdd = () => {
    const trimmedKey = newKey.trim()
    const trimmedValue = newValue.trim()

    if (!trimmedKey) {
      setKeyError('Key cannot be empty')
      return
    }
    if (trimmedKey in formValue) {
      setKeyError('Key already exists')
      return
    }
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(trimmedKey)) {
      setKeyError('Key must be a valid identifier')
      return
    }

    if (useJsonEditor) {
      form.setValue(field, { ...formValue, [trimmedKey]: {} }, { shouldValidate: true })
      setEntryValues((prev) => ({ ...prev, [trimmedKey]: '{}' }))
    } else {
      form.setValue(field, { ...formValue, [trimmedKey]: trimmedValue }, { shouldValidate: true })
    }

    setNewKey('')
    setNewValue('')
    setKeyError(null)
  }

  const handleRemove = (key: string) => {
    const next = { ...formValue }
    delete next[key]
    form.setValue(field, next, { shouldValidate: true })

    if (useJsonEditor) {
      setEntryValues((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const handlePlainValueChange = (key: string, val: string) => {
    form.setValue(field, { ...formValue, [key]: val }, { shouldValidate: true })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      </div>

      {description && <p className="text-xs text-muted-foreground">{description}</p>}

      {/* existing entries */}
      {entries.map((key) =>
        useJsonEditor ? (
          <div key={key} className="flex flex-col gap-1.5 rounded-md border border-border p-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono font-medium">{key}</span>
              <button
                type="button"
                onClick={() => handleRemove(key)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                aria-label={`Remove ${key}`}>
                <Trash2 size={13} />
              </button>
            </div>
            <JsonEditor
              value={entryValues[key] ?? '{}'}
              onChange={(raw) => setEntryValues((prev) => ({ ...prev, [key]: raw }))}
              onValidChange={(parsed) =>
                form.setValue(field, { ...formValue, [key]: parsed }, { shouldValidate: true })
              }
              minHeight={120}
            />
          </div>
        ) : (
          <div key={key} className="flex items-center gap-2">
            <input
              value={key}
              readOnly
              className="h-9 w-2/5 rounded-md border border-input bg-muted px-3 text-sm font-mono
                text-muted-foreground"
            />
            <span className="text-muted-foreground text-sm">:</span>
            <input
              value={formValue[key] as string}
              onChange={(e) => handlePlainValueChange(key, e.target.value)}
              placeholder="Value"
              className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm
                font-mono focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <button
              type="button"
              onClick={() => handleRemove(key)}
              className="text-muted-foreground hover:text-destructive transition-colors"
              aria-label={`Remove ${key}`}>
              <Trash2 size={13} />
            </button>
          </div>
        )
      )}

      {/* add row */}
      <div className="flex gap-2">
        <input
          value={newKey}
          onChange={(e) => {
            setNewKey(e.target.value)
            setKeyError(null)
          }}
          onKeyDown={handleKeyDown}
          placeholder="Property name"
          className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm font-mono
            placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        {!useJsonEditor && (
          <input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Value"
            className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm
              font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1
              focus:ring-ring"
          />
        )}
        <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
          Add
        </Button>
      </div>

      {keyError && <p className="text-xs text-destructive">{keyError}</p>}
    </div>
  )
}
