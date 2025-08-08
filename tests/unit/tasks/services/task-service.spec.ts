import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TASK_ERROR_MESSAGES } from '~/features/tasks/constants/validation'

vi.mock('~/db', () => ({
  db: {
    query: {
      tasks: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('drizzle-orm', () => ({
  desc: vi.fn().mockReturnValue('desc-function'),
  eq: vi.fn().mockReturnValue('eq-function'),
}))

vi.mock('~/db/schema', () => ({
  tasks: {
    createdAt: 'createdAt',
    status: 'status',
    id: 'id',
  },
}))

import { db } from '~/db'
import { TaskService } from '~/features/tasks/services/task-service'

const mockDb = vi.mocked(db)

describe('TaskService', () => {
  let taskService: TaskService

  beforeEach(() => {
    taskService = new TaskService()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getAllTasks', () => {
    it('すべてのタスクを正常に取得する', async () => {
      const mockTasks = [
        {
          id: '1',
          title: 'Test Task 1',
          status: 'incomplete' as const,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: null,
        },
        {
          id: '2',
          title: 'Test Task 2',
          status: 'complete' as const,
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: null,
        },
      ]

      vi.mocked(mockDb.query.tasks.findMany).mockResolvedValue(mockTasks)

      const result = await taskService.getAllTasks()

      expect(result).toEqual(mockTasks)
      expect(vi.mocked(mockDb.query.tasks.findMany)).toHaveBeenCalledTimes(1)
      expect(vi.mocked(mockDb.query.tasks.findMany)).toHaveBeenCalledWith({
        orderBy: 'desc-function',
      })
    })

    it('データベースエラーが発生した場合TaskServiceErrorをスローする', async () => {
      const dbError = new Error('Database connection failed')
      vi.mocked(mockDb.query.tasks.findMany).mockRejectedValue(dbError)

      await expect(taskService.getAllTasks()).rejects.toThrow('タスクの取得に失敗しました')
      await expect(taskService.getAllTasks()).rejects.toMatchObject({
        name: 'TaskServiceError',
        code: TASK_ERROR_MESSAGES.TASK_GET_FAILED.code,
        originalError: dbError,
      })
    })

    it('空の配列を返す場合', async () => {
      vi.mocked(mockDb.query.tasks.findMany).mockResolvedValue([])

      const result = await taskService.getAllTasks()

      expect(result).toEqual([])
      expect(vi.mocked(mockDb.query.tasks.findMany)).toHaveBeenCalledTimes(1)
    })
  })

  describe('getTasksByStatus', () => {
    it('指定されたステータスのタスクを正常に取得する', async () => {
      const mockTasks = [
        {
          id: '1',
          title: 'Incomplete Task',
          status: 'incomplete' as const,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: null,
        },
      ]

      vi.mocked(mockDb.query.tasks.findMany).mockResolvedValue(mockTasks)

      const result = await taskService.getTasksByStatus('incomplete')

      expect(result).toEqual(mockTasks)
      expect(vi.mocked(mockDb.query.tasks.findMany)).toHaveBeenCalledTimes(1)
    })

    it('completeステータスのタスクを正常に取得する', async () => {
      const mockTasks = [
        {
          id: '2',
          title: 'Complete Task',
          status: 'complete' as const,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: new Date('2024-01-01T12:00:00Z'),
        },
      ]

      vi.mocked(mockDb.query.tasks.findMany).mockResolvedValue(mockTasks)

      const result = await taskService.getTasksByStatus('complete')

      expect(result).toEqual(mockTasks)
      expect(vi.mocked(mockDb.query.tasks.findMany)).toHaveBeenCalledTimes(1)
    })

    it('データベースエラーが発生した場合TaskServiceErrorをスローする', async () => {
      const dbError = new Error('Query failed')
      vi.mocked(mockDb.query.tasks.findMany).mockRejectedValue(dbError)

      await expect(taskService.getTasksByStatus('incomplete')).rejects.toThrow(
        'タスクの取得に失敗しました',
      )
      await expect(taskService.getTasksByStatus('incomplete')).rejects.toMatchObject({
        name: 'TaskServiceError',
        code: TASK_ERROR_MESSAGES.TASK_GET_FAILED.code,
        originalError: dbError,
      })
    })

    it('指定されたステータスのタスクが存在しない場合空配列を返す', async () => {
      vi.mocked(mockDb.query.tasks.findMany).mockResolvedValue([])

      const result = await taskService.getTasksByStatus('complete')

      expect(result).toEqual([])
    })
  })

  describe('createTask', () => {
    it('新しいタスクを正常に作成する', async () => {
      const insertMock = {
        values: vi.fn(),
      }
      vi.mocked(mockDb.insert).mockReturnValue(insertMock as any)

      await taskService.createTask('New Task')

      expect(vi.mocked(mockDb.insert)).toHaveBeenCalledTimes(1)
      expect(vi.mocked(insertMock.values)).toHaveBeenCalledWith({
        title: 'New Task',
      })
    })

    it('タイトルの前後の空白をトリムして作成する', async () => {
      const insertMock = {
        values: vi.fn(),
      }
      vi.mocked(mockDb.insert).mockReturnValue(insertMock as any)

      await taskService.createTask('  Trimmed Task  ')

      expect(vi.mocked(insertMock.values)).toHaveBeenCalledWith({
        title: 'Trimmed Task',
      })
    })

    it('データベースエラーが発生した場合TaskServiceErrorをスローする', async () => {
      const dbError = new Error('Insert failed')
      const insertMock = {
        values: vi.fn().mockRejectedValue(dbError),
      }
      vi.mocked(mockDb.insert).mockReturnValue(insertMock as any)

      await expect(taskService.createTask('Failed Task')).rejects.toThrow(
        'タスクの作成に失敗しました',
      )
      await expect(taskService.createTask('Failed Task')).rejects.toMatchObject({
        name: 'TaskServiceError',
        code: TASK_ERROR_MESSAGES.TASK_CREATE_FAILED.code,
        originalError: dbError,
      })
    })

    it('空文字列のタイトルでもトリム後に作成される', async () => {
      const insertMock = {
        values: vi.fn(),
      }
      vi.mocked(mockDb.insert).mockReturnValue(insertMock as any)

      await taskService.createTask('   ')

      expect(vi.mocked(insertMock.values)).toHaveBeenCalledWith({
        title: '',
      })
    })
  })

  describe('updateTaskStatus', () => {
    it('タスクのステータスを正常に更新する', async () => {
      const mockTask = {
        id: 'task-1',
        title: 'Test Task',
        status: 'incomplete' as const,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: null,
      }

      vi.mocked(mockDb.query.tasks.findFirst).mockResolvedValue(mockTask)

      const whereMock = {
        returning: vi.fn(),
      }
      const updateMock = {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue(whereMock),
        }),
      }
      vi.mocked(mockDb.update).mockReturnValue(updateMock as any)

      await taskService.updateTaskStatus('task-1', 'complete')

      expect(vi.mocked(mockDb.query.tasks.findFirst)).toHaveBeenCalledTimes(1)
      expect(vi.mocked(mockDb.update)).toHaveBeenCalledTimes(1)
      expect(vi.mocked(updateMock.set)).toHaveBeenCalledWith({ status: 'complete' })
    })

    it('存在しないタスクIDの場合TaskServiceErrorをスローする', async () => {
      vi.mocked(mockDb.query.tasks.findFirst).mockResolvedValue(undefined)

      await expect(taskService.updateTaskStatus('non-existent', 'complete')).rejects.toThrow(
        'タスクが見つかりませんでした',
      )
      await expect(taskService.updateTaskStatus('non-existent', 'complete')).rejects.toMatchObject({
        name: 'TaskServiceError',
        code: TASK_ERROR_MESSAGES.TASK_NOT_FOUND.code,
      })
    })

    it('タスク検索でデータベースエラーが発生した場合TaskServiceErrorをスローする', async () => {
      const dbError = new Error('Find failed')
      vi.mocked(mockDb.query.tasks.findFirst).mockRejectedValue(dbError)

      await expect(taskService.updateTaskStatus('task-1', 'complete')).rejects.toThrow(
        'タスクのステータス更新に失敗しました。もう一度お試しください。',
      )
      await expect(taskService.updateTaskStatus('task-1', 'complete')).rejects.toMatchObject({
        name: 'TaskServiceError',
        code: TASK_ERROR_MESSAGES.TASK_UPDATE_FAILED.code,
        originalError: dbError,
      })
    })

    it('タスク更新でデータベースエラーが発生した場合TaskServiceErrorをスローする', async () => {
      const mockTask = {
        id: 'task-1',
        title: 'Test Task',
        status: 'incomplete' as const,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: null,
      }

      vi.mocked(mockDb.query.tasks.findFirst).mockResolvedValue(mockTask)

      const dbError = new Error('Update failed')
      const returningMock = vi.fn().mockRejectedValue(dbError)
      const whereMock = {
        returning: returningMock,
      }
      const updateMock = {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue(whereMock),
        }),
      }
      vi.mocked(mockDb.update).mockReturnValue(updateMock as any)

      await expect(taskService.updateTaskStatus('task-1', 'complete')).rejects.toThrow(
        'タスクのステータス更新に失敗しました。もう一度お試しください。',
      )
      await expect(taskService.updateTaskStatus('task-1', 'complete')).rejects.toMatchObject({
        name: 'TaskServiceError',
        code: TASK_ERROR_MESSAGES.TASK_UPDATE_FAILED.code,
        originalError: dbError,
      })
    })

    it('incompleteからcompleteへの更新', async () => {
      const mockTask = {
        id: 'task-1',
        title: 'Test Task',
        status: 'incomplete' as const,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: null,
      }

      vi.mocked(mockDb.query.tasks.findFirst).mockResolvedValue(mockTask)

      const whereMock = {
        returning: vi.fn(),
      }
      const updateMock = {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue(whereMock),
        }),
      }
      vi.mocked(mockDb.update).mockReturnValue(updateMock as any)

      await taskService.updateTaskStatus('task-1', 'complete')

      expect(vi.mocked(updateMock.set)).toHaveBeenCalledWith({ status: 'complete' })
    })

    it('completeからincompleteへの更新', async () => {
      const mockTask = {
        id: 'task-1',
        title: 'Test Task',
        status: 'complete' as const,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: new Date('2024-01-01T12:00:00Z'),
      }

      vi.mocked(mockDb.query.tasks.findFirst).mockResolvedValue(mockTask)

      const whereMock = {
        returning: vi.fn(),
      }
      const updateMock = {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue(whereMock),
        }),
      }
      vi.mocked(mockDb.update).mockReturnValue(updateMock as any)

      await taskService.updateTaskStatus('task-1', 'incomplete')

      expect(vi.mocked(updateMock.set)).toHaveBeenCalledWith({ status: 'incomplete' })
    })
  })

  describe('deleteTask', () => {
    it('タスクを正常に削除する', async () => {
      const mockTask = {
        id: 'task-1',
        title: 'Test Task',
        status: 'incomplete' as const,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: null,
      }

      vi.mocked(mockDb.query.tasks.findFirst).mockResolvedValue(mockTask)

      const deleteMock = {
        where: vi.fn(),
      }
      vi.mocked(mockDb.delete).mockReturnValue(deleteMock as any)

      await taskService.deleteTask('task-1')

      expect(vi.mocked(mockDb.query.tasks.findFirst)).toHaveBeenCalledTimes(1)
      expect(vi.mocked(mockDb.delete)).toHaveBeenCalledTimes(1)
      expect(vi.mocked(deleteMock.where)).toHaveBeenCalledTimes(1)
    })

    it('存在しないタスクIDの場合TaskServiceErrorをスローする', async () => {
      vi.mocked(mockDb.query.tasks.findFirst).mockResolvedValue(undefined)

      await expect(taskService.deleteTask('non-existent')).rejects.toThrow(
        'タスクが見つかりませんでした',
      )
      await expect(taskService.deleteTask('non-existent')).rejects.toMatchObject({
        name: 'TaskServiceError',
        code: TASK_ERROR_MESSAGES.TASK_NOT_FOUND.code,
      })
    })

    it('タスク検索でデータベースエラーが発生した場合TaskServiceErrorをスローする', async () => {
      const dbError = new Error('Find failed')
      vi.mocked(mockDb.query.tasks.findFirst).mockRejectedValue(dbError)

      await expect(taskService.deleteTask('task-1')).rejects.toThrow(
        'タスクの削除に失敗しました。もう一度お試しください。',
      )
      await expect(taskService.deleteTask('task-1')).rejects.toMatchObject({
        name: 'TaskServiceError',
        code: TASK_ERROR_MESSAGES.TASK_DELETE_FAILED.code,
        originalError: dbError,
      })
    })

    it('タスク削除でデータベースエラーが発生した場合TaskServiceErrorをスローする', async () => {
      const mockTask = {
        id: 'task-1',
        title: 'Test Task',
        status: 'incomplete' as const,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: null,
      }

      vi.mocked(mockDb.query.tasks.findFirst).mockResolvedValue(mockTask)

      const dbError = new Error('Delete failed')
      const deleteMock = {
        where: vi.fn().mockRejectedValue(dbError),
      }
      vi.mocked(mockDb.delete).mockReturnValue(deleteMock as any)

      await expect(taskService.deleteTask('task-1')).rejects.toThrow(
        'タスクの削除に失敗しました。もう一度お試しください。',
      )
      await expect(taskService.deleteTask('task-1')).rejects.toMatchObject({
        name: 'TaskServiceError',
        code: TASK_ERROR_MESSAGES.TASK_DELETE_FAILED.code,
        originalError: dbError,
      })
    })

    it('completeステータスのタスクも削除できる', async () => {
      const mockTask = {
        id: 'task-1',
        title: 'Completed Task',
        status: 'complete' as const,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: new Date('2024-01-01T12:00:00Z'),
      }

      vi.mocked(mockDb.query.tasks.findFirst).mockResolvedValue(mockTask)

      const deleteMock = {
        where: vi.fn(),
      }
      vi.mocked(mockDb.delete).mockReturnValue(deleteMock as any)

      await taskService.deleteTask('task-1')

      expect(vi.mocked(mockDb.query.tasks.findFirst)).toHaveBeenCalledTimes(1)
      expect(vi.mocked(mockDb.delete)).toHaveBeenCalledTimes(1)
      expect(vi.mocked(deleteMock.where)).toHaveBeenCalledTimes(1)
    })
  })

  describe('TaskServiceError', () => {
    it('TaskServiceErrorが適切なプロパティを持つ', async () => {
      const dbError = new Error('Test error')
      vi.mocked(mockDb.query.tasks.findMany).mockRejectedValue(dbError)

      try {
        await taskService.getAllTasks()
      } catch (error: any) {
        expect(error.name).toBe('TaskServiceError')
        expect(error.message).toBe('タスクの取得に失敗しました')
        expect(error.code).toBe('FETCH_ERROR')
        expect(error.originalError).toEqual(dbError)
      }
    })

    it('originalErrorが省略可能である', async () => {
      vi.mocked(mockDb.query.tasks.findFirst).mockResolvedValue(undefined)

      try {
        await taskService.updateTaskStatus('non-existent', 'complete')
      } catch (error: any) {
        expect(error.name).toBe('TaskServiceError')
        expect(error.message).toBe('タスクが見つかりませんでした')
        expect(error.code).toBe('NOT_FOUND_ERROR')
        expect(error.originalError).toBeUndefined()
      }
    })
  })

  describe('エッジケース', () => {
    it('getAllTasks: 大量のタスクが返される場合', async () => {
      const largeMockTasks = Array.from({ length: 1000 }, (_, i) => ({
        id: `task-${i}`,
        title: `Task ${i}`,
        status: i % 2 === 0 ? ('incomplete' as const) : ('complete' as const),
        createdAt: `2024-01-${String((i % 30) + 1).padStart(2, '0')}T00:00:00Z`,
        updatedAt: null,
      }))

      vi.mocked(mockDb.query.tasks.findMany).mockResolvedValue(largeMockTasks)

      const result = await taskService.getAllTasks()

      expect(result).toHaveLength(1000)
      expect(result[0].id).toBe('task-0')
    })

    it('createTask: 非常に長いタイトルでの作成', async () => {
      const longTitle = 'a'.repeat(1000)
      const insertMock = {
        values: vi.fn(),
      }
      vi.mocked(mockDb.insert).mockReturnValue(insertMock as any)

      await taskService.createTask(longTitle)

      expect(vi.mocked(insertMock.values)).toHaveBeenCalledWith({
        title: longTitle,
      })
    })

    it('updateTaskStatus: 既に同じステータスのタスクを更新', async () => {
      const mockTask = {
        id: 'task-1',
        title: 'Test Task',
        status: 'complete' as const,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: new Date('2024-01-01T12:00:00Z'),
      }

      vi.mocked(mockDb.query.tasks.findFirst).mockResolvedValue(mockTask)

      const whereMock = {
        returning: vi.fn(),
      }
      const updateMock = {
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue(whereMock),
        }),
      }
      vi.mocked(mockDb.update).mockReturnValue(updateMock as any)

      await taskService.updateTaskStatus('task-1', 'complete')

      expect(vi.mocked(updateMock.set)).toHaveBeenCalledWith({ status: 'complete' })
    })
  })
})
