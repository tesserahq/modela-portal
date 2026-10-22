import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@shadcn/lib/utils'

const alertVariants = cva(
  'relative w-full rounded-md border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
  {
    variants: {
      variant: {
        default:
          'bg-background text-foreground border border-border dark:bg-muted dark:text-muted-foreground',
        destructive:
          'bg-destructive/10 text-destructive border border-destructive/30 dark:bg-destructive/20 dark:text-destructive dark:border-destructive/30 [&>svg]:text-destructive',
        warning:
          'bg-accent text-accent-foreground border border-accent dark:bg-accent dark:text-accent-foreground dark:border-accent [&>svg]:text-accent-foreground',
        success:
          'bg-primary/10 text-primary border border-primary/30 dark:bg-primary/20 dark:text-primary dark:border-primary/30 [&>svg]:text-primary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
))
Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('leading-none font-semibold tracking-tight', className)}
      {...props}
    />
  )
)
AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
))
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertTitle, AlertDescription }
