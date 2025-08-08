'use server'

import type { Task } from '~/db/schema'
import { TASK_ERROR_MESSAGES } from '~/features/tasks/constants/validation'
import { TaskService } from '~/features/tasks/services/task-service'
import { updateTaskSchema } from '~/features/tasks/types/schema/task-schema'
import type { ActionsResult } from '~/types/action-result'

const taskService = new TaskService()

export async function updateTaskStatusAction(
  id: Task['id'],
  status: Task['status'],
): Promise<ActionsResult> {
  const isValid = updateTaskSchema.safeParse({ id, status })

  if (!isValid.success) {
    return {
      isSuccess: false,
      error: { message: TASK_ERROR_MESSAGES.INVALID_TASK_ID.message },
    }
  }

  try {
    await taskService.updateTaskStatus(id, status)

    return {
      isSuccess: true,
      message: TASK_ERROR_MESSAGES.TASK_UPDATE_FAILED.message,
    }
  } catch (_) {
    return {
      isSuccess: false,
      error: { message: TASK_ERROR_MESSAGES.TASK_UPDATE_FAILED.message },
    }
  }
}
