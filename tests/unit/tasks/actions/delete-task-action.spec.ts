import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Task } from '~/db/schema'
import { deleteTaskAction } from '~/features/tasks/actions/delete-task-action'
import { TASK_ERROR_MESSAGES, TASK_SUCCESS_MESSAGES } from '~/features/tasks/constants/validation'
import { updateTaskSchema } from '~/features/tasks/types/schema/task-schema'
import type { ActionsResult } from '~/types/action-result'

vi.mock('~/db/index.ts', () => ({
  db: {},
}))

vi.mock('~/features/tasks/services/task-service', () => {
  const mockDeleteTask = vi.fn()
  const MockTaskService = vi.fn().mockImplementation(() => ({
    deleteTask: mockDeleteTask,
  }))

  return {
    TaskService: MockTaskService,
    mockDeleteTask,
  }
})

const taskServiceModule = await import('~/features/tasks/services/task-service')
const mockDeleteTask = (taskServiceModule as any).mockDeleteTask

describe('deleteTaskAction', () => {
  beforeEach(async () => {
    vi.clearAllMocks()

    const { TaskService } = await import('~/features/tasks/services/task-service')
    vi.mocked(TaskService).mockImplementation(
      () =>
        ({
          deleteTask: mockDeleteTask,
        }) as any,
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('正常フロー', () => {
    it('タスクの削除が成功する', async () => {
      const taskId = crypto.randomUUID()
      mockDeleteTask.mockResolvedValue(undefined)

      const result = await deleteTaskAction(taskId)

      expect(mockDeleteTask).toHaveBeenCalledWith(taskId)

      const expectedResult = {
        isSuccess: true,
        message: TASK_SUCCESS_MESSAGES.TASK_DELETED.message,
      } as const satisfies ActionsResult
      expect(result).toEqual(expectedResult)
    })
  })

  describe('バリデーションエラー', () => {
    it('無効なタスクID形式でエラーを返す', async () => {
      const invalidTaskId = ''

      const result = await deleteTaskAction(invalidTaskId)

      expect(mockDeleteTask).not.toHaveBeenCalled()

      const expectedResult = {
        isSuccess: false,
        error: { message: TASK_ERROR_MESSAGES.INVALID_TASK_ID.message },
      } as const satisfies ActionsResult
      expect(result).toEqual(expectedResult)
    })

    it('nullタスクIDでエラーを返す', async () => {
      const nullTaskId = null as unknown as Task['id']

      const result = await deleteTaskAction(nullTaskId)

      expect(mockDeleteTask).not.toHaveBeenCalled()

      const expectedResult = {
        isSuccess: false,
        error: { message: TASK_ERROR_MESSAGES.INVALID_TASK_ID.message },
      } as const satisfies ActionsResult
      expect(result).toEqual(expectedResult)
    })

    it('undefinedタスクIDでエラーを返す', async () => {
      const undefinedTaskId = undefined as unknown as Task['id']

      const result = await deleteTaskAction(undefinedTaskId)

      expect(mockDeleteTask).not.toHaveBeenCalled()

      const expectedResult = {
        isSuccess: false,
        error: { message: TASK_ERROR_MESSAGES.INVALID_TASK_ID.message },
      } as const satisfies ActionsResult
      expect(result).toEqual(expectedResult)
    })
  })

  describe('サービスエラー', () => {
    it('TaskService deleteTaskエラーを処理する', async () => {
      const taskId = crypto.randomUUID()
      mockDeleteTask.mockRejectedValue(new Error('データベースエラー'))

      const result = await deleteTaskAction(taskId)

      expect(mockDeleteTask).toHaveBeenCalledWith(taskId)

      const expectedResult = {
        isSuccess: false,
        error: { message: TASK_ERROR_MESSAGES.TASK_DELETE_FAILED.message },
      } as const satisfies ActionsResult
      expect(result).toEqual(expectedResult)
    })

    it('TaskServiceがカスタムエラーをスローするのを処理する', async () => {
      const taskId = crypto.randomUUID()
      const customError = new Error('タスクが見つかりません')
      customError.name = 'TaskServiceError'
      mockDeleteTask.mockImplementation(() => {
        throw customError
      })

      const result = await deleteTaskAction(taskId)

      expect(mockDeleteTask).toHaveBeenCalledWith(taskId)

      const expectedResult = {
        isSuccess: false,
        error: { message: TASK_ERROR_MESSAGES.TASK_DELETE_FAILED.message },
      } as const satisfies ActionsResult
      expect(result).toEqual(expectedResult)
    })
  })

  describe('エッジケース', () => {
    it('非常に長いタスクIDを処理する', async () => {
      const longTaskId = 'a'.repeat(1000)
      mockDeleteTask.mockResolvedValue(undefined)

      const result = await deleteTaskAction(longTaskId)

      if (updateTaskSchema.pick({ id: true }).safeParse({ id: longTaskId }).success) {
        expect(mockDeleteTask).toHaveBeenCalledWith(longTaskId)
        expect(result.isSuccess).toBe(true)
      } else {
        expect(result.isSuccess).toBe(false)
        if (!result.isSuccess) {
          expect(result.error?.message).toBe(TASK_ERROR_MESSAGES.INVALID_TASK_ID.message)
        }
      }
    })

    it('タスクIDの特殊文字を処理する', async () => {
      const specialCharTaskId = 'task-@#$%^&*()'
      mockDeleteTask.mockResolvedValue(undefined)

      const result = await deleteTaskAction(specialCharTaskId)

      if (updateTaskSchema.pick({ id: true }).safeParse({ id: specialCharTaskId }).success) {
        expect(mockDeleteTask).toHaveBeenCalledWith(specialCharTaskId)
      } else {
        expect(result.isSuccess).toBe(false)
      }
    })
  })

  describe('戻り値型の一貫性', () => {
    it('成功時に一貫したActionsResult型を返す', async () => {
      const taskId = crypto.randomUUID()
      mockDeleteTask.mockResolvedValue(undefined)

      const result = await deleteTaskAction(taskId)

      expect(result).toHaveProperty('isSuccess')
      if (result.isSuccess) {
        expect(result).toHaveProperty('message')
        expect(result).not.toHaveProperty('error')
      } else {
        expect(result).toHaveProperty('error')
        expect(result).not.toHaveProperty('message')
      }
    })

    it('エラー時に一貫したActionsResult型を返す', async () => {
      const invalidTaskId = ''

      const result = await deleteTaskAction(invalidTaskId)

      expect(result).toHaveProperty('isSuccess', false)
      expect(result).toHaveProperty('error')
      if (!result.isSuccess) {
        expect(result.error).toHaveProperty('message')
      }
      expect(result).not.toHaveProperty('message')
    })
  })
})
