import { up } from 'up-fetch'
import { env } from '~/env'

export const upfetch = up(fetch, () => ({
  baseUrl: env.NEXT_PUBLIC_APP_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
}))
