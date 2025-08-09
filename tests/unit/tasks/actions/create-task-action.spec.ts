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
    it('空文字のバリデーションエラー', async () => {
      const formData = new FormData()
      formData.append('title', '')

      const mockSubmission = {
        status: 'error' as const,
        reply: vi.fn().mockReturnValue({
          status: 'error',
          error: { title: ['タスクタイトルは1文字以上で入力してください'] },
        }),
      }

      mockParseWithZod.mockReturnValue(mockSubmission as any)

      const result = await createTaskAction(undefined, formData)

      expect(mockParseWithZod).toHaveBeenCalledWith(formData, { schema: expect.any(Object) })
      expect(mockCreateTask).not.toHaveBeenCalled()
      expect(mockRevalidateTag).not.toHaveBeenCalled()
      expect(mockSubmission.reply).toHaveBeenCalled()
      expect(result).toEqual({
        status: 'error',
        error: { title: ['タスクタイトルは1文字以上で入力してください'] },
      })
    })

    it('スペースのみ入力のバリデーションエラー', async () => {
      const formData = new FormData()
      formData.append('title', '   ') // スペースのみ

      const mockSubmission = {
        status: 'error' as const,
        reply: vi.fn().mockReturnValue({
          status: 'error',
          error: { title: ['タスクタイトルは1文字以上で入力してください'] },
        }),
      }

      mockParseWithZod.mockReturnValue(mockSubmission as any)

      const result = await createTaskAction(undefined, formData)

      expect(mockParseWithZod).toHaveBeenCalledWith(formData, { schema: expect.any(Object) })
      expect(mockCreateTask).not.toHaveBeenCalled()
      expect(mockRevalidateTag).not.toHaveBeenCalled()
      expect(mockSubmission.reply).toHaveBeenCalled()
      expect(result).toEqual({
        status: 'error',
        error: { title: ['タスクタイトルは1文字以上で入力してください'] },
      })
    })

    it('256文字以上の文字数バリデーションエラー', async () => {
      const longTitle = 'a'.repeat(256)
      const formData = new FormData()
      formData.append('title', longTitle)

      const mockSubmission = {
        status: 'error' as const,
        reply: vi.fn().mockReturnValue({
          status: 'error',
          error: { title: ['タスクタイトルは255文字以内で入力してください'] },
        }),
      }

      mockParseWithZod.mockReturnValue(mockSubmission as any)

      const result = await createTaskAction(undefined, formData)

      expect(mockParseWithZod).toHaveBeenCalledWith(formData, { schema: expect.any(Object) })
      expect(mockCreateTask).not.toHaveBeenCalled()
      expect(mockRevalidateTag).not.toHaveBeenCalled()
      expect(mockSubmission.reply).toHaveBeenCalled()
      expect(result).toEqual({
        status: 'error',
        error: { title: ['タスクタイトルは255文字以内で入力してください'] },
      })
    })

    it('非文字列型のバリデーションエラー', async () => {
      const formData = new FormData()
      // ファイルやその他の非文字列データを簡単なモックとして表現
      formData.append('title', '[object File]')

      const mockSubmission = {
        status: 'error' as const,
        reply: vi.fn().mockReturnValue({
          status: 'error',
          error: { title: ['タスクタイトルは文字列である必要があります'] },
        }),
      }

      mockParseWithZod.mockReturnValue(mockSubmission as any)

      const result = await createTaskAction(undefined, formData)

      expect(mockParseWithZod).toHaveBeenCalledWith(formData, { schema: expect.any(Object) })
      expect(mockCreateTask).not.toHaveBeenCalled()
      expect(mockRevalidateTag).not.toHaveBeenCalled()
      expect(mockSubmission.reply).toHaveBeenCalled()
      expect(result).toEqual({
        status: 'error',
        error: { title: ['タスクタイトルは文字列である必要があります'] },
      })
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

  describe('エッジケースと境界値テスト', () => {
    it('titleフィールドが無いFormData（undefined）を処理する', async () => {
      const formData = new FormData()
      // titleフィールドを追加しない

      const mockSubmission = {
        status: 'error' as const,
        reply: vi.fn().mockReturnValue({
          status: 'error',
          error: { title: ['タスクタイトルは1文字以上で入力してください'] },
        }),
      }

      mockParseWithZod.mockReturnValue(mockSubmission as any)

      const result = await createTaskAction(undefined, formData)

      expect(mockParseWithZod).toHaveBeenCalledWith(formData, { schema: expect.any(Object) })
      expect(mockSubmission.reply).toHaveBeenCalled()
      expect(result).toEqual({
        status: 'error',
        error: { title: ['タスクタイトルは1文字以上で入力してください'] },
      })
    })

    it('正確に255文字の入力を処理する（境界値）', async () => {
      const validTitle = 'a'.repeat(255)
      const formData = new FormData()
      formData.append('title', validTitle)

      const mockSubmission = {
        status: 'success' as const,
        value: { title: validTitle },
        reply: vi.fn().mockReturnValue({ status: 'success' }),
      }

      mockParseWithZod.mockReturnValue(mockSubmission as any)
      mockCreateTask.mockReturnValue(undefined)

      const result = await createTaskAction(undefined, formData)

      expect(mockParseWithZod).toHaveBeenCalledWith(formData, { schema: expect.any(Object) })
      expect(mockCreateTask).toHaveBeenCalledWith(validTitle)
      expect(mockRevalidateTag).toHaveBeenCalledWith(FETCH_ALL_TASKS_CACHE_KEY)
      expect(mockSubmission.reply).toHaveBeenCalled()
      expect(result).toEqual({ status: 'success' })
    })

    it('1文字の入力を処理する（最小境界値）', async () => {
      const validTitle = 'a'
      const formData = new FormData()
      formData.append('title', validTitle)

      const mockSubmission = {
        status: 'success' as const,
        value: { title: validTitle },
        reply: vi.fn().mockReturnValue({ status: 'success' }),
      }

      mockParseWithZod.mockReturnValue(mockSubmission as any)
      mockCreateTask.mockReturnValue(undefined)

      const result = await createTaskAction(undefined, formData)

      expect(mockParseWithZod).toHaveBeenCalledWith(formData, { schema: expect.any(Object) })
      expect(mockCreateTask).toHaveBeenCalledWith(validTitle)
      expect(mockRevalidateTag).toHaveBeenCalledWith(FETCH_ALL_TASKS_CACHE_KEY)
      expect(mockSubmission.reply).toHaveBeenCalled()
      expect(result).toEqual({ status: 'success' })
    })

    it('特殊文字を含む有効な入力を処理する', async () => {
      const validTitle = 'タスクタイトル😀あいうえお 123'
      const formData = new FormData()
      formData.append('title', validTitle)

      const mockSubmission = {
        status: 'success' as const,
        value: { title: validTitle },
        reply: vi.fn().mockReturnValue({ status: 'success' }),
      }

      mockParseWithZod.mockReturnValue(mockSubmission as any)
      mockCreateTask.mockReturnValue(undefined)

      const result = await createTaskAction(undefined, formData)

      expect(mockParseWithZod).toHaveBeenCalledWith(formData, { schema: expect.any(Object) })
      expect(mockCreateTask).toHaveBeenCalledWith(validTitle)
      expect(mockRevalidateTag).toHaveBeenCalledWith(FETCH_ALL_TASKS_CACHE_KEY)
      expect(mockSubmission.reply).toHaveBeenCalled()
      expect(result).toEqual({ status: 'success' })
    })

    it('トリム処理された文字列でのバリデーション', async () => {
      const inputTitle = '  タスクタイトル  ' // 前後にスペース
      const trimmedTitle = 'タスクタイトル'
      const formData = new FormData()
      formData.append('title', inputTitle)

      const mockSubmission = {
        status: 'success' as const,
        value: { title: trimmedTitle }, // トリムされた値
        reply: vi.fn().mockReturnValue({ status: 'success' }),
      }

      mockParseWithZod.mockReturnValue(mockSubmission as any)
      mockCreateTask.mockReturnValue(undefined)

      const result = await createTaskAction(undefined, formData)

      expect(mockParseWithZod).toHaveBeenCalledWith(formData, { schema: expect.any(Object) })
      expect(mockCreateTask).toHaveBeenCalledWith(trimmedTitle)
      expect(mockRevalidateTag).toHaveBeenCalledWith(FETCH_ALL_TASKS_CACHE_KEY)
      expect(mockSubmission.reply).toHaveBeenCalled()
      expect(result).toEqual({ status: 'success' })
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
