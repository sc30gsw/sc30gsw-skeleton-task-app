import type { InferResponseType } from 'hono'
import 'server-only'
import { FETCH_ALL_TASKS_CACHE_KEY } from '~/constants/cache-keys'
import { TASK_ERROR_MESSAGES } from '~/features/tasks/constants/validation'
import { client } from '~/lib/rpc'
import { upfetch } from '~/lib/upfetch'

export async function fetchAllTasks() {
  type Response = InferResponseType<typeof client.api.tasks.$get, 200>
  const url = client.api.tasks.$url()

  try {
    const todos = await upfetch<Response>(url, {
      next: {
        tags: [FETCH_ALL_TASKS_CACHE_KEY],
      },
    })

    return todos
  } catch (_) {
    throw new Error(TASK_ERROR_MESSAGES.TASK_GET_FAILED.message)
  }
}
