import React, { useState, useCallback } from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/modules/shadcn/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/modules/shadcn/ui/popover'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from '@shadcn/lib/utils'
import { Button } from '@/modules/shadcn/ui/button'
import { Input } from '@/modules/shadcn/ui/input'
import { useFormContext } from './form-context'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/modules/shadcn/ui/form'
import { ComboBoxProps } from 'tessera-ui'

// ─── Headless ComboBox (no form context) ─────────────────────────────────────
interface ComboBoxSelectProps<T> extends Omit<ComboBoxProps<T>, 'name' | 'error' | 'label'> {
  value: string
  onChange: (option: T | null) => void
  disabled?: boolean
  label?: string
  isLoading?: boolean
}

export function ComboBoxSelect<T>({
  value,
  onChange,
  options,
  getOptionId,
  getOptionLabel,
  getSearchValue,
  renderOption,
  required,
  placeholder = 'Search...',
  disabled = false,
  className,
  isLoading,
}: ComboBoxSelectProps<T>) {
  const [open, setOpen] = useState(false)

  const selectedOption = options.find((o) => getOptionId(o) === value)
  const displayValue = selectedOption ? getOptionLabel(selectedOption) : ''

  const handleSelect = useCallback(
    (selectedId: string) => {
      const option = options.find((o) => getOptionId(o) === selectedId)
      onChange(option ?? null)
      setOpen(false)
    },
    [onChange, options, getOptionId]
  )

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange(null)
    },
    [onChange]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <Input
            readOnly
            value={displayValue}
            placeholder={isLoading ? 'Loading...' : placeholder}
            disabled={disabled || isLoading}
            onClick={() => !disabled && setOpen(true)}
            className={cn('cursor-pointer pr-16', className)}
          />
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-x-1">
            {displayValue && !required && (
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={handleClear}
                className="h-6 w-6 hover:bg-transparent">
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
            <ChevronsUpDown
              className={cn(
                `text-muted-foreground h-4 w-4 transition-transform duration-200
                pointer-events-none`,
                open && 'rotate-180'
              )}
            />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0 shadow-card border rounded-sm"
        align="start"
        side="bottom"
        sideOffset={4}
        avoidCollisions
        collisionPadding={8}>
        <Command className="rounded-sm border-0">
          <CommandInput placeholder={placeholder} className="h-10 border-0" />
          <CommandList className="max-h-64 overflow-y-auto">
            <CommandEmpty className="py-6 text-center text-sm">No items found</CommandEmpty>
            <CommandGroup>
              {options.map((option: T) => {
                const id = getOptionId(option)
                const searchValue = getSearchValue ? getSearchValue(option) : getOptionLabel(option)
                return (
                  <CommandItem
                    key={id}
                    value={searchValue}
                    onSelect={() => handleSelect(id)}
                    className={cn(
                      'dark:hover:bg-navy-300/20 cursor-pointer text-base hover:bg-slate-300/20',
                      value === id && 'bg-accent'
                    )}>
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4 shrink-0',
                        value === id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {renderOption ? (
                      renderOption(option)
                    ) : (
                      <span className="capitalize">{getOptionLabel(option)}</span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// ─── Form-integrated ComboBox ─────────────────────────────────────────────────
interface FormComboBoxProps<T> extends Omit<
  ComboBoxProps<T>,
  'value' | 'onChange' | 'error' | 'name' | 'label'
> {
  field: string
  label?: string
  description?: string
  required?: boolean
  hideError?: boolean
  disabled?: boolean
  isLoading?: boolean
  onChange?: (option: T | null) => void
  rules?: {
    required?: boolean | string
    validate?: (value: unknown) => boolean | string | Promise<boolean | string>
  }
}

export function FormComboBox<T>({
  field,
  label,
  required,
  hideError = false,
  disabled,
  rules,
  isLoading,
  onChange,
  ...comboBoxProps
}: FormComboBoxProps<T>) {
  const { form } = useFormContext()

  return (
    <FormField
      control={form.control}
      name={field}
      rules={{
        ...rules,
        ...(required && {
          required: required === true ? 'This field is required' : required,
        }),
      }}
      render={({ field: fieldProps }) => (
        <FormItem>
          {label && (
            <FormLabel
              className={cn(
                'mb-0',
                required && 'after:text-destructive after:ml-0.5 after:content-["*"]'
              )}>
              {label}
            </FormLabel>
          )}
          <FormControl>
            <ComboBoxSelect
              {...comboBoxProps}
              value={fieldProps.value ?? null}
              onChange={(option) => {
                fieldProps.onChange(option ? comboBoxProps.getOptionId(option) : null)
                onChange?.(option)
              }}
              disabled={disabled}
              required={required}
              isLoading={isLoading}
            />
          </FormControl>
          {!hideError && <FormMessage />}
        </FormItem>
      )}
    />
  )
}
