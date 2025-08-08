import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '~/db/schema'
import { env } from '~/env'

export const db = drizzle({
  connection: {
    url: env.DATABASE_URL,
    authToken: env.DATABASE_AUTH_TOKEN,
  },
  schema: schema,
})
