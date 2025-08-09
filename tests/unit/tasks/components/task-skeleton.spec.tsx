import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TaskSkeleton } from '~/features/tasks/components/task-skeleton'

describe('TaskSkeleton', () => {
  it('タスク一覧のスケルトン構造がレンダリングされる', () => {
    render(<TaskSkeleton />)

    // ヘッダー内の「タスク一覧」テキストを部分的にマッチング
    const header = screen.getByRole('heading', { level: 2 })
    expect(header).toHaveTextContent(/タスク一覧/)

    // ヘッダー内にスケルトンが含まれていることを確認
    expect(header.querySelector('[data-slot="skeleton"]')).toBeInTheDocument()
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

    const header = screen.getByRole('heading', { level: 2 })
    expect(header).toHaveClass('font-semibold', 'text-lg')
    expect(header).toHaveTextContent(/タスク一覧/)
  })
})
