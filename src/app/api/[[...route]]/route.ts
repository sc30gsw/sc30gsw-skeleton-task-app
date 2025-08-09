import { OpenAPIHono } from '@hono/zod-openapi'
import { Scalar } from '@scalar/hono-api-reference'
import { handle } from 'hono/vercel'
import { taskApi } from '~/features/tasks/api/route'

const app = new OpenAPIHono().basePath('/api')

app
  .doc('/doc', {
    openapi: '3.0.0',
    info: {
      title: 'Task App API',
      version: '1.0.0',
    },
  })
  .get('/scalar', Scalar({ url: '/api/doc' }))

const route = app.route('/tasks', taskApi)
export type AppType = typeof route

export const GET = handle(route)
