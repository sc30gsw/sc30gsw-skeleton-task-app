import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TaskDeleteButton } from '~/features/tasks/components/task-delete-button'

vi.mock('~/features/tasks/hooks/use-delete-task', () => ({
  useDeleteTask: vi.fn(),
}))

describe('TaskDeleteButton', () => {
  const mockHandleDelete = vi.fn()
  const defaultProps = {
    taskId: 'task-1',
    isDisabled: false,
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    const { useDeleteTask } = vi.mocked(await import('~/features/tasks/hooks/use-delete-task'))
    useDeleteTask.mockReturnValue({
      isPending: false,
      handleDelete: mockHandleDelete,
    })
  })

  it('正しい属性を持つ削除ボタンがレンダリングされる', () => {
    render(<TaskDeleteButton {...defaultProps} />)

    const button = screen.getByRole('button', { name: 'タスクを削除' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-label', 'タスクを削除')
  })

  it('ゴミ箱アイコンがレンダリングされる', () => {
    render(<TaskDeleteButton {...defaultProps} />)

    expect(document.querySelector('svg.lucide-trash-2')).toBeInTheDocument()
  })

  it('クリック時にhandleDeleteが呼び出される', () => {
    render(<TaskDeleteButton {...defaultProps} />)

    const button = screen.getByRole('button', { name: 'タスクを削除' })
    fireEvent.click(button)

    expect(mockHandleDelete).toHaveBeenCalledTimes(1)
  })

  it('isDisabledプロップがtrueの時に無効化される', () => {
    render(<TaskDeleteButton {...defaultProps} isDisabled={true} />)

    const button = screen.getByRole('button', { name: 'タスクを削除' })
    expect(button).toBeDisabled()
  })

  it('フックがisPending trueを返す時に無効化される', async () => {
    const { useDeleteTask } = vi.mocked(await import('~/features/tasks/hooks/use-delete-task'))
    useDeleteTask.mockReturnValue({
      isPending: true,
      handleDelete: mockHandleDelete,
    })

    render(<TaskDeleteButton {...defaultProps} />)

    const button = screen.getByRole('button', { name: 'タスクを削除' })
    expect(button).toBeDisabled()
  })

  it('isDisabledとisPendingの両方がtrueの時に無効化される', async () => {
    const { useDeleteTask } = vi.mocked(await import('~/features/tasks/hooks/use-delete-task'))
    useDeleteTask.mockReturnValue({
      isPending: true,
      handleDelete: mockHandleDelete,
    })

    render(<TaskDeleteButton {...defaultProps} isDisabled={true} />)

    const button = screen.getByRole('button', { name: 'タスクを削除' })
    expect(button).toBeDisabled()
  })

  it('無効化された時にhandleDeleteが呼び出されない', () => {
    render(<TaskDeleteButton {...defaultProps} isDisabled={true} />)

    const button = screen.getByRole('button', { name: 'タスクを削除' })
    fireEvent.click(button)

    expect(mockHandleDelete).not.toHaveBeenCalled()
  })

  it('正しいCSSクラスを持つ', () => {
    render(<TaskDeleteButton {...defaultProps} />)

    const button = screen.getByRole('button', { name: 'タスクを削除' })
    expect(button).toHaveClass('cursor-pointer', 'text-muted-foreground')
  })
})
