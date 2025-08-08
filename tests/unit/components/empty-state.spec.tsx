import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { EmptyState } from '~/components/ui/empty-state'

describe('EmptyState', () => {
  const mockAction = {
    label: 'Test Action',
    onClick: vi.fn(),
  }

  describe('基本レンダリング', () => {
    it('必須プロップスのみでレンダリングされる', () => {
      render(<EmptyState title="Test Title" />)

      expect(screen.getByRole('region')).toBeInTheDocument()
      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test Title')
    })

    it('アクセシビリティ属性が適切に設定されている', () => {
      render(<EmptyState title="Test Title" />)

      const region = screen.getByRole('region')
      expect(region).toHaveAttribute('aria-labelledby', 'empty-state-title')

      const title = screen.getByRole('heading', { level: 3 })
      expect(title).toHaveAttribute('id', 'empty-state-title')
    })

    it('デフォルトのCSSクラスが適用されている', () => {
      render(<EmptyState title="Test Title" />)

      const container = screen.getByRole('region')
      expect(container).toHaveClass(
        'flex',
        'flex-col',
        'items-center',
        'justify-center',
        'px-4',
        'py-12',
        'text-center',
      )
    })
  })

  describe('プロップスのバリエーション', () => {
    it('アイコンが表示される', () => {
      const TestIcon = () => <span data-testid="test-icon">Icon</span>
      render(<EmptyState title="Test Title" icon={<TestIcon />} />)

      const iconContainer = screen.getByTestId('test-icon').parentElement
      expect(iconContainer).toBeInTheDocument()
      expect(iconContainer).toHaveAttribute('aria-hidden', 'true')
      expect(iconContainer).toHaveClass('mb-4', 'text-muted-foreground')
    })

    it('説明文が表示される', () => {
      const description = 'This is a test description'
      render(<EmptyState title="Test Title" description={description} />)

      const descriptionElement = screen.getByText(description)
      expect(descriptionElement).toBeInTheDocument()
      expect(descriptionElement.tagName.toLowerCase()).toBe('p')
      expect(descriptionElement).toHaveClass('mb-6', 'max-w-md', 'text-muted-foreground', 'text-sm')
    })

    it('アクションボタンが表示される', () => {
      render(<EmptyState title="Test Title" action={mockAction} />)

      const button = screen.getByRole('button', { name: mockAction.label })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('min-w-[120px]')
    })

    it('カスタムクラス名が適用される', () => {
      const customClassName = 'custom-class'
      render(<EmptyState title="Test Title" className={customClassName} />)

      const container = screen.getByRole('region')
      expect(container).toHaveClass(customClassName)
    })
  })

  describe('アクション動作', () => {
    it('アクションボタンがクリック可能', () => {
      render(<EmptyState title="Test Title" action={mockAction} />)

      const button = screen.getByRole('button', { name: mockAction.label })
      fireEvent.click(button)

      expect(mockAction.onClick).toHaveBeenCalledTimes(1)
    })

    it('アクションが未定義の場合ボタンが表示されない', () => {
      render(<EmptyState title="Test Title" />)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })
  })

  describe('条件分岐の全パターン', () => {
    it('アイコンなしの場合アイコンコンテナが表示されない', () => {
      render(<EmptyState title="Test Title" />)

      expect(screen.queryByText('Icon')).not.toBeInTheDocument()
    })

    it('説明なしの場合説明文が表示されない', () => {
      render(<EmptyState title="Test Title" />)

      expect(screen.queryByText(/description/)).not.toBeInTheDocument()
    })

    it('すべてのプロップスが設定された場合', () => {
      const TestIcon = () => <span data-testid="test-icon">Icon</span>
      const description = 'Complete description'

      render(
        <EmptyState
          title="Complete Title"
          icon={<TestIcon />}
          description={description}
          action={mockAction}
          className="complete-class"
        />,
      )

      expect(screen.getByTestId('test-icon')).toBeInTheDocument()
      expect(screen.getByText('Complete Title')).toBeInTheDocument()
      expect(screen.getByText(description)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: mockAction.label })).toBeInTheDocument()
      expect(screen.getByRole('region')).toHaveClass('complete-class')
    })
  })

  describe('エッジケース', () => {
    it('空文字列のタイトルでも表示される', () => {
      render(<EmptyState title="" />)

      const title = screen.getByRole('heading', { level: 3 })
      expect(title).toBeInTheDocument()
      expect(title).toHaveTextContent('')
    })

    it('空文字列の説明が表示されないことを確認', () => {
      render(<EmptyState title="Test Title" description="" />)

      const container = screen.getByRole('region')
      const description = container.querySelector('p')
      // 空文字列の場合はdescription && の条件でpタグが表示されない
      expect(description).not.toBeInTheDocument()
    })

    it('空文字列のアクションラベルでもボタンが表示される', () => {
      const emptyLabelAction = { label: '', onClick: vi.fn() }
      render(<EmptyState title="Test Title" action={emptyLabelAction} />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('')
    })

    it('nullアイコンは表示されない', () => {
      render(<EmptyState title="Test Title" icon={null} />)

      expect(screen.queryByText('Icon')).not.toBeInTheDocument()
    })

    it('undefinedアイコンは表示されない', () => {
      render(<EmptyState title="Test Title" icon={undefined} />)

      expect(screen.queryByText('Icon')).not.toBeInTheDocument()
    })
  })

  describe('TypeScript型安全性', () => {
    it('ReactNodeアイコンが正しく表示される', () => {
      const complexIcon = (
        <div data-testid="complex-icon">
          <span>Complex</span>
          <span>Icon</span>
        </div>
      )

      render(<EmptyState title="Test Title" icon={complexIcon} />)

      expect(screen.getByTestId('complex-icon')).toBeInTheDocument()
      expect(screen.getByText('Complex')).toBeInTheDocument()
      expect(screen.getByText('Icon')).toBeInTheDocument()
    })

    it('アクションオブジェクトの型安全性', () => {
      const typedAction = {
        label: 'Typed Action',
        onClick: vi.fn(),
      }

      render(<EmptyState title="Test Title" action={typedAction} />)

      const button = screen.getByRole('button', { name: 'Typed Action' })
      expect(button).toBeInTheDocument()
    })
  })
})
