import { useFormContext } from './form-context'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/modules/shadcn/ui/form'
import MarkdownEditor from '@/components/makrdown/editor'

interface FormMarkdownEditorProps {
  field: string
  label?: string
  description?: string
  required?: boolean
  hideError?: boolean
  editorHeight?: number
  autoFocus?: boolean
  rules?: {
    required?: boolean | string
    minLength?: number | { value: number; message: string }
    maxLength?: number | { value: number; message: string }
    validate?: (value: unknown) => boolean | string | Promise<boolean | string>
  }
}

export const FormMarkdownEditor = ({
  field,
  label,
  description,
  required,
  hideError = false,
  editorHeight,
  autoFocus,
  rules,
}: FormMarkdownEditorProps) => {
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
              className={required ? 'after:text-destructive after:ml-0.5 after:content-["*"]' : ''}>
              {label}
            </FormLabel>
          )}
          {description && <FormDescription>{description}</FormDescription>}
          <FormControl>
            <MarkdownEditor
              name={field}
              value={fieldProps.value || ''}
              onUpdateChange={fieldProps.onChange}
              editorHeight={editorHeight}
              autofocus={autoFocus}
            />
          </FormControl>
          {!hideError && <FormMessage />}
        </FormItem>
      )}
    />
  )
}
