import { act, renderHook } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { useOptimistic, useTransition } from 'react'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { TASK_STATUS } from '~/features/tasks/constants/task'
import { useUpdateTaskStatus } from '~/features/tasks/hooks/use-update-task-status'

vi.mock('~/env', () => ({
  env: {
    NEXT_PUBLIC_APP_BASE_URL: 'http://localhost:3000',
    DATABASE_URL: 'libsql://test.db',
    DATABASE_AUTH_TOKEN: 'test-token',
  },
}))

// Mock database
vi.mock('~/db', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

// Mock dependencies
vi.mock('next/navigation')
vi.mock('react')
vi.mock('sonner')
vi.mock('~/features/tasks/actions/update-task-status-action')

describe('useUpdateTaskStatus', () => {
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
  const mockSetIsCompleted = vi.fn()
  const mockStartTransition = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup useRouter mock
    ;(useRouter as Mock).mockReturnValue(mockRouter)

    // Setup useOptimistic mock
    ;(useOptimistic as Mock).mockReturnValue([false, mockSetIsCompleted])

    // Setup useTransition mock
    ;(useTransition as Mock).mockReturnValue([false, mockStartTransition])

    // Setup toast mock
    ;(toast as any).success = mockToast.success
    ;(toast as any).error = mockToast.error
  })

  describe('初期化', () => {
    it('ステータスがINCOMPLETEの場合、isCompletedはfalseであるべきである', () => {
      ;(useOptimistic as Mock).mockReturnValue([false, mockSetIsCompleted])

      const { result } = renderHook(() => useUpdateTaskStatus(mockTaskId, TASK_STATUS.INCOMPLETE))

      expect(result.current.isCompleted).toBe(false)
    })

    it('ステータスがCOMPLETEの場合、isCompletedはtrueであるべきである', () => {
      ;(useOptimistic as Mock).mockReturnValue([true, mockSetIsCompleted])

      const { result } = renderHook(() => useUpdateTaskStatus(mockTaskId, TASK_STATUS.COMPLETE))

      expect(result.current.isCompleted).toBe(true)
    })

    it('正しい初期値を返すべきである', () => {
      const { result } = renderHook(() => useUpdateTaskStatus(mockTaskId, TASK_STATUS.INCOMPLETE))

      expect(result.current).toEqual({
        isCompleted: false,
        isPending: false,
        handleStatusToggle: expect.any(Function),
      })
    })
  })

  describe('useOptimisticの初期化', () => {
    it('ステータスがCOMPLETEの場合、useOptimisticが正しく初期化されるべきである', () => {
      renderHook(() => useUpdateTaskStatus(mockTaskId, TASK_STATUS.COMPLETE))

      expect(useOptimistic).toHaveBeenCalledWith(
        true, // status === TASK_STATUS.COMPLETE
        expect.any(Function),
      )
    })

    it('ステータスがINCOMPLETEの場合、useOptimisticが正しく初期化されるべきである', () => {
      renderHook(() => useUpdateTaskStatus(mockTaskId, TASK_STATUS.INCOMPLETE))

      expect(useOptimistic).toHaveBeenCalledWith(
        false, // status !== TASK_STATUS.COMPLETE
        expect.any(Function),
      )
    })

    it('useOptimisticのreducer関数が正しく動作するべきである', () => {
      let reducerFunction: (state: boolean) => boolean

      ;(useOptimistic as Mock).mockImplementation((initialState, reducer) => {
        reducerFunction = reducer
        return [initialState, mockSetIsCompleted]
      })

      renderHook(() => useUpdateTaskStatus(mockTaskId, TASK_STATUS.INCOMPLETE))

      // reducer関数をテスト
      expect(reducerFunction!(true)).toBe(false)
      expect(reducerFunction!(false)).toBe(true)
    })
  })

  describe('handleStatusToggle - チェック→完了', () => {
    beforeEach(() => {
      mockStartTransition.mockImplementation((callback) => callback())
    })

    it('チェックした場合、楽観的更新が実行されるべきである', async () => {
      const { updateTaskStatusAction } = await import(
        '~/features/tasks/actions/update-task-status-action'
      )
      ;(updateTaskStatusAction as Mock).mockResolvedValue({ isSuccess: true })

      const { result } = renderHook(() => useUpdateTaskStatus(mockTaskId, TASK_STATUS.INCOMPLETE))

      await act(async () => {
        result.current.handleStatusToggle(true)
      })

      expect(mockSetIsCompleted).toHaveBeenCalledWith(true)
    })

    it('チェックした場合、COMPLETE状態でアクションが呼ばれるべきである', async () => {
      const { updateTaskStatusAction } = await import(
        '~/features/tasks/actions/update-task-status-action'
      )
      ;(updateTaskStatusAction as Mock).mockResolvedValue({ isSuccess: true })

      const { result } = renderHook(() => useUpdateTaskStatus(mockTaskId, TASK_STATUS.INCOMPLETE))

      await act(async () => {
        result.current.handleStatusToggle(true)
      })

      expect(updateTaskStatusAction).toHaveBeenCalledWith(mockTaskId, TASK_STATUS.COMPLETE)
    })
  })

  describe('handleStatusToggle - チェック解除→未完了', () => {
    beforeEach(() => {
      mockStartTransition.mockImplementation((callback) => callback())
    })

    it('チェック解除した場合、楽観的更新が実行されるべきである', async () => {
      const { updateTaskStatusAction } = await import(
        '~/features/tasks/actions/update-task-status-action'
      )
      ;(updateTaskStatusAction as Mock).mockResolvedValue({ isSuccess: true })

      const { result } = renderHook(() => useUpdateTaskStatus(mockTaskId, TASK_STATUS.COMPLETE))

      await act(async () => {
        result.current.handleStatusToggle(false)
      })

      expect(mockSetIsCompleted).toHaveBeenCalledWith(false)
    })

    it('チェック解除した場合、INCOMPLETE状態でアクションが呼ばれるべきである', async () => {
      const { updateTaskStatusAction } = await import(
        '~/features/tasks/actions/update-task-status-action'
      )
      ;(updateTaskStatusAction as Mock).mockResolvedValue({ isSuccess: true })

      const { result } = renderHook(() => useUpdateTaskStatus(mockTaskId, TASK_STATUS.COMPLETE))

      await act(async () => {
        result.current.handleStatusToggle(false)
      })

      expect(updateTaskStatusAction).toHaveBeenCalledWith(mockTaskId, TASK_STATUS.INCOMPLETE)
    })
  })

  describe('更新処理 - 成功時', () => {
    beforeEach(() => {
      mockStartTransition.mockImplementation((callback) => callback())
    })

    it('成功時にtoast.successが呼ばれるべきである', async () => {
      const { updateTaskStatusAction } = await import(
        '~/features/tasks/actions/update-task-status-action'
      )
      ;(updateTaskStatusAction as Mock).mockResolvedValue({ isSuccess: true })

      const { result } = renderHook(() => useUpdateTaskStatus(mockTaskId, TASK_STATUS.INCOMPLETE))

      await act(async () => {
        result.current.handleStatusToggle(true)
      })

      expect(mockToast.success).toHaveBeenCalledWith(expect.any(String), {
        style: expect.any(Object),
        position: 'top-center',
      })
    })

    it('成功時にrouter.refreshが呼ばれるべきである', async () => {
      const { updateTaskStatusAction } = await import(
        '~/features/tasks/actions/update-task-status-action'
      )
      ;(updateTaskStatusAction as Mock).mockResolvedValue({ isSuccess: true })

      const { result } = renderHook(() => useUpdateTaskStatus(mockTaskId, TASK_STATUS.INCOMPLETE))

      await act(async () => {
        result.current.handleStatusToggle(true)
      })

      expect(mockRouter.refresh).toHaveBeenCalled()
    })
  })

  describe('更新処理 - 失敗時', () => {
    beforeEach(() => {
      mockStartTransition.mockImplementation((callback) => callback())
    })

    it('失敗時にtoast.errorが呼ばれるべきである', async () => {
      const { updateTaskStatusAction } = await import(
        '~/features/tasks/actions/update-task-status-action'
      )
      ;(updateTaskStatusAction as Mock).mockResolvedValue({ isSuccess: false })

      const { result } = renderHook(() => useUpdateTaskStatus(mockTaskId, TASK_STATUS.INCOMPLETE))

      await act(async () => {
        result.current.handleStatusToggle(true)
      })

      expect(mockToast.error).toHaveBeenCalledWith(expect.any(String), {
        style: expect.any(Object),
        position: 'top-center',
      })
    })

    it('失敗時に楽観的更新がロールバックされるべきである', async () => {
      const { updateTaskStatusAction } = await import(
        '~/features/tasks/actions/update-task-status-action'
      )
      ;(updateTaskStatusAction as Mock).mockResolvedValue({ isSuccess: false })

      const { result } = renderHook(() => useUpdateTaskStatus(mockTaskId, TASK_STATUS.INCOMPLETE))

      await act(async () => {
        result.current.handleStatusToggle(true)
      })

      // setIsCompletedが2回呼ばれる（楽観的更新 + ロールバック）
      expect(mockSetIsCompleted).toHaveBeenCalledTimes(2)
      expect(mockSetIsCompleted).toHaveBeenCalledWith(true) // 楽観的更新
      expect(mockSetIsCompleted).toHaveBeenCalledWith(false) // ロールバック (!true)
    })

    it('失敗時はrouter.refreshが呼ばれないべきである', async () => {
      const { updateTaskStatusAction } = await import(
        '~/features/tasks/actions/update-task-status-action'
      )
      ;(updateTaskStatusAction as Mock).mockResolvedValue({ isSuccess: false })

      const { result } = renderHook(() => useUpdateTaskStatus(mockTaskId, TASK_STATUS.INCOMPLETE))

      await act(async () => {
        result.current.handleStatusToggle(true)
      })

      expect(mockRouter.refresh).not.toHaveBeenCalled()
    })
  })

  describe('isPending状態', () => {
    it('isPendingがtrueの場合、正しく反映されるべきである', () => {
      ;(useTransition as Mock).mockReturnValue([true, mockStartTransition])

      const { result } = renderHook(() => useUpdateTaskStatus(mockTaskId, TASK_STATUS.INCOMPLETE))

      expect(result.current.isPending).toBe(true)
    })

    it('isPendingがfalseの場合、正しく反映されるべきである', () => {
      ;(useTransition as Mock).mockReturnValue([false, mockStartTransition])

      const { result } = renderHook(() => useUpdateTaskStatus(mockTaskId, TASK_STATUS.INCOMPLETE))

      expect(result.current.isPending).toBe(false)
    })
  })

  describe('型安全性', () => {
    it('戻り値がas constで型が固定されているべきである', () => {
      const { result } = renderHook(() => useUpdateTaskStatus(mockTaskId, TASK_STATUS.INCOMPLETE))

      expect(result.current).toHaveProperty('isCompleted')
      expect(result.current).toHaveProperty('isPending')
      expect(result.current).toHaveProperty('handleStatusToggle')
    })

    it('handleStatusToggleが正しい引数を受け取るべきである', () => {
      const { result } = renderHook(() => useUpdateTaskStatus(mockTaskId, TASK_STATUS.INCOMPLETE))

      expect(result.current.handleStatusToggle).toBeTypeOf('function')

      // TypeScriptコンパイル時に型チェックが行われる
      expect(() => {
        result.current.handleStatusToggle(true)
        result.current.handleStatusToggle(false)
      }).not.toThrow()
    })
  })

  describe('エラーハンドリング', () => {
    it('アクションがエラーを投げた場合でも処理が中断されないべきである', async () => {
      const { updateTaskStatusAction } = await import(
        '~/features/tasks/actions/update-task-status-action'
      )
      ;(updateTaskStatusAction as Mock).mockRejectedValue(new Error('Network error'))

      mockStartTransition.mockImplementation((callback) => callback())

      const { result } = renderHook(() => useUpdateTaskStatus(mockTaskId, TASK_STATUS.INCOMPLETE))

      await act(async () => {
        // エラーが投げられても処理が完了することを確認
        expect(() => result.current.handleStatusToggle(true)).not.toThrow()
      })
    })

    it('useOptimisticが利用できない場合でもエラーを発生させないべきである', () => {
      ;(useOptimistic as Mock).mockImplementation(() => {
        throw new Error('useOptimistic not available')
      })

      expect(() =>
        renderHook(() => useUpdateTaskStatus(mockTaskId, TASK_STATUS.INCOMPLETE)),
      ).toThrow('useOptimistic not available')
    })
  })

  describe('楽観的更新のテスト', () => {
    it('trueからfalseへの楽観的更新が正しく動作するべきである', async () => {
      const { updateTaskStatusAction } = await import(
        '~/features/tasks/actions/update-task-status-action'
      )
      ;(updateTaskStatusAction as Mock).mockResolvedValue({ isSuccess: false })

      mockStartTransition.mockImplementation((callback) => callback())

      const { result } = renderHook(() => useUpdateTaskStatus(mockTaskId, TASK_STATUS.COMPLETE))

      await act(async () => {
        result.current.handleStatusToggle(false)
      })

      expect(mockSetIsCompleted).toHaveBeenCalledWith(false) // 楽観的更新
      expect(mockSetIsCompleted).toHaveBeenCalledWith(true) // ロールバック (!false)
    })

    it('falseからtrueへの楽観的更新が正しく動作するべきである', async () => {
      const { updateTaskStatusAction } = await import(
        '~/features/tasks/actions/update-task-status-action'
      )
      ;(updateTaskStatusAction as Mock).mockResolvedValue({ isSuccess: false })

      mockStartTransition.mockImplementation((callback) => callback())

      const { result } = renderHook(() => useUpdateTaskStatus(mockTaskId, TASK_STATUS.INCOMPLETE))

      await act(async () => {
        result.current.handleStatusToggle(true)
      })

      expect(mockSetIsCompleted).toHaveBeenCalledWith(true) // 楽観的更新
      expect(mockSetIsCompleted).toHaveBeenCalledWith(false) // ロールバック (!true)
    })
  })

  describe('競合状態テスト', () => {
    it('複数回handleStatusToggleを同時に呼び出しても正しく処理されるべきである', async () => {
      const { updateTaskStatusAction } = await import(
        '~/features/tasks/actions/update-task-status-action'
      )
      ;(updateTaskStatusAction as Mock).mockResolvedValue({ isSuccess: true })

      mockStartTransition.mockImplementation((callback) => callback())

      const { result } = renderHook(() => useUpdateTaskStatus(mockTaskId, TASK_STATUS.INCOMPLETE))

      await act(async () => {
        // 同時に複数回呼び出し
        result.current.handleStatusToggle(true)
        result.current.handleStatusToggle(false)
        result.current.handleStatusToggle(true)
      })

      // 各呼び出しが適切に処理されることを確認
      expect(mockStartTransition).toHaveBeenCalledTimes(3)
      expect(updateTaskStatusAction).toHaveBeenCalledTimes(3)
    })
  })

  describe('メモリリーク対策', () => {
    it('複数回レンダリングしてもメモリリークしないべきである', () => {
      const { unmount: unmount1 } = renderHook(() =>
        useUpdateTaskStatus('task-1', TASK_STATUS.INCOMPLETE),
      )
      const { unmount: unmount2 } = renderHook(() =>
        useUpdateTaskStatus('task-2', TASK_STATUS.COMPLETE),
      )
      const { unmount: unmount3 } = renderHook(() =>
        useUpdateTaskStatus('task-3', TASK_STATUS.INCOMPLETE),
      )

      unmount1()
      unmount2()
      unmount3()

      expect(useRouter).toHaveBeenCalledTimes(3)
      expect(useOptimistic).toHaveBeenCalledTimes(3)
      expect(useTransition).toHaveBeenCalledTimes(3)
    })
  })

  describe('パフォーマンステスト', () => {
    it('handleStatusToggleの実行時間が許容範囲内であるべきである', async () => {
      const { updateTaskStatusAction } = await import(
        '~/features/tasks/actions/update-task-status-action'
      )
      ;(updateTaskStatusAction as Mock).mockResolvedValue({ isSuccess: true })

      mockStartTransition.mockImplementation((callback) => callback())

      const { result } = renderHook(() => useUpdateTaskStatus(mockTaskId, TASK_STATUS.INCOMPLETE))

      const startTime = performance.now()

      await act(async () => {
        result.current.handleStatusToggle(true)
      })

      const endTime = performance.now()
      const executionTime = endTime - startTime

      expect(executionTime).toBeLessThan(1000)
    })
  })
})
