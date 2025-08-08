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
      className={cn('transition-all duration-200 hover:shadow-sm', isCompleted && 'bg-muted/50')}
      role="listitem"
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id={`task-${task.id}`}
              checked={isCompleted}
              onCheckedChange={handleStatusToggle}
              disabled={isPending}
              aria-label={`${task.title}を${isCompleted ? '未完了' : '完了'}にする`}
              className="cursor-pointer"
            />
            <Label
              htmlFor={`task-${task.id}`}
              className={cn(
                'cursor-pointer font-medium text-base',
                isCompleted ? 'text-muted-foreground line-through' : 'text-foreground',
              )}
            >
              {task.title}
            </Label>
            <StatusBadge isCompleted={isCompleted} />
          </div>

          <TaskDeleteButton taskId={task.id} isDisabled={isPending} />
        </div>

        <div className="mt-2 ml-6 flex items-center gap-1 text-muted-foreground text-xs">
          <Calendar className="size-3" />
          <span>{format(new Date(task.createdAt), 'yyyy/MM/dd HH:mm', { locale: ja })}</span>
        </div>
      </CardContent>
    </Card>
  )
}
