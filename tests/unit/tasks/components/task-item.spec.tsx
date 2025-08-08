import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TaskItem } from '~/features/tasks/components/task-item'
import type { TaskList } from '~/features/tasks/types/task'

vi.mock('~/features/tasks/hooks/use-update-task-status', () => ({
  useUpdateTaskStatus: vi.fn(),
}))

vi.mock('~/features/tasks/components/status-badge', () => ({
  default: ({ isCompleted }: { isCompleted: boolean }) => (
    <div data-testid="status-badge">{isCompleted ? 'completed' : 'pending'}</div>
  ),
}))

vi.mock('~/features/tasks/components/task-delete-button', () => ({
  TaskDeleteButton: ({ taskId, isDisabled }: { taskId: string; isDisabled: boolean }) => (
    <button type="button" data-testid="delete-button" disabled={isDisabled}>
      Delete {taskId}
    </button>
  ),
}))

vi.mock('date-fns', () => ({
  format: vi.fn((_date, _formatStr) => '2024/01/01 10:00'),
}))

vi.mock('date-fns/locale/ja', () => ({
  ja: {},
}))

describe('TaskItem', () => {
  const mockHandleStatusToggle = vi.fn()
  const mockTask = {
    id: 'task-1',
    title: 'Test Task',
    status: 'incomplete',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  } as const satisfies TaskList[number]

  beforeEach(async () => {
    vi.clearAllMocks()
    const { useUpdateTaskStatus } = vi.mocked(
      await import('~/features/tasks/hooks/use-update-task-status'),
    )
    useUpdateTaskStatus.mockReturnValue({
      isCompleted: false,
      isPending: false,
      handleStatusToggle: mockHandleStatusToggle,
    })
  })

  it('すべてのコンポーネントを含むタスクアイテムがレンダリングされる', () => {
    render(<TaskItem task={mockTask} />)

    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
    expect(screen.getByTestId('status-badge')).toBeInTheDocument()
    expect(screen.getByTestId('delete-button')).toBeInTheDocument()
    expect(screen.getByText('2024/01/01 10:00')).toBeInTheDocument()
  })

  it('タスクが未完了の時に正しいプロップスでチェックボックスがレンダリングされる', () => {
    render(<TaskItem task={mockTask} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
    expect(checkbox).not.toBeDisabled()
    expect(checkbox).toHaveAttribute('id', 'task-task-1')
    expect(checkbox).toHaveAttribute('aria-label', 'Test Taskを完了にする')
  })

  it('タスクが完了の時にチェックボックスがチェック済みでレンダリングされる', async () => {
    const { useUpdateTaskStatus } = vi.mocked(
      await import('~/features/tasks/hooks/use-update-task-status'),
    )
    useUpdateTaskStatus.mockReturnValue({
      isCompleted: true,
      isPending: false,
      handleStatusToggle: mockHandleStatusToggle,
    })

    render(<TaskItem task={mockTask} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
    expect(checkbox).toHaveAttribute('aria-label', 'Test Taskを未完了にする')
  })

  it('保留中の時にチェックボックスが無効化される', async () => {
    const { useUpdateTaskStatus } = vi.mocked(
      await import('~/features/tasks/hooks/use-update-task-status'),
    )
    useUpdateTaskStatus.mockReturnValue({
      isCompleted: false,
      isPending: true,
      handleStatusToggle: mockHandleStatusToggle,
    })

    render(<TaskItem task={mockTask} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDisabled()
  })

  it('チェックボックスクリック時にhandleStatusToggleが呼び出される', () => {
    render(<TaskItem task={mockTask} />)

    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    expect(mockHandleStatusToggle).toHaveBeenCalledTimes(1)
  })

  it('完了タスクに正しいスタイリングが適用される', async () => {
    const { useUpdateTaskStatus } = vi.mocked(
      await import('~/features/tasks/hooks/use-update-task-status'),
    )
    useUpdateTaskStatus.mockReturnValue({
      isCompleted: true,
      isPending: false,
      handleStatusToggle: mockHandleStatusToggle,
    })

    const { container } = render(<TaskItem task={mockTask} />)

    const card = container.querySelector('[role="listitem"]')
    expect(card).toHaveClass('bg-muted/50')

    const label = screen.getByText('Test Task')
    expect(label).toHaveClass('line-through', 'text-muted-foreground')
  })

  it('未完了タスクに正しいスタイリングが適用される', () => {
    const { container } = render(<TaskItem task={mockTask} />)

    const card = container.querySelector('[role="listitem"]')
    expect(card).not.toHaveClass('bg-muted/50')

    const label = screen.getByText('Test Task')
    expect(label).toHaveClass('text-foreground')
    expect(label).not.toHaveClass('line-through')
  })

  it('正しいhtmlFor属性でラベルがレンダリングされる', () => {
    render(<TaskItem task={mockTask} />)

    const label = screen.getByText('Test Task')
    expect(label).toHaveAttribute('for', 'task-task-1')
  })

  it('StatusBadgeに正しいプロップスが渡される', () => {
    render(<TaskItem task={mockTask} />)

    const statusBadge = screen.getByTestId('status-badge')
    expect(statusBadge).toHaveTextContent('pending')
  })

  it('TaskDeleteButtonに正しいプロップスが渡される', () => {
    render(<TaskItem task={mockTask} />)

    const deleteButton = screen.getByTestId('delete-button')
    expect(deleteButton).toHaveTextContent('Delete task-1')
    expect(deleteButton).not.toBeDisabled()
  })

  it('タスク更新が保留中の時に削除ボタンが無効化される', async () => {
    const { useUpdateTaskStatus } = vi.mocked(
      await import('~/features/tasks/hooks/use-update-task-status'),
    )
    useUpdateTaskStatus.mockReturnValue({
      isCompleted: false,
      isPending: true,
      handleStatusToggle: mockHandleStatusToggle,
    })

    render(<TaskItem task={mockTask} />)

    const deleteButton = screen.getByTestId('delete-button')
    expect(deleteButton).toBeDisabled()
  })

  it('正しいフォーマットで作成日がレンダリングされる', () => {
    render(<TaskItem task={mockTask} />)


    expect(screen.getByText('2024/01/01 10:00')).toBeInTheDocument()
  })

  it('適切なアクセシビリティ属性を持つ', () => {
    const { container } = render(<TaskItem task={mockTask} />)

    const card = container.querySelector('[role="listitem"]')
    expect(card).toBeInTheDocument()

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveClass('cursor-pointer')

    const label = screen.getByText('Test Task')
    expect(label).toHaveClass('cursor-pointer')
  })

  it('カレンダーアイコンがレンダリングされる', () => {
    render(<TaskItem task={mockTask} />)

    expect(document.querySelector('svg.lucide-calendar')).toBeInTheDocument()
  })
})
