import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { TOAST_COLOR } from '~/constants/toast'
import { deleteTaskAction } from '~/features/tasks/actions/delete-task-action'
import { TASK_ERROR_MESSAGES, TASK_SUCCESS_MESSAGES } from '~/features/tasks/constants/validation'
import type { TaskList } from '~/features/tasks/types/task'
import { Confirm } from '~/hooks/use-confirm'

export function useDeleteTask(taskId: TaskList[number]['id']) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = async () => {
    const ok = await Confirm.call({
      title: 'タスクを削除しますか？',
      message: 'この操作は取り消せません。',
      confirmButtonLabel: '削除',
      variant: 'destructive',
    })

    if (!ok) {
      return
    }

    startTransition(async () => {
      const result = await deleteTaskAction(taskId)

      if (!result.isSuccess) {
        toast.error(TASK_ERROR_MESSAGES.TASK_DELETE_FAILED.message, {
          style: TOAST_COLOR.ERROR,
          position: 'top-center',
        })
        return
      }

      toast.success(TASK_SUCCESS_MESSAGES.TASK_DELETED.message, {
        style: TOAST_COLOR.SUCCESS,
        position: 'top-center',
      })

      router.refresh()
    })
  }

  return {
    isPending,
    handleDelete,
  } as const
}
