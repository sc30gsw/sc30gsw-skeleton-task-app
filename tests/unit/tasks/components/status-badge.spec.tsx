import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import StatusBadge from '~/features/tasks/components/status-badge'

describe('StatusBadge', () => {
  it('完了ステータスが正しくレンダリングされる', () => {
    render(<StatusBadge isCompleted={true} />)

    expect(screen.getByText('完了')).toBeInTheDocument()
    expect(document.querySelector('svg.lucide-badge-check')).toBeInTheDocument() // BadgeCheckIcon
  })

  it('未完了ステータスが正しくレンダリングされる', () => {
    render(<StatusBadge isCompleted={false} />)

    expect(screen.getByText('未完了')).toBeInTheDocument()
    expect(document.querySelector('svg.lucide-clock')).toBeInTheDocument() // Clock icon
  })

  it('完了ステータスで正しいCSSクラスが適用される', () => {
    const { container } = render(<StatusBadge isCompleted={true} />)
    const badge = container.querySelector('[class*="bg-green-500"]')

    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('text-white')
  })

  it('未完了ステータスで正しいCSSクラスが適用される', () => {
    const { container } = render(<StatusBadge isCompleted={false} />)
    const badge = container.querySelector('[class*="bg-blue-500"]')

    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('text-white')
  })
})
