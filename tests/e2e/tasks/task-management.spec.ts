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
      await expect(page.getByText(taskTitle)).toBeVisible()

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
      // タスクが表示されるまで待機
      const taskCheckbox = page.locator('[data-testid^="task-checkbox-"]').first()
      await expect(taskCheckbox).toBeVisible()

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
})
