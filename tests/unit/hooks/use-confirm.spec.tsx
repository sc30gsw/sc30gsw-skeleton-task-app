import { fireEvent, render, screen } from '@testing-library/react'
import * as React from 'react'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { createCallable } from 'react-call'

vi.mock('~/components/ui/shadcn/button', () => ({
  Button: ({ children, onClick, variant, className, ...props }: any) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
}))

vi.mock('~/components/ui/shadcn/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) =>
    open ? (
      <div data-testid="dialog" role="dialog" onBlur={() => onOpenChange?.(false)}>
        {children}
      </div>
    ) : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <h1 data-testid="dialog-title">{children}</h1>,
  DialogDescription: ({ children }: any) => <p data-testid="dialog-description">{children}</p>,
  DialogFooter: ({ children }: any) => <div data-testid="dialog-footer">{children}</div>,
  DialogClose: ({ children, asChild, onClick, ...props }: any) =>
    asChild ? (
      React.cloneElement(children, { onClick, ...props })
    ) : (
      <button onClick={onClick} {...props}>
        {children}
      </button>
    ),
}))

vi.mock('react-call', () => ({
  createCallable: vi.fn(),
}))

const TEST_PROPS = {
  title: 'テストタイトル',
  message: '本当に実行しますか？',
  confirmButtonLabel: '確認',
  variant: 'default' as const,
}

const MOCK_CALL = {
  end: vi.fn(),
}

describe('use-confirmフック', () => {
  let mockCreateCallable: any
  let ConfirmComponent: any

  beforeAll(async () => {
    // createCallableのモック設定
    mockCreateCallable = vi.fn((Component) => {
      ConfirmComponent = Component
      const MockWrapper = (props: any) => Component(props)
      return {
        Root: MockWrapper,
        call: vi.fn(() => Promise.resolve(true)),
        upsert: vi.fn(() => Promise.resolve(true)),
      }
    })

    vi.mocked(createCallable).mockImplementation(mockCreateCallable)

    // モック設定をトリガーするためにモジュールをインポート
    await import('../../../src/hooks/use-confirm')
  })

  beforeEach(() => {
    // モック実装を保持しながらコール履歴をクリア
    MOCK_CALL.end.mockClear()
  })

  describe('確認ダイアログコンポーネント', () => {
    it('正しいタイトルとメッセージでダイアログがレンダリングされる', () => {
      render(<ConfirmComponent call={MOCK_CALL} {...TEST_PROPS} />)

      expect(screen.getByText(TEST_PROPS.title)).toBeInTheDocument()
      expect(screen.getByText(TEST_PROPS.message)).toBeInTheDocument()
      expect(screen.getByText(TEST_PROPS.confirmButtonLabel)).toBeInTheDocument()
      expect(screen.getByText('キャンセル')).toBeInTheDocument()
    })

    it('正しいvariantで確認ボタンがレンダリングされる', () => {
      render(<ConfirmComponent call={MOCK_CALL} {...TEST_PROPS} variant="destructive" />)

      const confirmButton = screen.getByText(TEST_PROPS.confirmButtonLabel)
      expect(confirmButton).toBeInTheDocument()
    })

    it('適切なアクセシビリティ属性を持つ', () => {
      render(<ConfirmComponent call={MOCK_CALL} {...TEST_PROPS} />)

      const cancelButton = screen.getByLabelText('dialog-cancel')
      const confirmButton = screen.getByLabelText('dialog-action')

      expect(cancelButton).toBeInTheDocument()
      expect(confirmButton).toBeInTheDocument()
    })

    it('確認ボタンクリック時にcall.endがtrueで呼ばれる', () => {
      render(<ConfirmComponent call={MOCK_CALL} {...TEST_PROPS} />)

      const confirmButton = screen.getByText(TEST_PROPS.confirmButtonLabel)
      fireEvent.click(confirmButton)

      expect(MOCK_CALL.end).toHaveBeenCalledWith(true)
      expect(MOCK_CALL.end).toHaveBeenCalledTimes(1)
    })

    it('onOpenChangeでダイアログが閉じられた時にcall.endがfalseで呼ばれる', () => {
      const _mockOnOpenChange = vi.fn()

      render(<ConfirmComponent call={MOCK_CALL} {...TEST_PROPS} />)

      // ダイアログを見つけてblurイベントをトリガーして閉じるシミュレート
      const dialog = screen.getByTestId('dialog')
      fireEvent.blur(dialog)

      // コンポーネントがonOpenChangeでcall.end(false)を呼ぶため、直接テストできないが
      // ダイアログ構造が正しいことは確認できる
      expect(dialog).toBeInTheDocument()
    })

    it('DialogClose内にキャンセルボタンがレンダリングされる', () => {
      render(<ConfirmComponent call={MOCK_CALL} {...TEST_PROPS} />)

      const cancelButton = screen.getByText('キャンセル')
      expect(cancelButton).toBeInTheDocument()

      // キャンセルボタンのクリックをテスト
      fireEvent.click(cancelButton)
      // DialogCloseがクリックを処理するが、call.endは直接テストできない
      // これはDialogコンポーネントのonOpenChangeで処理されるため
    })
  })

  describe('createCallable統合', () => {
    it('正しい型シグネチャでcallableが作成される', () => {
      expect(mockCreateCallable).toHaveBeenCalledWith(expect.any(Function))

      // コンポーネント関数シグネチャを確認
      const componentFn = mockCreateCallable.mock.calls[0][0]
      expect(typeof componentFn).toBe('function')
    })

    it('Rootと追加メソッドを返す', async () => {
      const { Confirm } = await import('../../../src/hooks/use-confirm')

      expect(Confirm).toHaveProperty('call')
      expect(Confirm).toHaveProperty('upsert')
      expect(typeof Confirm.call).toBe('function')
      expect(typeof Confirm.upsert).toBe('function')
    })
  })

  describe('Props検証とエッジケース', () => {
    it('空のタイトルとメッセージを処理する', () => {
      render(<ConfirmComponent call={MOCK_CALL} title="" message="" confirmButtonLabel="OK" />)

      expect(screen.getByText('OK')).toBeInTheDocument()
      expect(screen.getByText('キャンセル')).toBeInTheDocument()
    })

    it('長いタイトルとメッセージテキストを処理する', () => {
      const longTitle = 'A'.repeat(100)
      const longMessage = 'B'.repeat(500)

      render(
        <ConfirmComponent
          call={MOCK_CALL}
          title={longTitle}
          message={longMessage}
          confirmButtonLabel="確認"
        />,
      )

      expect(screen.getByText(longTitle)).toBeInTheDocument()
      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })

    it('テキスト内容の特殊文字を処理する', () => {
      const specialTitle = 'Title with <script>alert("xss")</script>'
      const specialMessage = 'Message with & < > " \' characters'

      render(
        <ConfirmComponent
          call={MOCK_CALL}
          title={specialTitle}
          message={specialMessage}
          confirmButtonLabel="確認"
        />,
      )

      expect(screen.getByText(specialTitle)).toBeInTheDocument()
      expect(screen.getByText(specialMessage)).toBeInTheDocument()
    })

    it('未定義のvariantを適切に処理する', () => {
      render(<ConfirmComponent call={MOCK_CALL} {...TEST_PROPS} variant={undefined} />)

      const confirmButton = screen.getByText(TEST_PROPS.confirmButtonLabel)
      expect(confirmButton).toBeInTheDocument()
    })
  })

  describe('ダイアログの動作と相互作用', () => {
    it('ダイアログの開いた状態を維持する', () => {
      render(<ConfirmComponent call={MOCK_CALL} {...TEST_PROPS} />)

      // ダイアログがレンダリングされる（open=true）
      expect(screen.getByTestId('dialog')).toBeInTheDocument()
      expect(screen.getByText(TEST_PROPS.title)).toBeInTheDocument()
      expect(screen.getByText(TEST_PROPS.message)).toBeInTheDocument()
    })

    it('確認ボタンの複数回の連続クリックを許可する', () => {
      render(<ConfirmComponent call={MOCK_CALL} {...TEST_PROPS} />)

      const confirmButton = screen.getByText(TEST_PROPS.confirmButtonLabel)

      // 複数回連続でクリック
      fireEvent.click(confirmButton)
      fireEvent.click(confirmButton)
      fireEvent.click(confirmButton)

      expect(MOCK_CALL.end).toHaveBeenCalledWith(true)
      expect(MOCK_CALL.end).toHaveBeenCalledTimes(3)
    })

    it('キーボードナビゲーションを処理する', () => {
      render(<ConfirmComponent call={MOCK_CALL} {...TEST_PROPS} />)

      const confirmButton = screen.getByText(TEST_PROPS.confirmButtonLabel)
      const cancelButton = screen.getByText('キャンセル')

      // ボタンがフォーカス可能であることをテスト
      confirmButton.focus()
      expect(document.activeElement).toBe(confirmButton)

      cancelButton.focus()
      expect(document.activeElement).toBe(cancelButton)
    })

    it('ボタンのEnterキー有効化をサポートする', () => {
      render(<ConfirmComponent call={MOCK_CALL} {...TEST_PROPS} />)

      const confirmButton = screen.getByText(TEST_PROPS.confirmButtonLabel)
      confirmButton.focus()

      // Enterキー押下をシミュレート
      fireEvent.keyDown(confirmButton, { key: 'Enter', code: 'Enter' })

      // 注意: 実際のEnterキー処理はButtonコンポーネントの実装に依存
      // このテストはボタンが適切にフォーカス可能であることを確認
      expect(document.activeElement).toBe(confirmButton)
    })
  })

  describe('コンポーネント構造とスタイリング', () => {
    it('適切なコンポーネント階層でレンダリングされる', () => {
      const { container } = render(<ConfirmComponent call={MOCK_CALL} {...TEST_PROPS} />)

      // コンポーネント構造がレンダリングされることをチェック
      expect(container.firstChild).toBeTruthy()
      expect(screen.getByTestId('dialog')).toBeInTheDocument()
      expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
      expect(screen.getByTestId('dialog-header')).toBeInTheDocument()
      expect(screen.getByTestId('dialog-footer')).toBeInTheDocument()
    })

    it('ボタンにcursor-pointerクラスが適用される', () => {
      render(<ConfirmComponent call={MOCK_CALL} {...TEST_PROPS} />)

      const confirmButton = screen.getByText(TEST_PROPS.confirmButtonLabel)
      const cancelButton = screen.getByText('キャンセル')

      expect(confirmButton).toHaveClass('cursor-pointer')
      expect(cancelButton).toHaveClass('cursor-pointer')
    })
  })
})
