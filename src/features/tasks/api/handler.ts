import type { RouteHandler } from '@hono/zod-openapi'
import type { getTasksRoute } from '~/features/tasks/api/route'
import { TaskService } from '~/features/tasks/services/task-service'

const taskService = new TaskService()

export async function getTasksHandler(c: Parameters<RouteHandler<typeof getTasksRoute>>[0]) {
  try {
    const tasks = await taskService.getAllTasks()

    return c.json(tasks, 200)
  } catch (_) {
    return c.json({ error: 'タスクの取得に失敗しました' }, 500)
  }
}
