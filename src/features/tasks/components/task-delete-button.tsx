import type { InferResponseType } from 'hono'
import { Trash2 } from 'lucide-react'
import { Button } from '~/components/ui/shadcn/button'
import { useDeleteTask } from '~/features/tasks/hooks/use-delete-task'
import type { client } from '~/lib/rpc'

type TaskDeleteButtonProps = {
  taskId: InferResponseType<typeof client.api.tasks.$get, 200>[number]['id']
  isDisabled: boolean
}

export function TaskDeleteButton({ taskId, isDisabled }: TaskDeleteButtonProps) {
  const { isPending, handleDelete } = useDeleteTask(taskId)

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isDisabled || isPending}
      onClick={handleDelete}
      className="cursor-pointer text-muted-foreground hover:text-destructive disabled:cursor-not-allowed"
      aria-label="タスクを削除"
      data-testid={`task-delete-button-${taskId}`}
    >
      <Trash2 className="size-4" />
    </Button>
  )
}
