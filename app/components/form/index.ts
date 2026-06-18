import { Form } from './form'
import { FormProvider, useFormContext } from './form-context'
import { FormDatePicker } from './form-date-picker'
import { FormDateTimePicker } from './form-datetime-picker'
import { FormInput } from './form-input'
import { FormSelect } from './form-select'
import { FormSwitch } from './form-switch'
import { FormTextarea } from './form-textarea'
import { FormEmail } from './form-email'
import { FormCommand } from './form-command'
import { FormAutocomplete } from './form-autocomplete'
import { FormArray } from './form-array'
import { FormComboBox } from './form-command-custom'
import { FormSchemaMap } from './form-schema'
import { FormMarkdownEditor } from './form-markdown-editor'

const FormCompound = Object.assign(Form, {
  Input: FormInput,
  Textarea: FormTextarea,
  Select: FormSelect,
  Switch: FormSwitch,
  DateTimePicker: FormDateTimePicker,
  DatePicker: FormDatePicker,
  Email: FormEmail,
  Command: FormCommand,
  Autocomplete: FormAutocomplete,
  Array: FormArray,
  Provider: FormProvider,
  ComboBox: FormComboBox,
  Schema: FormSchemaMap,
  MarkdownEditor: FormMarkdownEditor,
})

export { FormCompound as Form, useFormContext }
