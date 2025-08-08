import type { SubmissionResult } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod/v4'
import { revalidateTag } from 'next/cache'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FETCH_ALL_TASKS_CACHE_KEY } from '~/constants/cache-keys'
import { createTaskAction } from '~/features/tasks/actions/create-task-action'
import { TASK_ERROR_MESSAGES } from '~/features/tasks/constants/validation'

vi.mock('next/cache')
vi.mock('@conform-to/zod/v4')
vi.mock('~/db/index.ts', () => ({
  db: {},
}))

vi.mock('~/features/tasks/services/task-service', () => {
  const mockCreateTask = vi.fn()
  const MockTaskService = vi.fn().mockImplementation(() => ({
    createTask: mockCreateTask,
  }))

  return {
    TaskService: MockTaskService,
    __mockCreateTask: mockCreateTask,
  }
})

const mockRevalidateTag = vi.mocked(revalidateTag)
const mockParseWithZod = vi.mocked(parseWithZod)

describe('createTaskAction', () => {
  let mockCreateTask: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    vi.clearAllMocks()

    const module = await import('~/features/tasks/services/task-service')
    mockCreateTask = (module as any).__mockCreateTask
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('正常フロー', () => {
    it('タスクの作成とキャッシュの再検証が成功する', async () => {
      const formData = new FormData()
      formData.append('title', 'テストタスク')

      const mockSubmission = {
        status: 'success' as const,
        value: { title: 'テストタスク' },
        reply: vi.fn().mockReturnValue({ status: 'success' }),
      }

      mockParseWithZod.mockReturnValue(mockSubmission as any)
      // 注意: 元のコードはcreateTaskをawaitしないが、それでもサービスを呼び出す
      mockCreateTask.mockReturnValue(undefined)

      const result = await createTaskAction(undefined, formData)

      expect(mockParseWithZod).toHaveBeenCalledWith(formData, { schema: expect.any(Object) })
      expect(mockCreateTask).toHaveBeenCalledWith('テストタスク')
      expect(mockRevalidateTag).toHaveBeenCalledWith(FETCH_ALL_TASKS_CACHE_KEY)
      expect(mockSubmission.reply).toHaveBeenCalled()
      expect(result).toEqual({ status: 'success' })
    })
  })

  describe('バリデーションエラー', () => {
    it('バリデーションが失敗した時にsubmission replyを返す', async () => {
      const formData = new FormData()
      formData.append('title', '') // 無効な空のタイトル

      const mockSubmission = {
        status: 'error' as const,
        reply: vi.fn().mockReturnValue({ status: 'error', error: { title: ['必須'] } }),
      }

      mockParseWithZod.mockReturnValue(mockSubmission as any)

      const result = await createTaskAction(undefined, formData)

      expect(mockParseWithZod).toHaveBeenCalledWith(formData, { schema: expect.any(Object) })
      expect(mockCreateTask).not.toHaveBeenCalled()
      expect(mockRevalidateTag).not.toHaveBeenCalled()
      expect(mockSubmission.reply).toHaveBeenCalled()
      expect(result).toEqual({ status: 'error', error: { title: ['必須'] } })
    })
  })

  describe('サービスエラー', () => {
    it('TaskService createTaskエラーを処理する', async () => {
      const formData = new FormData()
      formData.append('title', 'テストタスク')

      const mockSubmission = {
        status: 'success' as const,
        value: { title: 'テストタスク' },
        reply: vi.fn(),
      }

      mockParseWithZod.mockReturnValue(mockSubmission as any)
      mockCreateTask.mockImplementation(() => {
        throw new Error('データベースエラー')
      })

      const result = await createTaskAction(undefined, formData)

      expect(mockCreateTask).toHaveBeenCalledWith('テストタスク')
      expect(mockRevalidateTag).not.toHaveBeenCalled()
      expect(mockSubmission.reply).not.toHaveBeenCalled()

      const expectedResult = {
        status: 'error',
        error: { message: [TASK_ERROR_MESSAGES.TASK_CREATE_FAILED.message] },
      } as const satisfies SubmissionResult
      expect(result).toEqual(expectedResult)
    })
  })

  describe('エッジケース', () => {
    it('titleフィールドが無いFormDataを処理する', async () => {
      const formData = new FormData()

      const mockSubmission = {
        status: 'error' as const,
        reply: vi.fn().mockReturnValue({ status: 'error', error: { title: ['必須'] } }),
      }

      mockParseWithZod.mockReturnValue(mockSubmission as any)

      const result = await createTaskAction(undefined, formData)

      expect(mockParseWithZod).toHaveBeenCalledWith(formData, { schema: expect.any(Object) })
      expect(mockSubmission.reply).toHaveBeenCalled()
      expect(result).toEqual({ status: 'error', error: { title: ['必須'] } })
    })

    it('null/undefinedのFormData値を処理する', async () => {
      const formData = new FormData()
      formData.append('title', 'null')

      const mockSubmission = {
        status: 'error' as const,
        reply: vi.fn().mockReturnValue({ status: 'error', error: { title: ['無効'] } }),
      }

      mockParseWithZod.mockReturnValue(mockSubmission as any)

      await createTaskAction(undefined, formData)

      expect(mockSubmission.reply).toHaveBeenCalled()
    })
  })

  describe('状態管理', () => {
    it('TaskServiceが失敗した時にキャッシュを再検証しない', async () => {
      const formData = new FormData()
      formData.append('title', 'テストタスク')

      const mockSubmission = {
        status: 'success' as const,
        value: { title: 'テストタスク' },
        reply: vi.fn(),
      }

      mockParseWithZod.mockReturnValue(mockSubmission as any)
      mockCreateTask.mockImplementation(() => {
        throw new Error('サービスエラー')
      })

      await createTaskAction(undefined, formData)

      expect(mockRevalidateTag).not.toHaveBeenCalled()
    })
  })
})
