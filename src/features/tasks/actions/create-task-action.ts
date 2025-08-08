'use server'

import type { SubmissionResult } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod/v4'
import { TASK_ERROR_MESSAGES } from '~/features/tasks/constants/validation'

import { TaskService } from '~/features/tasks/services/task-service'
import { createTaskSchema } from '~/features/tasks/types/schema/task-schema'

const taskService = new TaskService()

export async function createTaskAction(_: unknown, formData: FormData) {
  const submission = parseWithZod(formData, { schema: createTaskSchema })

  if (submission.status !== 'success') {
    return submission.reply()
  }
  try {
    taskService.createTask(submission.value.title)

    // revalidateTag(FETCH_ALL_TASKS_CACHE_KEY)
    return submission.reply()
  } catch (_) {
    return {
      status: 'error',
      error: { message: [TASK_ERROR_MESSAGES.TASK_CREATE_FAILED.message] },
    } as const satisfies SubmissionResult
  }
}
