import type { FieldMetadata, FormMetadata } from '@conform-to/react'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TaskCreateForm } from '~/features/tasks/components/task-create-form'

vi.mock('~/features/tasks/hooks/use-create-task', () => ({
  useCreateTask: vi.fn(),
}))

vi.mock('@conform-to/react', () => ({
  getFormProps: vi.fn((_) => ({ 'data-testid': 'task-create-form' })),
  getInputProps: vi.fn((field, _) => ({
    name: field.name,
    id: field.name,
    'data-testid': `${field.name}-input`,
  })),
}))

describe('TaskCreateForm', () => {
  const mockAction = vi.fn()

  const createMockFieldMetadata = (
    name: string,
    errors: string[] = [],
  ): FieldMetadata<string, { title: string }, string[]> => ({
    name,
    key: name,
    id: name,
    descriptionId: `${name}-description`,
    errorId: `${name}-error`,
    errors: errors.length > 0 ? errors : undefined,
    initialValue: '',
    value: '',
    defaultValue: '',
    defaultOptions: undefined,
    defaultChecked: undefined,
    valid: errors.length === 0,
    dirty: false,
    allErrors: { [name]: errors },
    formId: 'task-form',
    required: false,
    minLength: undefined,
    maxLength: undefined,
    min: undefined,
    max: undefined,
    step: undefined,
    multiple: undefined,
    pattern: undefined,
  })

  const createMockFormMetadata = (): FormMetadata<{ title: string }, string[]> => ({
    key: 'task-form',
    id: 'task-form',
    name: 'task-form',
    descriptionId: 'task-form-description',
    errorId: 'task-form-error',
    errors: undefined,
    initialValue: { title: '' },
    value: { title: '' },
    defaultValue: undefined,
    defaultOptions: undefined,
    defaultChecked: undefined,
    valid: true,
    dirty: false,
    allErrors: {},
    context: {} as any,
    status: undefined,
    getFieldset: () => ({
      title: createMockFieldMetadata('title'),
    }),
    onSubmit: vi.fn(),
    noValidate: true,
    validate: Object.assign(vi.fn(), { getButtonProps: vi.fn() }),
    reset: Object.assign(vi.fn(), { getButtonProps: vi.fn() }),
    update: Object.assign(vi.fn(), { getButtonProps: vi.fn() }),
    insert: Object.assign(vi.fn(), { getButtonProps: vi.fn() }),
    remove: Object.assign(vi.fn(), { getButtonProps: vi.fn() }),
    reorder: Object.assign(vi.fn(), { getButtonProps: vi.fn() }),
  })

  const mockFields = {
    title: createMockFieldMetadata('title'),
  }
  const mockForm = createMockFormMetadata()

  beforeEach(async () => {
    vi.clearAllMocks()
    const { useCreateTask } = vi.mocked(await import('~/features/tasks/hooks/use-create-task'))
    useCreateTask.mockReturnValue({
      form: mockForm,
      action: mockAction,
      isPending: false,
      fields: mockFields,
    })
  })

  it('タイトル入力と送信ボタンがあるフォームがレンダリングされる', () => {
    render(<TaskCreateForm />)

    expect(screen.getByLabelText('タスクタイトル')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('タスクを入力してください')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'タスクを追加' })).toBeInTheDocument()
  })

  it('保留中でない時はプラスアイコンがレンダリングされる', () => {
    render(<TaskCreateForm />)

    // プラスアイコンが表示されるはず
    expect(document.querySelector('svg.lucide-plus')).toBeInTheDocument()
    // ローダーは表示されないはず
    expect(document.querySelector('svg.lucide-loader-2')).not.toBeInTheDocument()
  })

  it('保留中の時はローダーアイコンがレンダリングされる', async () => {
    const { useCreateTask } = vi.mocked(await import('~/features/tasks/hooks/use-create-task'))
    useCreateTask.mockReturnValue({
      form: createMockFormMetadata(),
      action: mockAction,
      isPending: true,
      fields: {
        title: createMockFieldMetadata('title'),
      },
    })

    render(<TaskCreateForm />)

    // ローダーアイコンがanimate-spinクラスと共に表示されるはず
    expect(document.querySelector('svg.animate-spin')).toBeInTheDocument()
  })

  it('保留中の時は入力とボタンが無効化される', async () => {
    const { useCreateTask } = vi.mocked(await import('~/features/tasks/hooks/use-create-task'))
    useCreateTask.mockReturnValue({
      form: createMockFormMetadata(),
      action: mockAction,
      isPending: true,
      fields: {
        title: createMockFieldMetadata('title'),
      },
    })

    render(<TaskCreateForm />)

    const input = screen.getByPlaceholderText('タスクを入力してください')
    const button = screen.getByRole('button', { name: 'タスクを追加' })

    expect(input).toBeDisabled()
    expect(button).toBeDisabled()
  })

  it('フィールドエラーがある場合に表示される', async () => {
    const { useCreateTask } = vi.mocked(await import('~/features/tasks/hooks/use-create-task'))
    useCreateTask.mockReturnValue({
      form: createMockFormMetadata(),
      action: mockAction,
      isPending: false,
      fields: {
        title: createMockFieldMetadata('title', ['タイトルは必須です']),
      },
    })

    render(<TaskCreateForm />)

    expect(screen.getByText('タイトルは必須です')).toBeInTheDocument()
  })

  it('適切なフォーム構造とアクセシビリティを持つ', () => {
    render(<TaskCreateForm />)

    const form = screen.getByTestId('task-create-form')
    expect(form).toBeInTheDocument()

    const label = screen.getByText('タスクタイトル')
    const input = screen.getByPlaceholderText('タスクを入力してください')

    expect(label).toHaveAttribute('for', 'title')
    expect(input).toHaveAttribute('id', 'title')
  })

  it('正しいCSSクラスを持つ', () => {
    render(<TaskCreateForm />)

    const button = screen.getByRole('button', { name: 'タスクを追加' })
    expect(button).toHaveClass('w-full', 'cursor-pointer')

    const form = screen.getByTestId('task-create-form')
    expect(form).toHaveClass('space-y-4')
  })

  it('無効化された時にボタンの状態クラスが適切に維持される', async () => {
    const { useCreateTask } = vi.mocked(await import('~/features/tasks/hooks/use-create-task'))
    useCreateTask.mockReturnValue({
      form: createMockFormMetadata(),
      action: mockAction,
      isPending: true,
      fields: {
        title: createMockFieldMetadata('title'),
      },
    })

    render(<TaskCreateForm />)

    const button = screen.getByRole('button', { name: 'タスクを追加' })
    expect(button).toHaveClass('disabled:cursor-not-allowed')
  })
})
