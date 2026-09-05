import { markdown } from '@codemirror/lang-markdown'
import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shadcn/ui/tabs'
import { cn } from '@shadcn/lib/utils'
import { Markdown } from './markdown'

interface IProps {
  value: string
  onUpdateChange: (val: string) => void
  editorHeight?: number
  name?: string
  display?: 'row' | 'col'
  autofocus?: boolean
  showPreview?: boolean
}

export default function MarkdownEditor({
  value,
  onUpdateChange,
  editorHeight = 400,
  name,
  display = 'row',
  autofocus = false,
  showPreview = true,
}: IProps) {
  return (
    <div
      className={cn(
        'flex h-full w-full flex-col items-start justify-between gap-5',
        display === 'col' ? 'lg:flex-col' : 'lg:flex-row'
      )}>
      <Tabs
        defaultValue="markdown"
        className="w-full overflow-hidden rounded-sm border border-input bg-muted">
        <TabsList
          className={cn('h-8 gap-0 border-none bg-transparent p-0', !showPreview && 'hidden')}>
          <TabsTrigger
            value="markdown"
            className="rounded-none !border-transparent py-2 text-xs !shadow-none
              hover:bg-transparent data-[state=active]:rounded-tr-sm
              data-[state=active]:!border-r-input data-[state=active]:!border-t-input
              data-[state=active]:bg-white data-[state=active]:dark:bg-slate-800">
            Write
          </TabsTrigger>
          {showPreview && (
            <TabsTrigger
              value="preview"
              className="rounded-none !border-transparent py-2 text-xs !shadow-none
                hover:bg-transparent data-[state=active]:rounded-tl-sm
                data-[state=active]:rounded-tr-sm data-[state=active]:!border-input
                data-[state=active]:!border-b-transparent data-[state=active]:bg-white
                data-[state=active]:dark:bg-slate-800">
              Preview
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent
          value="markdown"
          className={cn('mt-0 bg-white dark:bg-slate-800', showPreview && 'border-t border-input')}>
          <CodeMirror
            value={value}
            onChange={onUpdateChange}
            extensions={[markdown(), EditorView.lineWrapping]}
            autoFocus={autofocus}
            height={`${editorHeight}px`}
            aria-label={name}
            placeholder="Type here"
          />
        </TabsContent>
        {showPreview && (
          <TabsContent
            value="preview"
            className="mt-0 border-t border-input bg-white p-3 dark:bg-slate-800">
            <div className="overflow-scroll" style={{ height: editorHeight }}>
              <Markdown>{value}</Markdown>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
