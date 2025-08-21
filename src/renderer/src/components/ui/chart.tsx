import * as React from 'react'
import { cn } from '@renderer/lib/utils'

export function ChartContainer({ className, children }: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return <div className={cn('w-full', className)}>{children}</div>
}

export function ChartTitle({ children }: { children: React.ReactNode }): React.ReactElement {
  return <h3 className="text-sm font-medium leading-none mb-2">{children}</h3>
}

export function ChartDescription({ children }: { children: React.ReactNode }): React.ReactElement {
  return <p className="text-xs text-muted-foreground mb-4">{children}</p>
}
