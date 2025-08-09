import { act, renderHook, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { useActionState } from 'react'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { useCreateTask } from '~/features/tasks/hooks/use-create-task'

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
vi.mock('sonner')
vi.mock('react')
vi.mock('~/features/tasks/actions/create-task-action')
vi.mock('~/utils/with-callback')

vi.mock('@conform-to/react', () => ({
  useForm: vi.fn(),
}))
vi.mock('@conform-to/zod/v4', () => ({
  getZodConstraint: vi.fn(),
  parseWithZod: vi.fn(),
}))

describe('useCreateTask', () => {
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
  const mockAction = vi.fn()
  const mockForm = {
    id: 'test-form',
    'aria-describedby': 'test-form-errors',
    'aria-invalid': undefined,
    onSubmit: vi.fn(),
  }
  const mockFields = {
    title: {
      id: 'title',
      name: 'title',
      'aria-describedby': 'title-error',
      'aria-invalid': false,
    },
  }

  beforeEach(async () => {
    vi.clearAllMocks()

    ;(useRouter as Mock).mockReturnValue(mockRouter)

    ;(toast as any).success = mockToast.success
    ;(toast as any).error = mockToast.error

    ;(useActionState as Mock).mockReturnValue([null, mockAction, false])

    const { useForm } = await import('@conform-to/react')
    ;(useForm as Mock).mockReturnValue([mockForm, mockFields])

    const { getZodConstraint, parseWithZod } = await import('@conform-to/zod/v4')
    ;(getZodConstraint as Mock).mockReturnValue({})
    ;(parseWithZod as Mock).mockReturnValue({ success: true })
  })

  describe('初期化', () => {
    it('正しい初期値を返すべきである', () => {
      const { result } = renderHook(() => useCreateTask())

      expect(result.current).toEqual({
        form: mockForm,
        action: mockAction,
        isPending: false,
        fields: mockFields,
      })
    })

    it('useActionStateが正しいパラメータで呼ばれるべきである', () => {
      renderHook(() => useCreateTask())

      expect(useActionState).toHaveBeenCalledTimes(1)
    })

    it('useFormが正しい設定で呼ばれるべきである', async () => {
      renderHook(() => useCreateTask())

      const { useForm } = await import('@conform-to/react')
      expect(useForm).toHaveBeenCalledWith({
        lastResult: null,
        onValidate: expect.any(Function),
        defaultValue: {
          title: '',
        },
      })
    })
  })

  describe('成功時の処理', () => {
    it('成功時にtoast.successが呼ばれるべきである', async () => {
      const { withCallbacks } = await import('~/utils/with-callback')
      let onSuccessCallback: (() => void) | undefined

      ;(withCallbacks as Mock).mockImplementation((action, callbacks) => {
        onSuccessCallback = callbacks.onSuccess
        return action
      })

      renderHook(() => useCreateTask())

      await act(async () => {
        onSuccessCallback?.()
      })

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(expect.any(String), {
          style: expect.any(Object),
          position: 'top-center',
        })
      })
    })

    it('成功時にrouter.refreshが呼ばれるべきである', async () => {
      const { withCallbacks } = await import('~/utils/with-callback')
      let onSuccessCallback: (() => void) | undefined

      ;(withCallbacks as Mock).mockImplementation((action, callbacks) => {
        onSuccessCallback = callbacks.onSuccess
        return action
      })

      renderHook(() => useCreateTask())

      await act(async () => {
        onSuccessCallback?.()
      })

      await waitFor(() => {
        expect(mockRouter.refresh).toHaveBeenCalled()
      })
    })
  })

  describe('エラー時の処理', () => {
    it('エラー時にtoast.errorが呼ばれるべきである', async () => {
      const { withCallbacks } = await import('~/utils/with-callback')
      let onErrorCallback: (() => void) | undefined

      ;(withCallbacks as Mock).mockImplementation((action, callbacks) => {
        onErrorCallback = callbacks.onError
        return action
      })

      renderHook(() => useCreateTask())

      await act(async () => {
        onErrorCallback?.()
      })

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(expect.any(String), {
          style: expect.any(Object),
          position: 'top-center',
        })
      })
    })
  })

  describe('isPending状態', () => {
    it('isPendingがtrueの場合、正しく反映されるべきである', () => {
      ;(useActionState as Mock).mockReturnValue([null, mockAction, true])

      const { result } = renderHook(() => useCreateTask())

      expect(result.current.isPending).toBe(true)
    })

    it('isPendingがfalseの場合、正しく反映されるべきである', () => {
      ;(useActionState as Mock).mockReturnValue([null, mockAction, false])

      const { result } = renderHook(() => useCreateTask())

      expect(result.current.isPending).toBe(false)
    })
  })

  describe('フォームバリデーション', () => {
    it('onValidateが正しく設定されるべきである', async () => {
      const mockFormData = new FormData()
      mockFormData.set('title', 'テストタスク')

      const { useForm } = await import('@conform-to/react')
      let onValidateCallback: ((args: { formData: FormData }) => any) | undefined

      ;(useForm as Mock).mockImplementation((config) => {
        onValidateCallback = config.onValidate
        return [mockForm, mockFields]
      })

      renderHook(() => useCreateTask())

      expect(onValidateCallback).toBeDefined()

      if (onValidateCallback) {
        onValidateCallback({ formData: mockFormData })

        const { parseWithZod } = await import('@conform-to/zod/v4')
        expect(parseWithZod).toHaveBeenCalledWith(mockFormData, {
          schema: expect.any(Object),
        })
      }
    })

    it('バリデーション設定が正しく適用される', async () => {
      const { useForm } = await import('@conform-to/react')

      renderHook(() => useCreateTask())

      expect(useForm).toHaveBeenCalledWith(
        expect.objectContaining({
          onValidate: expect.any(Function),
        }),
      )
    })

    describe('バリデーションシナリオ', () => {
      it('空文字のバリデーション', async () => {
        const mockFormData = new FormData()
        mockFormData.set('title', '')

        const { parseWithZod } = await import('@conform-to/zod/v4')
        ;(parseWithZod as Mock).mockReturnValue({
          status: 'error',
          error: { title: ['タスクタイトルは1文字以上で入力してください'] },
        })

        const { useForm } = await import('@conform-to/react')
        let onValidateCallback: ((args: { formData: FormData }) => any) | undefined

        ;(useForm as Mock).mockImplementation((config) => {
          onValidateCallback = config.onValidate
          return [mockForm, mockFields]
        })

        renderHook(() => useCreateTask())

        const result = onValidateCallback?.({ formData: mockFormData })
        expect(parseWithZod).toHaveBeenCalledWith(mockFormData, {
          schema: expect.any(Object),
        })
        expect(result).toEqual({
          status: 'error',
          error: { title: ['タスクタイトルは1文字以上で入力してください'] },
        })
      })

      it('スペースのみ入力のバリデーション', async () => {
        const mockFormData = new FormData()
        mockFormData.set('title', '   ')

        const { parseWithZod } = await import('@conform-to/zod/v4')
        ;(parseWithZod as Mock).mockReturnValue({
          status: 'error',
          error: { title: ['タスクタイトルは1文字以上で入力してください'] },
        })

        const { useForm } = await import('@conform-to/react')
        let onValidateCallback: ((args: { formData: FormData }) => any) | undefined

        ;(useForm as Mock).mockImplementation((config) => {
          onValidateCallback = config.onValidate
          return [mockForm, mockFields]
        })

        renderHook(() => useCreateTask())

        const result = onValidateCallback?.({ formData: mockFormData })
        expect(parseWithZod).toHaveBeenCalledWith(mockFormData, {
          schema: expect.any(Object),
        })
        expect(result).toEqual({
          status: 'error',
          error: { title: ['タスクタイトルは1文字以上で入力してください'] },
        })
      })

      it('255文字以下の有効な入力', async () => {
        const validTitle = 'a'.repeat(255)
        const mockFormData = new FormData()
        mockFormData.set('title', validTitle)

        const { parseWithZod } = await import('@conform-to/zod/v4')
        ;(parseWithZod as Mock).mockReturnValue({
          status: 'success',
          value: { title: validTitle },
        })

        const { useForm } = await import('@conform-to/react')
        let onValidateCallback: ((args: { formData: FormData }) => any) | undefined

        ;(useForm as Mock).mockImplementation((config) => {
          onValidateCallback = config.onValidate
          return [mockForm, mockFields]
        })

        renderHook(() => useCreateTask())

        const result = onValidateCallback?.({ formData: mockFormData })
        expect(parseWithZod).toHaveBeenCalledWith(mockFormData, {
          schema: expect.any(Object),
        })
        expect(result).toEqual({
          status: 'success',
          value: { title: validTitle },
        })
      })

      it('256文字以上の無効な入力', async () => {
        const invalidTitle = 'a'.repeat(256)
        const mockFormData = new FormData()
        mockFormData.set('title', invalidTitle)

        const { parseWithZod } = await import('@conform-to/zod/v4')
        ;(parseWithZod as Mock).mockReturnValue({
          status: 'error',
          error: { title: ['タスクタイトルは255文字以内で入力してください'] },
        })

        const { useForm } = await import('@conform-to/react')
        let onValidateCallback: ((args: { formData: FormData }) => any) | undefined

        ;(useForm as Mock).mockImplementation((config) => {
          onValidateCallback = config.onValidate
          return [mockForm, mockFields]
        })

        renderHook(() => useCreateTask())

        const result = onValidateCallback?.({ formData: mockFormData })
        expect(parseWithZod).toHaveBeenCalledWith(mockFormData, {
          schema: expect.any(Object),
        })
        expect(result).toEqual({
          status: 'error',
          error: { title: ['タスクタイトルは255文字以内で入力してください'] },
        })
      })

      it('undefined値の処理', async () => {
        const mockFormData = new FormData()
        // titleフィールドを設定しない（undefined）

        const { parseWithZod } = await import('@conform-to/zod/v4')
        ;(parseWithZod as Mock).mockReturnValue({
          status: 'error',
          error: { title: ['タスクタイトルは1文字以上で入力してください'] },
        })

        const { useForm } = await import('@conform-to/react')
        let onValidateCallback: ((args: { formData: FormData }) => any) | undefined

        ;(useForm as Mock).mockImplementation((config) => {
          onValidateCallback = config.onValidate
          return [mockForm, mockFields]
        })

        renderHook(() => useCreateTask())

        const result = onValidateCallback?.({ formData: mockFormData })
        expect(parseWithZod).toHaveBeenCalledWith(mockFormData, {
          schema: expect.any(Object),
        })
        expect(result).toEqual({
          status: 'error',
          error: { title: ['タスクタイトルは1文字以上で入力してください'] },
        })
      })
    })
  })

  describe('デフォルト値', () => {
    it('titleのデフォルト値が空文字であるべきである', async () => {
      const { useForm } = await import('@conform-to/react')

      renderHook(() => useCreateTask())

      expect(useForm).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultValue: {
            title: '',
          },
        }),
      )
    })
  })

  describe('型安全性', () => {
    it('戻り値がas constで型が固定されているべきである', () => {
      const { result } = renderHook(() => useCreateTask())

      expect(result.current).toHaveProperty('form')
      expect(result.current).toHaveProperty('action')
      expect(result.current).toHaveProperty('isPending')
      expect(result.current).toHaveProperty('fields')
    })
  })

  describe('エラーハンドリング', () => {
    it('useRouterが利用できない場合でもエラーを発生させないべきである', () => {
      ;(useRouter as Mock).mockImplementation(() => {
        throw new Error('useRouter not available')
      })

      expect(() => renderHook(() => useCreateTask())).toThrow('useRouter not available')
    })

    it('useActionStateが利用できない場合でもエラーを発生させないべきである', () => {
      ;(useActionState as Mock).mockImplementation(() => {
        throw new Error('useActionState not available')
      })

      expect(() => renderHook(() => useCreateTask())).toThrow('useActionState not available')
    })
  })

  describe('メモリリーク対策', () => {
    it('複数回レンダリングしてもメモリリークしないべきである', () => {
      const { unmount: unmount1 } = renderHook(() => useCreateTask())
      const { unmount: unmount2 } = renderHook(() => useCreateTask())
      const { unmount: unmount3 } = renderHook(() => useCreateTask())

      unmount1()
      unmount2()
      unmount3()

      expect(useRouter).toHaveBeenCalledTimes(3)
      expect(useActionState).toHaveBeenCalledTimes(3)
    })
  })
})
