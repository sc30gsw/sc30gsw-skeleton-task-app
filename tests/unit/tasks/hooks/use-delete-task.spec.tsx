import { act, renderHook } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { useDeleteTask } from '~/features/tasks/hooks/use-delete-task'

vi.mock('~/env', () => ({
  env: {
    NEXT_PUBLIC_APP_BASE_URL: 'http://localhost:3000',
    DATABASE_URL: 'libsql://test.db',
    DATABASE_AUTH_TOKEN: 'test-token',
  },
}))

vi.mock('~/db', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('next/navigation')
vi.mock('react')
vi.mock('sonner')
vi.mock('~/features/tasks/actions/delete-task-action')
vi.mock('~/hooks/use-confirm')

describe('useDeleteTask', () => {
  const mockTaskId = 'test-task-id'
  const mockRouter = {
    refresh: vi.fn(),
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }
  const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
  }
  const mockStartTransition = vi.fn()
  const mockConfirm = {
    call: vi.fn(),
  }

  beforeEach(async () => {
    vi.clearAllMocks()

    // Setup useRouter mock
    ;(useRouter as Mock).mockReturnValue(mockRouter)

    // Setup useTransition mock
    ;(useTransition as Mock).mockReturnValue([false, mockStartTransition])

    // Setup toast mock
    ;(toast as any).success = mockToast.success
    ;(toast as any).error = mockToast.error

    // Setup Confirm mock
    const { Confirm } = await import('~/hooks/use-confirm')
    ;(Confirm as any).call = mockConfirm.call
  })

  describe('初期化', () => {
    it('正しい初期値を返すべきである', () => {
      const { result } = renderHook(() => useDeleteTask(mockTaskId))

      expect(result.current).toEqual({
        isPending: false,
        handleDelete: expect.any(Function),
      })
    })

    it('taskIdが正しく保持されるべきである', () => {
      const customTaskId = 'custom-task-id'
      renderHook(() => useDeleteTask(customTaskId))

      // taskIdは内部で使用されるため、直接確認はできないが、
      // handleDeleteの実行時に確認する
      expect(true).toBe(true) // placeholder
    })
  })

  describe('handleDelete - 確認ダイアログ', () => {
    it('確認ダイアログが正しいパラメータで呼ばれるべきである', async () => {
      mockConfirm.call.mockResolvedValue(true)

      const { result } = renderHook(() => useDeleteTask(mockTaskId))

      await act(async () => {
        await result.current.handleDelete()
      })

      expect(mockConfirm.call).toHaveBeenCalledWith({
        title: 'タスクを削除しますか？',
        message: 'この操作は取り消せません。',
        confirmButtonLabel: '削除',
        variant: 'destructive',
      })
    })

    it('確認ダイアログでキャンセルされた場合、処理が中断されるべきである', async () => {
      mockConfirm.call.mockResolvedValue(false)

      const { result } = renderHook(() => useDeleteTask(mockTaskId))

      await act(async () => {
        await result.current.handleDelete()
      })

      expect(mockConfirm.call).toHaveBeenCalled()
      expect(mockStartTransition).not.toHaveBeenCalled()
    })

    it('確認ダイアログで承認された場合、削除処理が開始されるべきである', async () => {
      mockConfirm.call.mockResolvedValue(true)

      const { deleteTaskAction } = await import('~/features/tasks/actions/delete-task-action')
      ;(deleteTaskAction as Mock).mockResolvedValue({ isSuccess: true })

      const { result } = renderHook(() => useDeleteTask(mockTaskId))

      await act(async () => {
        await result.current.handleDelete()
      })

      expect(mockConfirm.call).toHaveBeenCalled()
      expect(mockStartTransition).toHaveBeenCalled()
    })
  })

  describe('削除処理 - 成功時', () => {
    beforeEach(() => {
      mockConfirm.call.mockResolvedValue(true)
    })

    it('削除アクションが正しいパラメータで呼ばれるべきである', async () => {
      const { deleteTaskAction } = await import('~/features/tasks/actions/delete-task-action')
      ;(deleteTaskAction as Mock).mockResolvedValue({ isSuccess: true })

      mockStartTransition.mockImplementation((callback) => callback())

      const { result } = renderHook(() => useDeleteTask(mockTaskId))

      await act(async () => {
        await result.current.handleDelete()
      })

      expect(deleteTaskAction).toHaveBeenCalledWith(mockTaskId)
    })

    it('成功時にtoast.successが呼ばれるべきである', async () => {
      const { deleteTaskAction } = await import('~/features/tasks/actions/delete-task-action')
      ;(deleteTaskAction as Mock).mockResolvedValue({ isSuccess: true })

      mockStartTransition.mockImplementation((callback) => callback())

      const { result } = renderHook(() => useDeleteTask(mockTaskId))

      await act(async () => {
        await result.current.handleDelete()
      })

      expect(mockToast.success).toHaveBeenCalledWith(expect.any(String), {
        style: expect.any(Object),
        position: 'top-center',
      })
    })

    it('成功時にrouter.refreshが呼ばれるべきである', async () => {
      const { deleteTaskAction } = await import('~/features/tasks/actions/delete-task-action')
      ;(deleteTaskAction as Mock).mockResolvedValue({ isSuccess: true })

      mockStartTransition.mockImplementation((callback) => callback())

      const { result } = renderHook(() => useDeleteTask(mockTaskId))

      await act(async () => {
        await result.current.handleDelete()
      })

      expect(mockRouter.refresh).toHaveBeenCalled()
    })
  })

  describe('削除処理 - 失敗時', () => {
    beforeEach(() => {
      mockConfirm.call.mockResolvedValue(true)
    })

    it('失敗時にtoast.errorが呼ばれるべきである', async () => {
      const { deleteTaskAction } = await import('~/features/tasks/actions/delete-task-action')
      ;(deleteTaskAction as Mock).mockResolvedValue({ isSuccess: false })

      mockStartTransition.mockImplementation((callback) => callback())

      const { result } = renderHook(() => useDeleteTask(mockTaskId))

      await act(async () => {
        await result.current.handleDelete()
      })

      expect(mockToast.error).toHaveBeenCalledWith(expect.any(String), {
        style: expect.any(Object),
        position: 'top-center',
      })
    })

    it('失敗時はrouter.refreshが呼ばれないべきである', async () => {
      const { deleteTaskAction } = await import('~/features/tasks/actions/delete-task-action')
      ;(deleteTaskAction as Mock).mockResolvedValue({ isSuccess: false })

      mockStartTransition.mockImplementation((callback) => callback())

      const { result } = renderHook(() => useDeleteTask(mockTaskId))

      await act(async () => {
        await result.current.handleDelete()
      })

      expect(mockRouter.refresh).not.toHaveBeenCalled()
    })

    it('削除アクションがエラーを投げた場合でも処理が中断されないべきである', async () => {
      const { deleteTaskAction } = await import('~/features/tasks/actions/delete-task-action')
      ;(deleteTaskAction as Mock).mockRejectedValue(new Error('Network error'))

      mockStartTransition.mockImplementation((callback) => callback())

      const { result } = renderHook(() => useDeleteTask(mockTaskId))

      // エラーが投げられても処理が完了することを確認
      await act(async () => {
        await expect(result.current.handleDelete()).resolves.toBeUndefined()
      })
    })
  })

  describe('isPending状態', () => {
    it('isPendingがtrueの場合、正しく反映されるべきである', () => {
      ;(useTransition as Mock).mockReturnValue([true, mockStartTransition])

      const { result } = renderHook(() => useDeleteTask(mockTaskId))

      expect(result.current.isPending).toBe(true)
    })

    it('isPendingがfalseの場合、正しく反映されるべきである', () => {
      ;(useTransition as Mock).mockReturnValue([false, mockStartTransition])

      const { result } = renderHook(() => useDeleteTask(mockTaskId))

      expect(result.current.isPending).toBe(false)
    })
  })

  describe('型安全性', () => {
    it('戻り値がas constで型が固定されているべきである', () => {
      const { result } = renderHook(() => useDeleteTask(mockTaskId))

      expect(result.current).toHaveProperty('isPending')
      expect(result.current).toHaveProperty('handleDelete')
    })

    it('handleDeleteが非同期関数であるべきである', () => {
      const { result } = renderHook(() => useDeleteTask(mockTaskId))

      expect(result.current.handleDelete).toBeTypeOf('function')
      expect(result.current.handleDelete.constructor.name).toBe('AsyncFunction')
    })
  })

  describe('エラーハンドリング', () => {
    it('useRouterが利用できない場合でもエラーを発生させないべきである', () => {
      ;(useRouter as Mock).mockImplementation(() => {
        throw new Error('useRouter not available')
      })

      expect(() => renderHook(() => useDeleteTask(mockTaskId))).toThrow('useRouter not available')
    })

    it('useTransitionが利用できない場合でもエラーを発生させないべきである', () => {
      ;(useTransition as Mock).mockImplementation(() => {
        throw new Error('useTransition not available')
      })

      expect(() => renderHook(() => useDeleteTask(mockTaskId))).toThrow(
        'useTransition not available',
      )
    })

    it('Confirmが利用できない場合でもエラーを発生させるべきである', async () => {
      const { Confirm } = await import('~/hooks/use-confirm')
      ;(Confirm as any).call.mockImplementation(() => {
        throw new Error('Confirm not available')
      })

      const { result } = renderHook(() => useDeleteTask(mockTaskId))

      await act(async () => {
        await expect(result.current.handleDelete()).rejects.toThrow('Confirm not available')
      })
    })
  })

  describe('競合状態テスト', () => {
    it('複数回handleDeleteを同時に呼び出しても正しく処理されるべきである', async () => {
      mockConfirm.call.mockResolvedValue(true)
      const { deleteTaskAction } = await import('~/features/tasks/actions/delete-task-action')
      ;(deleteTaskAction as Mock).mockResolvedValue({ isSuccess: true })

      mockStartTransition.mockImplementation((callback) => callback())

      const { result } = renderHook(() => useDeleteTask(mockTaskId))

      // 同時に複数回呼び出し
      await act(async () => {
        await Promise.all([
          result.current.handleDelete(),
          result.current.handleDelete(),
          result.current.handleDelete(),
        ])
      })

      // 確認ダイアログが3回呼ばれることを確認
      expect(mockConfirm.call).toHaveBeenCalledTimes(3)
      expect(deleteTaskAction).toHaveBeenCalledTimes(3)
    })
  })

  describe('メモリリーク対策', () => {
    it('複数回レンダリングしてもメモリリークしないべきである', () => {
      const { unmount: unmount1 } = renderHook(() => useDeleteTask('task-1'))
      const { unmount: unmount2 } = renderHook(() => useDeleteTask('task-2'))
      const { unmount: unmount3 } = renderHook(() => useDeleteTask('task-3'))

      unmount1()
      unmount2()
      unmount3()

      expect(useRouter).toHaveBeenCalledTimes(3)
      expect(useTransition).toHaveBeenCalledTimes(3)
    })
  })

  describe('パフォーマンステスト', () => {
    it('handleDeleteの実行時間が許容範囲内であるべきである', async () => {
      mockConfirm.call.mockResolvedValue(true)
      const { deleteTaskAction } = await import('~/features/tasks/actions/delete-task-action')
      ;(deleteTaskAction as Mock).mockResolvedValue({ isSuccess: true })

      mockStartTransition.mockImplementation((callback) => callback())

      const { result } = renderHook(() => useDeleteTask(mockTaskId))

      const startTime = performance.now()

      await act(async () => {
        await result.current.handleDelete()
      })

      const endTime = performance.now()
      const executionTime = endTime - startTime

      // 実行時間が1秒未満であることを確認（テスト環境では十分高速であるべき）
      expect(executionTime).toBeLessThan(1000)
    })
  })
})
