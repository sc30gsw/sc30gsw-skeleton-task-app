import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TaskSkeleton } from '~/features/tasks/components/task-skeleton'

describe('TaskSkeleton', () => {
  it('タスク一覧のスケルトン構造がレンダリングされる', () => {
    render(<TaskSkeleton />)

    expect(screen.getByText('タスク一覧 0')).toBeInTheDocument()
  })

  it('正しい数のスケルトンアイテムがレンダリングされる', () => {
    const { container } = render(<TaskSkeleton />)


    const skeletons = container.querySelectorAll('[data-slot="skeleton"]')
    expect(skeletons).toHaveLength(4)
  })

  it('space-yクラスで適切な構造を持つ', () => {
    const { container } = render(<TaskSkeleton />)

    expect(container.querySelector('.space-y-3')).toBeInTheDocument()
    expect(container.querySelector('.space-y-2')).toBeInTheDocument()
  })

  it('正しいスタイリングでヘッダーがレンダリングされる', () => {
    render(<TaskSkeleton />)

    const header = screen.getByText('タスク一覧 0')
    expect(header.tagName.toLowerCase()).toBe('h2')
    expect(header).toHaveClass('font-semibold', 'text-lg')
  })
})
