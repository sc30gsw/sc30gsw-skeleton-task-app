import type { InferResponseType } from 'hono'
import type { client } from '~/lib/rpc'

export type TaskList = InferResponseType<typeof client.api.tasks.$get, 200>
