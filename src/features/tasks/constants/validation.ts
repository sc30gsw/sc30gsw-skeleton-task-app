export const TASK_SUCCESS_MESSAGES = {
  TASK_CREATED: { code: 'CREATE_SUCCESS', message: 'タスクが作成されました' },
  TASK_UPDATED: { code: 'UPDATE_SUCCESS', message: 'タスクが更新されました' },
  TASK_DELETED: { code: 'DELETE_SUCCESS', message: 'タスクが削除されました' },
} as const satisfies Record<string, Record<string, string>>

export const TASK_ERROR_MESSAGES = {
  TASK_GET_FAILED: { code: 'FETCH_ERROR', message: 'タスクの取得に失敗しました' },
  TASK_CREATE_FAILED: { code: 'CREATE_ERROR', message: 'タスクの作成に失敗しました' },
  TASK_UPDATE_FAILED: {
    code: 'UPDATE_ERROR',
    message: 'タスクのステータス更新に失敗しました。もう一度お試しください。',
  },
  TASK_DELETE_FAILED: {
    code: 'DELETE_ERROR',
    message: 'タスクの削除に失敗しました。もう一度お試しください。',
  },
  INVALID_TASK_ID: { code: 'INVALID_ID_ERROR', message: '無効なタスクIDです' },
  TASK_NOT_FOUND: { code: 'NOT_FOUND_ERROR', message: 'タスクが見つかりませんでした' },
} as const satisfies Record<string, Record<string, string>>

export const TITLE_VALIDATION = {
  MIN_LENGTH: { value: 1, message: 'タスクタイトルは1文字以上で入力してください' },
  MAX_LENGTH: { value: 255, message: 'タスクタイトルは255文字以内で入力してください' },
} as const satisfies Record<string, { value: number; message: string }>
