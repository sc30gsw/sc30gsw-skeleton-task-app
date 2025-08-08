import { sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const tasks = sqliteTable(
  'tasks',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text('title').notNull(),
    status: text('status', { enum: ['incomplete', 'complete'] })
      .notNull()
      .default('incomplete'),
    createdAt: text('created_at').default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).$onUpdate(() => new Date()),
  },
  (tasks) => [
    index('idx_tasks_status').on(tasks.status),
    index('idx_tasks_created_at').on(tasks.createdAt),
    index('idx_tasks_status_created').on(tasks.status, tasks.createdAt),
    index('idx_tasks_title').on(tasks.title),
  ],
)

export type Task = typeof tasks.$inferSelect
export type InsertTask = typeof tasks.$inferInsert
