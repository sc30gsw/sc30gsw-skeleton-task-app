import { swaggerUI } from '@hono/swagger-ui'
import { OpenAPIHono } from '@hono/zod-openapi'
import { handle } from 'hono/vercel'
import { taskApi } from '~/features/tasks/api/route'

const app = new OpenAPIHono()

app
  .doc('/api/specification', {
    openapi: '3.0.0',
    info: {
      title: 'API',
      version: '1.0.0',
    },
  })
  .get(
    '/api/doc',
    swaggerUI({
      url: '/api/specification',
    }),
  )

const route = app.route('/api/tasks', taskApi)
export type AppType = typeof route

export const GET = handle(route)
