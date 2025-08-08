import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { getTasksHandler } from '~/features/tasks/api/handler'
import {
  errorResponseSchema,
  taskListResponseSchema,
} from '~/features/tasks/types/schema/task-schema'

export const getTasksRoute = createRoute({
  method: 'get',
  path: '/',
  summary: 'タスク一覧取得',
  description: '全てのタスクを取得します',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: taskListResponseSchema,
        },
      },
      description: 'タスク一覧の取得に成功',
    },
    500: {
      content: {
        'application/json': {
          schema: errorResponseSchema,
        },
      },
      description: 'サーバーエラー',
    },
  },
})

export const taskApi = new OpenAPIHono().openapi(getTasksRoute, getTasksHandler)
