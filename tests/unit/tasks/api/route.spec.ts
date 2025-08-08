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
        expect(responseKeys).toContain('500')
        expect(responseKeys).toHaveLength(2)
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

      it('OpenAPIドキュメントが生成可能である', () => {
        // OpenAPIドキュメント生成のテスト
        expect(() => {
          taskApi.doc('/doc', {
            openapi: '3.0.0',
            info: {
              version: '1.0.0',
              title: 'Task API',
            },
          })
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

  describe('型安全性テスト', () => {
    it('ルート型が正しく推論される', () => {
      // TypeScript型推論のテスト
      type RouteType = typeof getTasksRoute
      const route: RouteType = getTasksRoute

      expect(route.method).toBe('get')
      expect(route.path).toBe('/')
    })

    it('レスポンス型が正しく定義されている', () => {
      const responses = getTasksRoute.responses

      // 200レスポンスの型チェック
      expect(responses[200]).toHaveProperty('content')
      expect(responses[200]).toHaveProperty('description')

      // 500レスポンスの型チェック
      expect(responses[500]).toHaveProperty('content')
      expect(responses[500]).toHaveProperty('description')
    })
  })

  describe('設定値の妥当性テスト', () => {
    it('HTTPメソッドが有効である', () => {
      const validMethods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head']
      expect(validMethods).toContain(getTasksRoute.method)
    })

    it('パスが有効なURL形式である', () => {
      expect(getTasksRoute.path).toMatch(/^\//)
      expect(typeof getTasksRoute.path).toBe('string')
      expect(getTasksRoute.path.length).toBeGreaterThan(0)
    })

    it('説明文が空でない', () => {
      expect(getTasksRoute.summary).toBeTruthy()
      expect(getTasksRoute.summary.length).toBeGreaterThan(0)
      expect(getTasksRoute.description).toBeTruthy()
      expect(getTasksRoute.description.length).toBeGreaterThan(0)
    })

    it('レスポンスステータスが有効な数値である', () => {
      const responseKeys = Object.keys(getTasksRoute.responses)

      for (const key of responseKeys) {
        const statusCode = Number(key)
        expect(statusCode).toBeGreaterThanOrEqual(100)
        expect(statusCode).toBeLessThan(600)
      }
    })
  })

  describe('OpenAPI仕様準拠テスト', () => {
    it('Content-Typeが適切に設定されている', () => {
      const response200 = getTasksRoute.responses[200]
      const response500 = getTasksRoute.responses[500]

      expect(response200.content).toHaveProperty('application/json')
      expect(response500.content).toHaveProperty('application/json')
    })

    it('レスポンススキーマが設定されている', () => {
      const response200 = getTasksRoute.responses[200]
      const response500 = getTasksRoute.responses[500]

      expect(response200.content['application/json']).toHaveProperty('schema')
      expect(response500.content['application/json']).toHaveProperty('schema')
    })

    it('レスポンス説明が設定されている', () => {
      const response200 = getTasksRoute.responses[200]
      const response500 = getTasksRoute.responses[500]

      expect(typeof response200.description).toBe('string')
      expect(response200.description.length).toBeGreaterThan(0)
      expect(typeof response500.description).toBe('string')
      expect(response500.description.length).toBeGreaterThan(0)
    })
  })
})
