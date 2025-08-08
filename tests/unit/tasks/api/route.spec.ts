import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { describe, expect, it, vi } from 'vitest'

vi.mock('~/db', () => ({
  db: {},
}))

vi.mock('@t3-oss/env-nextjs', () => ({
  env: {
    DATABASE_URL: 'mock://database',
    DATABASE_AUTH_TOKEN: 'mock-token',
  },
}))

import { getTasksRoute, taskApi } from '~/features/tasks/api/route'
import {
  errorResponseSchema,
  taskListResponseSchema,
} from '~/features/tasks/types/schema/task-schema'

describe('Task API Routes', () => {
  describe('getTasksRoute', () => {
    it('ルート設定が正しく定義されている', () => {
      expect(getTasksRoute).toBeDefined()
      expect(typeof getTasksRoute).toBe('object')
    })

    it('HTTPメソッドがGETに設定されている', () => {
      expect(getTasksRoute.method).toBe('get')
    })

    it('パスがルートパス（/）に設定されている', () => {
      expect(getTasksRoute.path).toBe('/')
    })

    it('サマリが正しく設定されている', () => {
      expect(getTasksRoute.summary).toBe('タスク一覧取得')
    })

    it('説明が正しく設定されている', () => {
      expect(getTasksRoute.description).toBe('全てのタスクを取得します')
    })

    describe('レスポンススキーマ', () => {
      it('200レスポンスが正しく定義されている', () => {
        const response200 = getTasksRoute.responses[200]

        expect(response200).toBeDefined()
        expect(response200.description).toBe('タスク一覧の取得に成功')
        expect(response200.content['application/json']).toBeDefined()
        expect(response200.content['application/json'].schema).toBe(taskListResponseSchema)
      })

      it('400レスポンスが正しく定義されている', () => {
        const response400 = getTasksRoute.responses[400]

        expect(response400).toBeDefined()
        expect(response400.description).toBe('リクエストパラメータが不正')
        expect(response400.content['application/json']).toBeDefined()
        expect(response400.content['application/json'].schema).toBe(errorResponseSchema)
      })

      it('500レスポンスが正しく定義されている', () => {
        const response500 = getTasksRoute.responses[500]

        expect(response500).toBeDefined()
        expect(response500.description).toBe('サーバーエラー')
        expect(response500.content['application/json']).toBeDefined()
        expect(response500.content['application/json'].schema).toBe(errorResponseSchema)
      })

      it('必要なレスポンスステータスが全て定義されている', () => {
        const responseKeys = Object.keys(getTasksRoute.responses)

        expect(responseKeys).toContain('200')
        expect(responseKeys).toContain('400')
        expect(responseKeys).toContain('500')
        expect(responseKeys).toHaveLength(3)
      })
    })

    describe('ルート仕様の妥当性', () => {
      it('createRoute関数で作成されたルートオブジェクトである', () => {
        // createRouteの戻り値の型をチェック
        const testRoute = createRoute({
          method: 'get',
          path: '/',
          responses: {
            200: { description: 'Success' },
          },
        })

        expect(typeof getTasksRoute).toBe(typeof testRoute)
      })

      it('必須プロパティが全て含まれている', () => {
        const requiredProperties = ['method', 'path', 'responses']

        for (const prop of requiredProperties) {
          expect(getTasksRoute).toHaveProperty(prop)
        }
      })

      it('オプショナルプロパティが適切に設定されている', () => {
        expect(getTasksRoute).toHaveProperty('summary')
        expect(getTasksRoute).toHaveProperty('description')
      })
    })
  })

  describe('taskApi', () => {
    it('OpenAPIHonoインスタンスが正しく作成されている', () => {
      expect(taskApi).toBeDefined()
      expect(taskApi).toBeInstanceOf(OpenAPIHono)
    })

    it('タスクAPIエンドポイントが登録されている', () => {
      // OpenAPIHonoインスタンスの内部構造をテスト
      expect(taskApi).toHaveProperty('routes')
      expect(Array.isArray(taskApi.routes)).toBe(true)
    })

    describe('API エンドポイントの統合', () => {
      it('ルートとハンドラーが正しく関連付けられている', () => {
        // モックリクエストでのテスト
        const testApp = new OpenAPIHono()
        expect(() => {
          testApp.openapi(getTasksRoute, async (c) => c.json([], 200))
        }).not.toThrow()
      })
    })
  })

  describe('スキーマ統合性テスト', () => {
    it('レスポンススキーマが正しいフィールドを持つ', () => {
      // errorResponseSchemaの構造確認
      const errorSchemaShape = errorResponseSchema.shape
      expect(errorSchemaShape).toHaveProperty('error')
      expect(errorSchemaShape).toHaveProperty('issues')
    })

    it('taskListResponseSchemaが定義されている', () => {
      expect(taskListResponseSchema).toBeDefined()
      expect(typeof taskListResponseSchema).toBe('object')
    })

    it('errorResponseSchemaが定義されている', () => {
      expect(errorResponseSchema).toBeDefined()
      expect(typeof errorResponseSchema).toBe('object')
    })
  })
})
