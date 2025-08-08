import { render, screen } from '@testing-library/react'
import type React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TaskList } from '~/features/tasks/components/task-list'

vi.mock('~/features/tasks/server/fetcher', () => ({
  fetchAllTasks: vi.fn(),
}))

vi.mock('~/components/ui/empty-state', () => ({
  EmptyState: ({
    icon,
    title,
    description,
  }: {
    icon: React.ReactNode
    title: string
    description: string
  }) => (
    <div data-testid="empty-state">
      <div data-testid="empty-state-icon">{icon}</div>
      <h3 data-testid="empty-state-title">{title}</h3>
      <p data-testid="empty-state-description">{description}</p>
    </div>
  ),
}))

vi.mock('~/features/tasks/components/task-item', () => ({
  TaskItem: ({ task }: { task: any }) => (
    <div data-testid={`task-item-${task.id}`}>Task: {task.title}</div>
  ),
}))

describe('TaskList', () => {
  const mockTasks = [
    {
      id: 'task-1',
      title: 'First Task',
      status: 'incomplete' as const,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: null,
    },
    {
      id: 'task-2',
      title: 'Second Task',
      status: 'complete' as const,
      createdAt: '2024-01-02T11:00:00Z',
      updatedAt: null,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('タスクが存在しない時に空の状態がレンダリングされる', async () => {
    const { fetchAllTasks } = vi.mocked(await import('~/features/tasks/server/fetcher'))
    fetchAllTasks.mockResolvedValue([])

    render(await TaskList())

    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    expect(screen.getByTestId('empty-state-title')).toHaveTextContent('タスクがありません')
    expect(screen.getByTestId('empty-state-description')).toHaveTextContent(
      '新しいタスクを作成して、やるべきことを整理しましょう。',
    )
  })

  it('正しいアイコンで空の状態がレンダリングされる', async () => {
    const { fetchAllTasks } = vi.mocked(await import('~/features/tasks/server/fetcher'))
    fetchAllTasks.mockResolvedValue([])

    render(await TaskList())

    const icon = screen.getByTestId('empty-state-icon')
    expect(icon).toBeInTheDocument()
  })

  it('タスクが存在する時にタスク一覧がレンダリングされる', async () => {
    const { fetchAllTasks } = vi.mocked(await import('~/features/tasks/server/fetcher'))
    fetchAllTasks.mockResolvedValue(mockTasks)

    render(await TaskList())

    expect(screen.getByText('タスク一覧 (2)')).toBeInTheDocument()
    expect(screen.getByTestId('task-item-task-1')).toBeInTheDocument()
    expect(screen.getByTestId('task-item-task-2')).toBeInTheDocument()
  })

  it('ヘッダーに正しいタスク数が表示される', async () => {
    const { fetchAllTasks } = vi.mocked(await import('~/features/tasks/server/fetcher'))
    fetchAllTasks.mockResolvedValue(mockTasks)

    render(await TaskList())

    const header = screen.getByRole('heading', { level: 2 })
    expect(header).toHaveTextContent('タスク一覧 (2)')
    expect(header).toHaveClass('font-semibold', 'text-lg')
  })

  it('正しい数のタスクアイテムがレンダリングされる', async () => {
    const { fetchAllTasks } = vi.mocked(await import('~/features/tasks/server/fetcher'))
    fetchAllTasks.mockResolvedValue(mockTasks)

    render(await TaskList())

    expect(screen.getByTestId('task-item-task-1')).toHaveTextContent('Task: First Task')
    expect(screen.getByTestId('task-item-task-2')).toHaveTextContent('Task: Second Task')
  })

  it('タスク一覧に適切なアクセシビリティ属性を持つ', async () => {
    const { fetchAllTasks } = vi.mocked(await import('~/features/tasks/server/fetcher'))
    fetchAllTasks.mockResolvedValue(mockTasks)

    const { container } = render(await TaskList())

    const list = container.querySelector('[role="list"]')
    expect(list).toBeInTheDocument()
    expect(list).toHaveAttribute('aria-label', 'タスク一覧')
  })

  it('正しい構造と間隔クラスを持つ', async () => {
    const { fetchAllTasks } = vi.mocked(await import('~/features/tasks/server/fetcher'))
    fetchAllTasks.mockResolvedValue(mockTasks)

    const { container } = render(await TaskList())

    expect(container.querySelector('.space-y-3')).toBeInTheDocument()
    expect(container.querySelector('.space-y-2')).toBeInTheDocument()
  })

  it('レンダー時にfetchAllTasksが呼び出される', async () => {
    const { fetchAllTasks } = vi.mocked(await import('~/features/tasks/server/fetcher'))
    fetchAllTasks.mockResolvedValue([])

    render(await TaskList())

    expect(fetchAllTasks).toHaveBeenCalledTimes(1)
  })

  it('単一タスクが正しくレンダリングされる', async () => {
    const singleTask = [mockTasks[0]]
    const { fetchAllTasks } = vi.mocked(await import('~/features/tasks/server/fetcher'))
    fetchAllTasks.mockResolvedValue(singleTask)

    render(await TaskList())

    expect(screen.getByText('タスク一覧 (1)')).toBeInTheDocument()
    expect(screen.getByTestId('task-item-task-1')).toBeInTheDocument()
    expect(screen.queryByTestId('task-item-task-2')).not.toBeInTheDocument()
  })

  it('TaskItemコンポーネントに正しいプロップスが渡される', async () => {
    const { fetchAllTasks } = vi.mocked(await import('~/features/tasks/server/fetcher'))
    fetchAllTasks.mockResolvedValue(mockTasks)

    render(await TaskList())

    // TaskItemコンポーネントは正しいタスクデータを受け取るはず
    expect(screen.getByTestId('task-item-task-1')).toHaveTextContent('First Task')
    expect(screen.getByTestId('task-item-task-2')).toHaveTextContent('Second Task')
  })

  it('タスクが正しい順序でレンダリングされる', async () => {
    const { fetchAllTasks } = vi.mocked(await import('~/features/tasks/server/fetcher'))
    fetchAllTasks.mockResolvedValue(mockTasks)

    const { container } = render(await TaskList())

    const taskItems = container.querySelectorAll('[data-testid^="task-item-"]')
    expect(taskItems[0]).toHaveAttribute('data-testid', 'task-item-task-1')
    expect(taskItems[1]).toHaveAttribute('data-testid', 'task-item-task-2')
  })
})
