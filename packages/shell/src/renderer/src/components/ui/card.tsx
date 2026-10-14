import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn(
        'rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md',
        'dark:border-zinc-800 dark:bg-zinc-900 dark:hover:shadow-lg',
        className
      )}
      {...props}
    />
  )
}
