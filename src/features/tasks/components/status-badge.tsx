import { BadgeCheckIcon, Clock } from 'lucide-react'
import { Badge } from '~/components/ui/shadcn/badge'
import { cn } from '~/lib/utils'

export default function StatusBadge({ isCompleted }: Record<'isCompleted', boolean>) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        'inline-flex items-center gap-1',
        isCompleted
          ? 'bg-green-500 text-white hover:bg-green-600'
          : 'bg-blue-500 text-white hover:bg-blue-600',
      )}
    >
      {isCompleted ? <BadgeCheckIcon className="size-3" /> : <Clock className="size-3" />}
      {isCompleted ? '完了' : '未完了'}
    </Badge>
  )
}
