import { z } from '@hono/zod-openapi'
import { TASK_STATUS } from '~/features/tasks/constants/task'
import { TITLE_VALIDATION } from '~/features/tasks/constants/validation'

export const taskStatusSchema = z.enum([TASK_STATUS.INCOMPLETE, TASK_STATUS.COMPLETE])
export const createTaskSchema = z.object({
  title: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? TITLE_VALIDATION.MIN_LENGTH.message
          : TITLE_VALIDATION.NOT_STRING.message,
    })
    .trim()
    .min(TITLE_VALIDATION.MIN_LENGTH.value, TITLE_VALIDATION.MIN_LENGTH.message)
    .max(TITLE_VALIDATION.MAX_LENGTH.value, TITLE_VALIDATION.MAX_LENGTH.message),
})

export const updateTaskSchema = z.object({
  id: z.uuid(),
  status: taskStatusSchema,
})

const taskSchema = z.object({
  id: z.uuid(),
  title: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? TITLE_VALIDATION.MIN_LENGTH.message
          : TITLE_VALIDATION.NOT_STRING.message,
    })
    .max(TITLE_VALIDATION.MAX_LENGTH.value, TITLE_VALIDATION.MAX_LENGTH.message),
  status: taskStatusSchema,
  createdAt: z.string(),
  updatedAt: z.date().nullable(),
})

export const taskListResponseSchema = z.array(taskSchema)
export const errorResponseSchema = z.object({
  error: z.string(),
  issues: z
    .array(
      z.object({
        path: z.array(z.string()),
        message: z.string(),
      }),
    )
    .optional(),
})

export type CreateTaskSchema = z.infer<typeof createTaskSchema>
export type TaskStatus = z.infer<typeof taskStatusSchema>
