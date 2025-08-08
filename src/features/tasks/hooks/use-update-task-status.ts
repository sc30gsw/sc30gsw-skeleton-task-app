import { useRouter } from 'next/navigation'
import { useOptimistic, useTransition } from 'react'
import { toast } from 'sonner'
import { TOAST_COLOR } from '~/constants/toast'
import { updateTaskStatusAction } from '~/features/tasks/actions/update-task-status-action'
import { TASK_STATUS } from '~/features/tasks/constants/task'
import { TASK_ERROR_MESSAGES, TASK_SUCCESS_MESSAGES } from '~/features/tasks/constants/validation'
import type { TaskList } from '~/features/tasks/types/task'

export function useUpdateTaskStatus(
  taskId: TaskList[number]['id'],
  status: TaskList[number]['status'],
) {
  const [isCompleted, setIsCompleted] = useOptimistic(status === TASK_STATUS.COMPLETE, (state) => {
    return !state
  })
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleStatusToggle = (checked: boolean) => {
    startTransition(async () => {
      setIsCompleted(checked)

      const result = await updateTaskStatusAction(
        taskId,
        checked ? TASK_STATUS.COMPLETE : TASK_STATUS.INCOMPLETE,
      )

      if (!result.isSuccess) {
        toast.error(TASK_ERROR_MESSAGES.TASK_UPDATE_FAILED.message, {
          style: TOAST_COLOR.ERROR,
          position: 'top-center',
        })
        setIsCompleted(!checked)

        return
      }

      toast.success(TASK_SUCCESS_MESSAGES.TASK_UPDATED.message, {
        style: TOAST_COLOR.SUCCESS,
        position: 'top-center',
      })

      router.refresh()
    })
  }

  return {
    isCompleted,
    isPending,
    handleStatusToggle,
  } as const
}
