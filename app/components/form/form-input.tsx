import { useFormContext } from './form-context'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/modules/shadcn/ui/form'
import { Input } from '@/modules/shadcn/ui/input'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/modules/shadcn/ui/input-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/modules/shadcn/ui/tooltip'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { CircleQuestionMark, X } from 'lucide-react'
import { ComponentProps } from 'react'
import { cn } from '@shadcn/lib/utils'

interface FormInputProps extends Omit<ComponentProps<typeof Input>, 'name'> {
  field: string
  label?: string
  description?: string
  required?: boolean
  hideError?: boolean
  rules?: {
    required?: boolean | string
    min?: number | { value: number; message: string }
    max?: number | { value: number; message: string }
    minLength?: number | { value: number; message: string }
    maxLength?: number | { value: number; message: string }
    pattern?: RegExp | { value: RegExp; message: string }
    validate?: (value: unknown) => boolean | string | Promise<boolean | string>
  }
  addon?: {
    icon: React.ReactNode
    position?: 'left' | 'right'
  }
  trailing?: {
    icon: React.ReactNode | string
    onClick: () => void
  }
}

export const FormInput = ({
  field,
  label,
  description,
  required,
  hideError = false,
  rules,
  addon,
  onChange,
  trailing,
  ...props
}: FormInputProps) => {
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
      render={({ field: fieldProps }) => {
        // Merge custom onChange with React Hook Form's onChange
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          // If custom onChange is provided, call it first to allow value transformation
          // This allows preprocessing (like converting to lowercase) before React Hook Form processes it
          if (onChange) {
            onChange(e)
            // The custom onChange may have modified e.target.value, so we use that modified value
          }
          // Call React Hook Form's onChange with the (potentially modified) value
          fieldProps.onChange(e)
        }

        return (
          <FormItem>
            {label && (
              <div className="flex items-center gap-1">
                <FormLabel
                  className={cn(
                    'mb-0',
                    required && 'after:text-destructive after:ml-0.5 after:content-["*"]'
                  )}>
                  {label}
                </FormLabel>
                {description && (
                  <TooltipProvider delayDuration={200}>
                    <Tooltip>
                      <TooltipTrigger className="cursor-pointer">
                        <CircleQuestionMark size={15} />
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        align="end"
                        className="text-muted-foreground max-w-[500px]">
                        {description}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
            <div className="relative">
              <FormControl>
                {addon ? (
                  <InputGroup className="rounded-sm border-none bg-gray-100">
                    <InputGroupInput {...fieldProps} {...props} onChange={handleChange} />
                    {addon && (
                      <InputGroupAddon
                        align={addon?.position === 'right' ? 'inline-end' : 'inline-start'}>
                        {addon?.icon}
                      </InputGroupAddon>
                    )}
                  </InputGroup>
                ) : (
                  <Input {...fieldProps} {...props} onChange={handleChange} />
                )}
              </FormControl>
              {trailing && !!fieldProps.value && (
                <button
                  type="button"
                  onClick={trailing.onClick}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground
                    hover:text-foreground cursor-pointer">
                  {trailing.icon}
                </button>
              )}
            </div>
            {!hideError && <FormMessage />}
          </FormItem>
        )
      }}
    />
  )
}
