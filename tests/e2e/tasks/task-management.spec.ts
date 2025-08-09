import { expect, test } from '@playwright/test'

// テストの信頼性向上のためのデバッグモードを有効化
test.setTimeout(30000)

test.describe('タスク管理アプリケーション', () => {
  test.beforeEach(async ({ page }) => {
    // 各テスト前にホームページへナビゲート
    await page.goto('/')

    // ページが完全に読み込まれるまで待機
    await page.waitForLoadState('networkidle')
  })

  test.describe('ページ表示', () => {
    test('メインページが正常に表示される', async ({ page }) => {
      // メイン要素が表示されているかチェック
      await expect(page.getByTestId('task-manager-container')).toBeVisible()
      await expect(page.getByTestId('header')).toBeVisible()
      await expect(page.getByTestId('main-title')).toHaveText('タスク管理')
      await expect(page.getByTestId('main-description')).toContainText(
        'やるべきことを整理して、効率的に作業を進めましょう。',
      )

      // 初期ページ表示のスクリーンショット
      await page.screenshot({
        path: 'tests/e2e/tasks/screenshots/main-page-initial-display.png',
      })
    })

    test('タスク作成フォームが表示される', async ({ page }) => {
      // タスク作成フォーム要素をチェック
      await expect(page.getByTestId('task-create-card')).toBeVisible()
      await expect(page.getByTestId('task-create-title')).toHaveText('新しいタスクを作成')
      await expect(page.getByTestId('task-create-form')).toBeVisible()
      await expect(page.getByTestId('task-title-input')).toBeVisible()
      await expect(page.getByTestId('task-submit-button')).toBeVisible()

      // タスク作成フォーム表示のスクリーンショット
      await page.screenshot({
        path: 'tests/e2e/tasks/screenshots/task-create-form-display.png',
      })
    })

    test('タスクリストセクションが表示される', async ({ page }) => {
      // タスクリストセクションをチェック
      await expect(page.getByTestId('task-list-section')).toBeVisible()
    })
  })

  test.describe('タスク作成機能', () => {
    test('新しいタスクを作成できる', async ({ page }) => {
      const taskTitle = `テストタスク${Date.now()}`

      // タスク作成フォームに入力
      await page.getByTestId('task-title-input').fill(taskTitle)

      // フォームを送信
      await page.getByTestId('task-submit-button').click()

      // タスクが作成されページが更新されるまで待機
      await page.waitForLoadState('networkidle')

      // タスクがリストに表示されることを確認
      // Firefoxでの表示遅延に対応するため、より長いタイムアウトを設定
      await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 15000 })

      // タスク作成成功後のスクリーンショット
      await page.screenshot({
        path: 'tests/e2e/tasks/screenshots/task-creation-success.png',
      })
    })

    test('空のタスクタイトルでエラーが表示される', async ({ page }) => {
      // 空のフォームを送信しようとする
      await page.getByTestId('task-submit-button').click()

      // バリデーションエラーをチェック
      await expect(page.getByTestId('task-title-error')).toBeVisible()

      // バリデーションエラー表示のスクリーンショット
      await page.screenshot({
        path: 'tests/e2e/tasks/screenshots/validation-error-display.png',
      })
    })

    test('タスク作成中にローディング状態が表示される', async ({ page }) => {
      // タスクタイトルを入力
      await page.getByTestId('task-title-input').fill('ローディングテスト')

      // 送信をクリックして即座にローディング状態をチェック
      const submitPromise = page.getByTestId('task-submit-button').click()

      // ボタンがローディング状態（無効化）であることを確認
      await expect(page.getByTestId('task-submit-button')).toBeDisabled()

      // ローディング状態のスクリーンショット
      await page.screenshot({
        path: 'tests/e2e/tasks/screenshots/loading-state-display.png',
      })

      await submitPromise
    })
  })

  test.describe('タスク操作機能', () => {
    test.beforeEach(async ({ page }) => {
      // 各テスト前にテストタスクを作成
      const testTaskTitle = `テスト用タスク${Date.now()}`
      await page.getByTestId('task-title-input').fill(testTaskTitle)
      await page.getByTestId('task-submit-button').click()
      await page.waitForLoadState('networkidle')
    })

    test('タスクの完了状態を切り替えられる', async ({ page }) => {
      // タスクが表示されるまで待機（Firefoxでの表示遅延に対応）
      const taskCheckbox = page.locator('[data-testid^="task-checkbox-"]').first()
      await expect(taskCheckbox).toBeVisible({ timeout: 15000 })

      // タスクの完了状態をチェック
      await taskCheckbox.click()

      // タスクが完了としてマークされていることを確認
      await expect(taskCheckbox).toBeChecked()

      // 完了状態のスクリーンショット
      await page.screenshot({
        path: 'tests/e2e/tasks/screenshots/task-completed-state.png',
      })

      // タスクのチェックを外す
      await taskCheckbox.click()

      // タスクのマークが外されていることを確認
      await expect(taskCheckbox).not.toBeChecked()

      // 未完了状態のスクリーンショット
      await page.screenshot({
        path: 'tests/e2e/tasks/screenshots/task-uncompleted-state.png',
      })
    })

    test('タスクを削除できる', async ({ page }) => {
      // タスクが表示されるまで待機
      const deleteButton = page.locator('[data-testid^="task-delete-button-"]').first()
      await expect(deleteButton).toBeVisible()

      // 削除前にタスクタイトルを取得
      const taskTitle = page.locator('[data-testid^="task-title-"]').first()
      const titleText = await taskTitle.textContent()

      // 削除前のタスク表示状態のスクリーンショット
      await page.screenshot({
        path: 'tests/e2e/tasks/screenshots/task-before-deletion.png',
      })

      // 確認ダイアログハンドラーを設定
      page.on('dialog', async (dialog) => {
        expect(dialog.message()).toContain('タスクを削除しますか')
        await dialog.accept()
      })

      // 削除ボタンをクリック
      await deleteButton.click()

      // 削除が完了するまで待機
      await page.waitForLoadState('networkidle')

      // タスクが表示されなくなったことを確認
      if (titleText) {
        await expect(page.getByText(titleText)).not.toBeVisible()
      }

      // 削除後の状態のスクリーンショット
      await page.screenshot({
        path: 'tests/e2e/tasks/screenshots/task-after-deletion.png',
      })
    })
  })

  test.describe('バリデーション機能', () => {
    test('空文字でエラーが表示される', async ({ page }) => {
      // 空のフォームを送信
      await page.getByTestId('task-submit-button').click()
      
      // エラーメッセージの確認
      await expect(page.getByTestId('task-title-error')).toBeVisible()
      await expect(page.getByTestId('task-title-error')).toHaveText('タスクタイトルは1文字以上で入力してください')
    })

    test('スペース・改行・タブのみでエラーが表示される', async ({ page }) => {
      // スペースのみを入力
      await page.getByTestId('task-title-input').fill('   ')
      await page.getByTestId('task-submit-button').click()
      
      // エラーが表示されることを確認
      await expect(page.getByTestId('task-title-error')).toBeVisible()
      await expect(page.getByTestId('task-title-error')).toHaveText('タスクタイトルは1文字以上で入力してください')
      
      // 改行のみを入力
      await page.getByTestId('task-title-input').fill('\n\n')
      await page.getByTestId('task-submit-button').click()
      
      // エラーが表示されることを確認
      await expect(page.getByTestId('task-title-error')).toBeVisible()
      
      // タブのみを入力
      await page.getByTestId('task-title-input').fill('\t\t')
      await page.getByTestId('task-submit-button').click()
      
      // エラーが表示されることを確認
      await expect(page.getByTestId('task-title-error')).toBeVisible()
    })

    test('特殊文字を含む有効入力でタスクが作成される', async ({ page }) => {
      const timestamp = Date.now()
      const specialTitle = `タスク!@#$%^&*()🚀-${timestamp}`
      
      // 特殊文字を含む文字列を入力
      await page.getByTestId('task-title-input').fill(specialTitle)
      await page.getByTestId('task-submit-button').click()
      
      // ページが更新されるまで待機
      await page.waitForLoadState('networkidle')
      
      // エラーが表示されないことを確認
      await expect(page.getByTestId('task-title-error')).not.toBeVisible()
      
      // タスクが正常に作成されることを確認
      await expect(page.getByText(specialTitle)).toBeVisible({ timeout: 10000 })
    })

    test('境界値テスト（255文字・256文字）', async ({ page }) => {
      // 255文字（有効）- ユニークIDを追加
      const timestamp = Date.now().toString()
      const validTitle = 'a'.repeat(255 - timestamp.length - 1) + '-' + timestamp // 正確に255文字
      await page.getByTestId('task-title-input').fill(validTitle)
      await page.getByTestId('task-submit-button').click()
      
      // ページが更新されるまで待機
      await page.waitForLoadState('networkidle')
      
      // エラーが表示されないことを確認
      await expect(page.getByTestId('task-title-error')).not.toBeVisible()
      
      // タスクが作成されることを確認
      await expect(page.getByText(validTitle)).toBeVisible({ timeout: 10000 })
      
      // 256文字（無効）- ユニークIDを追加
      const invalidTitle = 'b'.repeat(256)
      await page.getByTestId('task-title-input').fill(invalidTitle)
      await page.getByTestId('task-submit-button').click()
      
      // エラーメッセージの確認
      await expect(page.getByTestId('task-title-error')).toBeVisible()
      await expect(page.getByTestId('task-title-error')).toHaveText('タスクタイトルは255文字以内で入力してください')
    })

    test('トリム機能のテスト', async ({ page }) => {
      const timestamp = Date.now()
      const titleWithSpaces = `  有効なタスクタイトル-${timestamp}  `
      const trimmedTitle = `有効なタスクタイトル-${timestamp}`
      
      // 前後にスペースを含む文字列を入力
      await page.getByTestId('task-title-input').fill(titleWithSpaces)
      await page.getByTestId('task-submit-button').click()
      
      // ページが更新されるまで待機
      await page.waitForLoadState('networkidle')
      
      // エラーが表示されないことを確認
      await expect(page.getByTestId('task-title-error')).not.toBeVisible()
      
      // トリムされた文字列でタスクが作成されることを確認
      await expect(page.getByText(trimmedTitle)).toBeVisible({ timeout: 10000 })
    })
  })
})
