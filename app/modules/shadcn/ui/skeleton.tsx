import { cn } from '../lib/utils'

function Skeleton({ className }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="skeleton" className={cn('bg-accent animate-pulse rounded-md', className)}></div>
  )
}

export { Skeleton }
