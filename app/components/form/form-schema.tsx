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
  useSingleInput?: boolean
}

export function FormSchemaMap({
  field,
  label,
  required,
  description,
  useJsonEditor = false,
  useSingleInput = false,
}: FormSchemaMapProps) {
  const { form } = useFormContext()

  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [keyError, setKeyError] = useState<string | null>(null)

  const [jsonValue, setJsonValue] = useState<string>(() => {
    const initial = form.getValues(field) ?? {}
    return JSON.stringify(initial, null, 2)
  })
  const formValue: Record<string, unknown> = form.watch(field) ?? {}
  const entries = Object.keys(formValue)

  const handleAdd = () => {
    let trimmedKey = newKey.trim()
    let trimmedValue = newValue.trim()

    if (useSingleInput) {
      const eqIndex = newKey.indexOf('=')
      if (eqIndex === -1) {
        setKeyError('Format must be key=value')
        return
      }
      trimmedKey = newKey.substring(0, eqIndex).trim()
      trimmedValue = newKey.substring(eqIndex + 1).trim()
    }

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

    form.setValue(field, { ...formValue, [trimmedKey]: trimmedValue }, { shouldValidate: true })

    setNewKey('')
    setNewValue('')
    setKeyError(null)
  }

  const handleRemove = (key: string) => {
    const next = { ...formValue }
    delete next[key]
    form.setValue(field, next, { shouldValidate: true })
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

  const inputClassName =
    'h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring'

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </label>
      </div>

      {description && <p className="text-xs text-muted-foreground">{description}</p>}

      {useJsonEditor ? (
        <JsonEditor
          value={jsonValue}
          onChange={setJsonValue}
          onValidChange={(parsed) => form.setValue(field, parsed, { shouldValidate: true })}
          minHeight={200}
          onClear={() => form.setValue(field, {}, { shouldValidate: true })}
        />
      ) : (
        <>
          {entries.map((key) => (
            <div key={key} className="flex items-center gap-2">
              <input
                value={key}
                readOnly
                className="h-9 w-2/5 rounded-md border border-input bg-muted px-3 text-sm font-mono
                  text-muted-foreground"
              />
              <span className="text-muted-foreground text-sm">=</span>
              <input
                value={formValue[key] as string}
                onChange={(e) => handlePlainValueChange(key, e.target.value)}
                placeholder="Value"
                className={inputClassName}
              />
              <button
                type="button"
                onClick={() => handleRemove(key)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                aria-label={`Remove ${key}`}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}

          <div className="flex gap-2">
            {useSingleInput ? (
              <input
                value={newKey}
                onChange={(e) => {
                  setNewKey(e.target.value)
                  setKeyError(null)
                }}
                onKeyDown={handleKeyDown}
                placeholder="key=value"
                className={inputClassName}
              />
            ) : (
              <>
                <input
                  value={newKey}
                  onChange={(e) => {
                    setNewKey(e.target.value)
                    setKeyError(null)
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Property name"
                  className={inputClassName}
                />
                <input
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Value"
                  className={inputClassName}
                />
              </>
            )}
            <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
              Add
            </Button>
          </div>

          {keyError && <p className="text-xs text-destructive">{keyError}</p>}
        </>
      )}
    </div>
  )
}
