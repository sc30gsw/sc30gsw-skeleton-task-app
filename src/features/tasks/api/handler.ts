import type { RouteHandler } from '@hono/zod-openapi'
import type { getTasksRoute } from '~/features/tasks/api/route'
import { TASK_ERROR_MESSAGES } from '~/features/tasks/constants/validation'
import { TaskService } from '~/features/tasks/services/task-service'

const taskService = new TaskService()

export async function getTasksHandler(c: Parameters<RouteHandler<typeof getTasksRoute>>[0]) {
  try {
    const tasks = await taskService.getAllTasks()

    return c.json(tasks, 200)
  } catch (_) {
    return c.json({ error: TASK_ERROR_MESSAGES.TASK_GET_FAILED.message }, 500)
  }
}
