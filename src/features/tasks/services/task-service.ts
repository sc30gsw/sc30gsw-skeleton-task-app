import { desc, eq } from 'drizzle-orm'
import { db } from '~/db'
import { type InsertTask, type Task, tasks } from '~/db/schema'
import { TASK_ERROR_MESSAGES } from '~/features/tasks/constants/validation'

class TaskServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown,
  ) {
    super(message)
    this.name = 'TaskServiceError'
  }
}

export class TaskService {
  async getAllTasks() {
    try {
      return await db.query.tasks.findMany({
        orderBy: desc(tasks.createdAt),
      })
    } catch (error) {
      throw new TaskServiceError(
        TASK_ERROR_MESSAGES.TASK_GET_FAILED.message,
        TASK_ERROR_MESSAGES.TASK_GET_FAILED.code,
        error,
      )
    }
  }

  async getTasksByStatus(status: Task['status']) {
    try {
      return await db.query.tasks.findMany({
        where: eq(tasks.status, status),
        orderBy: desc(tasks.createdAt),
      })
    } catch (error) {
      throw new TaskServiceError(
        TASK_ERROR_MESSAGES.TASK_GET_FAILED.message,
        TASK_ERROR_MESSAGES.TASK_GET_FAILED.code,
        error,
      )
    }
  }

  async createTask(title: InsertTask['title']) {
    try {
      const newTask = {
        title: title.trim(),
      } as const satisfies InsertTask

      await db.insert(tasks).values(newTask)
    } catch (error) {
      throw new TaskServiceError(
        TASK_ERROR_MESSAGES.TASK_CREATE_FAILED.message,
        TASK_ERROR_MESSAGES.TASK_CREATE_FAILED.code,
        error,
      )
    }
  }

  async updateTaskStatus(id: Task['id'], status: Task['status']) {
    try {
      const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, id),
      })

      if (!task) {
        throw new TaskServiceError(
          TASK_ERROR_MESSAGES.TASK_NOT_FOUND.message,
          TASK_ERROR_MESSAGES.TASK_NOT_FOUND.code,
        )
      }

      await db.update(tasks).set({ status }).where(eq(tasks.id, id)).returning()
    } catch (error) {
      if (error instanceof TaskServiceError) {
        throw error
      }

      throw new TaskServiceError(
        TASK_ERROR_MESSAGES.TASK_UPDATE_FAILED.message,
        TASK_ERROR_MESSAGES.TASK_UPDATE_FAILED.code,
        error,
      )
    }
  }

  async deleteTask(id: Task['id']) {
    try {
      const task = await db.query.tasks.findFirst({
        where: eq(tasks.id, id),
      })

      if (!task) {
        throw new TaskServiceError(
          TASK_ERROR_MESSAGES.TASK_NOT_FOUND.message,
          TASK_ERROR_MESSAGES.TASK_NOT_FOUND.code,
        )
      }

      await db.delete(tasks).where(eq(tasks.id, id))
    } catch (error) {
      if (error instanceof TaskServiceError) {
        throw error
      }

      throw new TaskServiceError(
        TASK_ERROR_MESSAGES.TASK_DELETE_FAILED.message,
        TASK_ERROR_MESSAGES.TASK_DELETE_FAILED.code,
        error,
      )
    }
  }
}
