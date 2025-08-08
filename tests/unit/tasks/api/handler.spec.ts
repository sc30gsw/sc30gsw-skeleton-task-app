import type { RouteHandler } from '@hono/zod-openapi'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { mockTaskServiceInstance } = vi.hoisted(() => {
  const createMockTaskService = () => ({
    getAllTasks: vi.fn(),
  })

  const mockTaskServiceInstance = createMockTaskService()

  return { mockTaskServiceInstance }
})

vi.mock('~/features/tasks/services/task-service', () => ({
  TaskService: vi.fn().mockImplementation(() => mockTaskServiceInstance),
}))

import { getTasksHandler } from '~/features/tasks/api/handler'
import type { getTasksRoute } from '~/features/tasks/api/route'

describe('getTasksHandler', () => {
  let mockContext: any

  beforeEach(() => {
    mockContext = {
      json: vi.fn(),
    }

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('正常ケース', () => {
    it('タスク一覧を正常に取得して200レスポンスを返す', async () => {
      const mockTasks = [
        {
          id: '1',
          title: 'Test Task 1',
          status: 'incomplete',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: null,
        },
        {
          id: '2',
          title: 'Test Task 2',
          status: 'complete',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: new Date('2024-01-02T12:00:00Z'),
        },
      ]

      mockTaskServiceInstance.getAllTasks.mockResolvedValue(mockTasks)

      await getTasksHandler(mockContext)

      expect(mockTaskServiceInstance.getAllTasks).toHaveBeenCalledTimes(1)
      expect(mockTaskServiceInstance.getAllTasks).toHaveBeenCalledWith()
      expect(mockContext.json).toHaveBeenCalledTimes(1)
      expect(mockContext.json).toHaveBeenCalledWith(mockTasks, 200)
    })

    it('空のタスク配列を正常に返す', async () => {
      mockTaskServiceInstance.getAllTasks.mockResolvedValue([])

      await getTasksHandler(mockContext)

      expect(mockTaskServiceInstance.getAllTasks).toHaveBeenCalledTimes(1)
      expect(mockContext.json).toHaveBeenCalledWith([], 200)
    })

    it('大量のタスクを正常に処理する', async () => {
      const largeMockTasks = Array.from({ length: 100 }, (_, i) => ({
        id: `task-${i}`,
        title: `Task ${i}`,
        status: i % 2 === 0 ? 'incomplete' : 'complete',
        createdAt: `2024-01-${String((i % 30) + 1).padStart(2, '0')}T00:00:00Z`,
        updatedAt: i % 2 === 0 ? null : new Date(),
      }))

      mockTaskServiceInstance.getAllTasks.mockResolvedValue(largeMockTasks)

      await getTasksHandler(mockContext)

      expect(mockTaskServiceInstance.getAllTasks).toHaveBeenCalledTimes(1)
      expect(mockContext.json).toHaveBeenCalledWith(largeMockTasks, 200)
    })
  })

  describe('エラーケース', () => {
    it('TaskServiceでエラーが発生した場合500レスポンスを返す', async () => {
      const serviceError = new Error('Database connection failed')
      mockTaskServiceInstance.getAllTasks.mockRejectedValue(serviceError)

      await getTasksHandler(mockContext)

      expect(mockTaskServiceInstance.getAllTasks).toHaveBeenCalledTimes(1)
      expect(mockContext.json).toHaveBeenCalledTimes(1)
      expect(mockContext.json).toHaveBeenCalledWith({ error: 'タスクの取得に失敗しました' }, 500)
    })

    it('TaskServiceErrorが発生した場合500レスポンスを返す', async () => {
      const taskServiceError = {
        name: 'TaskServiceError',
        message: 'タスクの取得に失敗しました',
        code: 'TASK_GET_FAILED',
        originalError: new Error('DB Error'),
      }
      mockTaskServiceInstance.getAllTasks.mockRejectedValue(taskServiceError)

      await getTasksHandler(mockContext)

      expect(mockTaskServiceInstance.getAllTasks).toHaveBeenCalledTimes(1)
      expect(mockContext.json).toHaveBeenCalledWith({ error: 'タスクの取得に失敗しました' }, 500)
    })

    it('予期しないエラーが発生した場合500レスポンスを返す', async () => {
      const unexpectedError = new TypeError('Unexpected error')
      mockTaskServiceInstance.getAllTasks.mockRejectedValue(unexpectedError)

      await getTasksHandler(mockContext)

      expect(mockTaskServiceInstance.getAllTasks).toHaveBeenCalledTimes(1)
      expect(mockContext.json).toHaveBeenCalledWith({ error: 'タスクの取得に失敗しました' }, 500)
    })

    it('nullが返された場合500レスポンスを返す', async () => {
      mockTaskServiceInstance.getAllTasks.mockRejectedValue(null)

      await getTasksHandler(mockContext)

      expect(mockTaskServiceInstance.getAllTasks).toHaveBeenCalledTimes(1)
      expect(mockContext.json).toHaveBeenCalledWith({ error: 'タスクの取得に失敗しました' }, 500)
    })

    it('undefinedが返された場合500レスポンスを返す', async () => {
      mockTaskServiceInstance.getAllTasks.mockRejectedValue(undefined)

      await getTasksHandler(mockContext)

      expect(mockTaskServiceInstance.getAllTasks).toHaveBeenCalledTimes(1)
      expect(mockContext.json).toHaveBeenCalledWith({ error: 'タスクの取得に失敗しました' }, 500)
    })
  })

  describe('型安全性とインターフェース', () => {
    it('ハンドラーがRouteHandlerの型に適合する', () => {
      // Type check: This should not cause TypeScript errors
      const handler: RouteHandler<typeof getTasksRoute> = getTasksHandler
      expect(handler).toBeDefined()
    })

    it('コンテキストパラメータが正しく処理される', async () => {
      const contextParam = mockContext as Parameters<RouteHandler<typeof getTasksRoute>>[0]

      mockTaskServiceInstance.getAllTasks.mockResolvedValue([])

      await getTasksHandler(contextParam)

      expect(mockTaskServiceInstance.getAllTasks).toHaveBeenCalled()
    })
  })

  describe('パフォーマンステスト', () => {
    it('レスポンス時間が適切な範囲内である', async () => {
      const mockTasks = Array.from({ length: 10 }, (_, i) => ({
        id: `task-${i}`,
        title: `Task ${i}`,
        status: 'incomplete',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: null,
      }))

      mockTaskServiceInstance.getAllTasks.mockResolvedValue(mockTasks)

      const startTime = Date.now()
      await getTasksHandler(mockContext)
      const endTime = Date.now()

      const responseTime = endTime - startTime
      expect(responseTime).toBeLessThan(100) // 100ms以内
    })

    it('複数回呼び出しても一貫性がある', async () => {
      const mockTasks = [
        {
          id: '1',
          title: 'Consistent Task',
          status: 'incomplete',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: null,
        },
      ]

      mockTaskServiceInstance.getAllTasks.mockResolvedValue(mockTasks)

      // 複数回実行
      await getTasksHandler(mockContext)
      await getTasksHandler(mockContext)
      await getTasksHandler(mockContext)

      expect(mockTaskServiceInstance.getAllTasks).toHaveBeenCalledTimes(3)
      expect(mockContext.json).toHaveBeenCalledTimes(3)
      expect(mockContext.json).toHaveBeenNthCalledWith(1, mockTasks, 200)
      expect(mockContext.json).toHaveBeenNthCalledWith(2, mockTasks, 200)
      expect(mockContext.json).toHaveBeenNthCalledWith(3, mockTasks, 200)
    })
  })

  describe('レスポンス形式検証', () => {
    it('成功時のレスポンス形式が正しい', async () => {
      const mockTasks = [
        {
          id: '1',
          title: 'Test Task',
          status: 'incomplete',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: null,
        },
      ]

      mockTaskServiceInstance.getAllTasks.mockResolvedValue(mockTasks)

      await getTasksHandler(mockContext)

      expect(mockContext.json).toHaveBeenCalledWith(mockTasks, 200)
    })

    it('エラー時のレスポンス形式が正しい', async () => {
      mockTaskServiceInstance.getAllTasks.mockRejectedValue(new Error('Test error'))

      await getTasksHandler(mockContext)

      expect(mockContext.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
        }),
        500,
      )
    })
  })
})
