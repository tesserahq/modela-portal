import * as React from 'react'
import * as TogglePrimitive from '@radix-ui/react-toggle'
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@shadcn/lib/utils'

const toggleVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-primary transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 gap-1',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 px-3 min-w-10',
        sm: 'py-1 px-2.5 min-w-9',
        lg: 'h-11 px-5 min-w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
))

Toggle.displayName = TogglePrimitive.Root.displayName

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: 'horizontal' | 'vertical'
  }
>({
  size: 'default',
  variant: 'default',
  spacing: 2,
  orientation: 'horizontal',
})
function ToggleGroup({
  className,
  variant,
  size,
  spacing = 2,
  orientation = 'horizontal',
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: 'horizontal' | 'vertical'
  }) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      style={{ '--gap': spacing } as React.CSSProperties}
      className={cn(
        `group/toggle-group flex w-fit flex-row items-center gap-[--spacing(var(--gap))] rounded-md
        data-vertical:flex-col data-vertical:items-stretch`,
        className
      )}
      {...props}>
      <ToggleGroupContext.Provider value={{ variant, size, spacing, orientation }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}
function ToggleGroupItem({
  className,
  children,
  variant = 'default',
  size = 'default',
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        `shrink-0 group-data-[spacing=0]/toggle-group:rounded-none
        group-data-[spacing=0]/toggle-group:px-2 focus:z-10 focus-visible:z-10
        group-data-[spacing=0]/toggle-group:has-data-[icon=inline-end]:pr-1.5
        group-data-[spacing=0]/toggle-group:has-data-[icon=inline-start]:pl-1.5
        group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-l-lg
        group-data-vertical/toggle-group:data-[spacing=0]:first:rounded-t-lg
        group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-r-lg
        group-data-vertical/toggle-group:data-[spacing=0]:last:rounded-b-lg
        group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0
        group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0
        group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l
        group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t`,
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        'cursor-pointer',
        className
      )}
      {...props}>
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export { Toggle, toggleVariants, ToggleGroup, ToggleGroupItem }
