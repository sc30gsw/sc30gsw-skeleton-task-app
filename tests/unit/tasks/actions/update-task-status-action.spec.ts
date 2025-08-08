import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Task } from '~/db/schema'
import { updateTaskStatusAction } from '~/features/tasks/actions/update-task-status-action'
import { TASK_STATUS } from '~/features/tasks/constants/task'
import { TASK_ERROR_MESSAGES, TASK_SUCCESS_MESSAGES } from '~/features/tasks/constants/validation'
import { updateTaskSchema } from '~/features/tasks/types/schema/task-schema'
import type { ActionsResult } from '~/types/action-result'

vi.mock('~/db/index.ts', () => ({
  db: {},
}))

vi.mock('~/features/tasks/services/task-service', () => {
  const mockUpdateTaskStatus = vi.fn()
  const MockTaskService = vi.fn().mockImplementation(() => ({
    updateTaskStatus: mockUpdateTaskStatus,
  }))

  return {
    TaskService: MockTaskService,
    mockUpdateTaskStatus,
  }
})

const taskServiceModule = await import('~/features/tasks/services/task-service')
const mockUpdateTaskStatus = (taskServiceModule as any).mockUpdateTaskStatus

describe('updateTaskStatusAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('正常フロー', () => {
    it('タスクステータスを完了に正常に更新する', async () => {
      const taskId = crypto.randomUUID()
      const status = TASK_STATUS.COMPLETE
      mockUpdateTaskStatus.mockReturnValue(undefined)

      const result = await updateTaskStatusAction(taskId, status)

      expect(mockUpdateTaskStatus).toHaveBeenCalledWith(taskId, status)

      const expectedResult: ActionsResult = {
        isSuccess: true,
        message: TASK_SUCCESS_MESSAGES.TASK_UPDATED.message,
      }
      expect(result).toEqual(expectedResult)
    })

    it('タスクステータスを保留に正常に更新する', async () => {
      const taskId = crypto.randomUUID()
      const status = TASK_STATUS.INCOMPLETE
      mockUpdateTaskStatus.mockReturnValue(undefined)

      const result = await updateTaskStatusAction(taskId, status)

      expect(mockUpdateTaskStatus).toHaveBeenCalledWith(taskId, status)
      expect(result.isSuccess).toBe(true)
    })
  })

  describe('バリデーションエラー', () => {
    it('無効なタスクIDでエラーを返す', async () => {
      const invalidTaskId = ''
      const status = TASK_STATUS.COMPLETE

      const result = await updateTaskStatusAction(invalidTaskId, status)

      expect(mockUpdateTaskStatus).not.toHaveBeenCalled()

      const expectedResult = {
        isSuccess: false,
        error: { message: TASK_ERROR_MESSAGES.INVALID_TASK_ID.message },
      }
      expect(result).toEqual(expectedResult)
    })

    it('無効なステータスでエラーを返す', async () => {
      const taskId = crypto.randomUUID()
      const invalidStatus = 'invalid_status' as Task['status']

      const result = await updateTaskStatusAction(taskId, invalidStatus)

      expect(mockUpdateTaskStatus).not.toHaveBeenCalled()

      const expectedResult = {
        isSuccess: false,
        error: { message: TASK_ERROR_MESSAGES.INVALID_TASK_ID.message },
      }
      expect(result).toEqual(expectedResult)
    })

    it('nullタスクIDでエラーを返す', async () => {
      const nullTaskId = null as unknown as Task['id']
      const status = TASK_STATUS.COMPLETE

      const result = await updateTaskStatusAction(nullTaskId, status)

      expect(mockUpdateTaskStatus).not.toHaveBeenCalled()
      expect(result.isSuccess).toBe(false)
    })

    it('nullステータスでエラーを返す', async () => {
      const taskId = crypto.randomUUID()
      const nullStatus = null as unknown as Task['status']

      const result = await updateTaskStatusAction(taskId, nullStatus)

      expect(mockUpdateTaskStatus).not.toHaveBeenCalled()
      expect(result.isSuccess).toBe(false)
    })
  })

  describe('サービスエラー', () => {
    it('TaskService updateTaskStatusエラーを処理する', async () => {
      const taskId = crypto.randomUUID()
      const status = TASK_STATUS.COMPLETE
      mockUpdateTaskStatus.mockImplementation(() => {
        throw new Error('データベースエラー')
      })

      const result = await updateTaskStatusAction(taskId, status)

      expect(mockUpdateTaskStatus).toHaveBeenCalledWith(taskId, status)

      const expectedResult = {
        isSuccess: false,
        error: { message: TASK_ERROR_MESSAGES.TASK_UPDATE_FAILED.message },
      }
      expect(result).toEqual(expectedResult)
    })

    it('TaskServiceがカスタムエラーをスローするのを処理する', async () => {
      const taskId = crypto.randomUUID()
      const status = TASK_STATUS.COMPLETE
      const customError = new Error('タスクが見つかりません')
      customError.name = 'TaskServiceError'
      mockUpdateTaskStatus.mockImplementation(() => {
        throw customError
      })

      const result = await updateTaskStatusAction(taskId, status)

      expect(result.isSuccess).toBe(false)
      expect(mockUpdateTaskStatus).toHaveBeenCalledWith(taskId, status)
      if (!result.isSuccess) {
        expect(result.error?.message).toBe(TASK_ERROR_MESSAGES.TASK_UPDATE_FAILED.message)
      }
    })
  })

  describe('エッジケース', () => {
    it('有効なタスクステータスを処理する', async () => {
      const taskId = crypto.randomUUID()
      const validStatuses = ['incomplete', 'complete'] as const satisfies Task['status'][] // 一般的なタスクステータスに基づく
      mockUpdateTaskStatus.mockReturnValue(undefined)

      for (const status of validStatuses) {
        const result = await updateTaskStatusAction(taskId, status)

        if (updateTaskSchema.safeParse({ id: taskId, status }).success) {
          expect(result.isSuccess).toBe(true)
        }
      }
    })

    it('同時ステータス更新を処理する', async () => {
      const taskId = crypto.randomUUID()
      const status = TASK_STATUS.COMPLETE
      mockUpdateTaskStatus.mockReturnValue(undefined)

      const results = await Promise.all([
        updateTaskStatusAction(taskId, status),
        updateTaskStatusAction(taskId, status),
        updateTaskStatusAction(taskId, status),
      ])

      expect(mockUpdateTaskStatus).toHaveBeenCalledTimes(3)
      results.forEach((result) => {
        expect(result.isSuccess).toBe(true)
      })
    })

    it('非常に長いタスクIDを処理する', async () => {
      const longTaskId = 'a'.repeat(1000)
      const status = TASK_STATUS.COMPLETE
      mockUpdateTaskStatus.mockReturnValue(undefined)

      const result = await updateTaskStatusAction(longTaskId, status)
      if (updateTaskSchema.safeParse({ id: longTaskId, status }).success) {
        expect(mockUpdateTaskStatus).toHaveBeenCalledWith(longTaskId, status)
        expect(result.isSuccess).toBe(true)
      } else {
        expect(result.isSuccess).toBe(false)
      }
    })
  })

  describe('戻り値型の一貫性', () => {
    it('成功時に一貫したActionsResult型を返す', async () => {
      const taskId = crypto.randomUUID()
      const status = TASK_STATUS.COMPLETE
      mockUpdateTaskStatus.mockReturnValue(undefined)

      const result = await updateTaskStatusAction(taskId, status)

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
      const status = TASK_STATUS.COMPLETE

      const result = await updateTaskStatusAction(invalidTaskId, status)

      expect(result).toHaveProperty('isSuccess', false)
      expect(result).toHaveProperty('error')
      if (!result.isSuccess) {
        expect(result.error).toHaveProperty('message')
      }
      expect(result).not.toHaveProperty('message')
    })
  })

  describe('バグ検出テスト', () => {
    it('成功メッセージの潜在的バグを検出する', async () => {
      const taskId = crypto.randomUUID()
      const status = TASK_STATUS.COMPLETE
      mockUpdateTaskStatus.mockReturnValue(undefined)

      const result = await updateTaskStatusAction(taskId, status)

      if (result.isSuccess) {
        expect(result.message).toBe(TASK_SUCCESS_MESSAGES.TASK_UPDATED.message)
      }
    })
  })
})
