'use client'

import { format } from 'date-fns'
import { ja } from 'date-fns/locale/ja'
import { Calendar } from 'lucide-react'
import { Card, CardContent } from '~/components/ui/shadcn/card'
import { Checkbox } from '~/components/ui/shadcn/checkbox'
import { Label } from '~/components/ui/shadcn/label'
import StatusBadge from '~/features/tasks/components/status-badge'
import { TaskDeleteButton } from '~/features/tasks/components/task-delete-button'
import { useUpdateTaskStatus } from '~/features/tasks/hooks/use-update-task-status'
import type { TaskList } from '~/features/tasks/types/task'
import { cn } from '~/lib/utils'

export function TaskItem({ task }: Record<'task', TaskList[number]>) {
  const { isCompleted, isPending, handleStatusToggle } = useUpdateTaskStatus(task.id, task.status)

  return (
    <Card
      className={cn(
        'w-full transition-all duration-200 hover:shadow-sm',
        isCompleted && 'bg-muted/50',
      )}
      role="listitem"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3 overflow-hidden">
            <Checkbox
              id={`task-${task.id}`}
              checked={isCompleted}
              onCheckedChange={handleStatusToggle}
              disabled={isPending}
              aria-label={`${task.title}を${isCompleted ? '未完了' : '完了'}にする`}
              className="mt-0.5 flex-shrink-0 cursor-pointer"
              data-testid={`task-checkbox-${task.id}`}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-2 overflow-hidden sm:flex-row sm:items-center sm:gap-3">
              <Label
                htmlFor={`task-${task.id}`}
                className={cn(
                  'overflow-wrap-anywhere min-w-0 cursor-pointer break-all font-medium text-base leading-relaxed',
                  isCompleted ? 'text-muted-foreground line-through' : 'text-foreground',
                )}
                data-testid={`task-title-${task.id}`}
                style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
              >
                {task.title}
              </Label>
              <div className="flex-shrink-0">
                <StatusBadge isCompleted={isCompleted} />
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            <TaskDeleteButton taskId={task.id} isDisabled={isPending} />
          </div>
        </div>

        <div className="mt-2 ml-6 flex items-center gap-1 text-muted-foreground text-xs">
          <Calendar className="size-3" />
          <span>{format(new Date(task.createdAt), 'yyyy/MM/dd HH:mm', { locale: ja })}</span>
        </div>
      </CardContent>
    </Card>
  )
}
