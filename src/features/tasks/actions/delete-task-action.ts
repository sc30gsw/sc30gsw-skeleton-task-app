'use server'

import type { Task } from '~/db/schema'
import { TASK_ERROR_MESSAGES, TASK_SUCCESS_MESSAGES } from '~/features/tasks/constants/validation'
import { TaskService } from '~/features/tasks/services/task-service'
import { updateTaskSchema } from '~/features/tasks/types/schema/task-schema'
import type { ActionsResult } from '~/types/action-result'

const taskService = new TaskService()

export async function deleteTaskAction(id: Task['id']): Promise<ActionsResult> {
  const isValid = updateTaskSchema.pick({ id: true }).safeParse({ id })

  if (!isValid.success) {
    return {
      isSuccess: false,
      error: { message: TASK_ERROR_MESSAGES.INVALID_TASK_ID.message },
    }
  }

  try {
    await taskService.deleteTask(id)

    return {
      isSuccess: true,
      message: TASK_SUCCESS_MESSAGES.TASK_DELETED.message,
    }
  } catch (_) {
    return {
      isSuccess: false,
      error: { message: TASK_ERROR_MESSAGES.TASK_DELETE_FAILED.message },
    }
  }
}
