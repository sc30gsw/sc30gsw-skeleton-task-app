import type { ReactNode } from 'react'
import { Button } from '~/components/ui/shadcn/button'
import { cn } from '~/lib/utils'

type EmptyStateProps = {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center px-4 py-12 text-center', className)}
      role="region"
      aria-labelledby="empty-state-title"
    >
      {icon && (
        <div className="mb-4 text-muted-foreground" aria-hidden="true">
          {icon}
        </div>
      )}

      <h3 id="empty-state-title" className="mb-2 font-semibold text-foreground text-lg">
        {title}
      </h3>

      {description && <p className="mb-6 max-w-md text-muted-foreground text-sm">{description}</p>}

      {action && (
        <Button onClick={action.onClick} variant="outline" className="min-w-[120px]">
          {action.label}
        </Button>
      )}
    </div>
  )
}
