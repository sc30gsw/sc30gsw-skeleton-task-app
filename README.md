
# Task Management Application

## 概要

本アプリケーションは、シンプルなタスク管理機能を提供するWebアプリケーションです。モダンなフロントエンド・バックエンド技術を統合し、型安全性とパフォーマンスを両立した設計を採用しています。

### 主要機能
- ✅ タスクの作成・一覧表示・ステータス更新・削除
- ✅ レスポンシブUI（shadcn/ui + Tailwind CSS）
- ✅ リアルタイムデータ更新（Server Actions + キャッシュ管理）
- ✅ 型安全なAPI（Hono RPC + Zod）
- ✅ 包括的テストカバレッジ（Vitest + Playwright）

## アーキテクチャ概要

本アプリケーションは、**Next.js 15 + Hono BFF (Backend for Frontend)** によるハイブリッドアーキテクチャを採用しています。

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   BFF (Hono)     │    │   Database      │
│                 │    │                  │    │                 │
│ • React 19 RSC  │◄──►│ • Type-safe RPC  │◄──►│ • Turso(LibSQL) │
│ • Server Actions│    │ • Zod OpenAPI    │    │ • Drizzle ORM   │
│ • Client Comps  │    │ • Route Handlers │    │ • Schema-driven │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### データフロー
1. **Server Components**: サーバーサイドでデータ取得・初期レンダリング
2. **Client Components**: ユーザーインタラクション・フォーム処理
3. **Server Actions**: Mutationによるデータ更新・キャッシュ無効化
4. **RPC Client**: 型安全なAPI呼び出し（HonoクライアントとInferResponseType）

### 設計原則
- **Server-First**: RSCによるサーバーサイド最適化
- **Type Safety**: エンドツーエンド型安全性
- **Performance**: 最小限のJavaScriptバンドル
- **Testability**: 各レイヤーの独立テスト可能性
- **Maintainability**: Feature-driven設計による責務分離

## 環境構築
以下の手順にしたがい、環境構築を行ってください

### 1. envファイルの作成
```bash
# you can pick out any env file's name you like.
touch .env .env.test
```

### 2. envファイルに以下の内容を記述
#### 2.1 開発環境
```ts: .env
NEXT_PUBLIC_APP_BASE_URL = http://localhost:3000

DATABASE_URL = <database-url>
DATABASE_AUTH_TOKEN = <database-auth-token>
```

#### 2.2 テスト環境
```ts: .env.test
NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000
DATABASE_URL=file:./test.db
```

### 3. 依存関係のインストール
```bash
bun i
```

### 4. 開発サーバーの起動
```bash
bun dev
```

### 5. テストについて
- Vitestを用いて各種Unitテストを実装する
- Playwrightを用いてE2Eテストを実施する

### 6. テストデータベース設定

#### テストデータベースの概要
E2Eテスト実行時には、本番・開発環境から完全に分離されたローカルSQLiteデータベースを使用します。

#### データベース選択の理由
**ローカルSQLiteを選択した理由（Tursoレプリケーション機能ではなく）**：
- **コスト効率**: 完全無料（追加料金なし）
- **高速実行**: ネットワーク通信なしのローカルファイルアクセス
- **完全分離**: 本番・開発データへの影響ゼロ
- **シンプル**: 設定・管理が簡単
- **CI/CD対応**: 環境構築が容易

#### 現在の設定
- **テスト用DB**: `DATABASE_URL=file:./test.db`
- **環境変数ファイル**: `.env.test`
- **自動初期化**: テスト実行前に自動DB作成・マイグレーション実行
- **自動クリーンアップ**: 毎回新しいDBでテスト実行

#### テスト実行方法
```bash
# E2Eテスト実行（DB自動初期化付き）
bun test:e2e

# テスト用DB初期化のみ実行
bun test:e2e:setup
```

#### 仕組みの詳細
1. **自動DB初期化**: `scripts/setup-test-db.ts`が実行前にtest.dbを初期化
2. **環境変数切り替え**: Playwright設定により自動的に`.env.test`を読み込み
3. **完全分離**: 本番・開発環境のデータベースに一切影響なし
4. **高速テスト**: ローカルファイル使用により高速テスト実行

## API ドキュメント

本アプリケーションでは、[Scalar](https://scalar.com/)を使用してAPIドキュメントを提供しています。ScalarはOpenAPI仕様に基づいた美しく使いやすいAPIリファレンスを自動生成するツールです。

### Scalar APIドキュメントのアクセス方法

開発サーバー起動後、以下のURLでAPIドキュメントにアクセスできます：

- **Scalar UI**: `http://localhost:3000/api/scalar`
  - インタラクティブなAPIドキュメントUI
  - リクエスト/レスポンスの詳細確認
  - ブラウザ上でのAPI試行機能

- **OpenAPI仕様**: `http://localhost:3000/api/doc`
  - 生のOpenAPI 3.0仕様（JSON形式）
  - API定義の詳細確認
  - 他のツールでのインポート用

### 利用方法

1. **APIエンドポイントの確認**: 各APIの詳細な仕様、パラメータ、レスポンス形式を確認
2. **テストリクエスト送信**: ブラウザ上で直接APIリクエストを試行
3. **コード例の参照**: 各言語でのリクエスト例を確認
4. **認証情報の設定**: 必要に応じて認証情報を設定してテスト実行

### 特徴

- **リアルタイム同期**: コードの変更が自動的にドキュメントに反映
- **型安全性**: Zodスキーマによる厳密な型定義とバリデーション
- **開発効率**: フロントエンドとバックエンドの連携確認が容易

## コーディング規約
### はじめに
本コーディング規約はNext.jsのドキュメントおよび、[Next.jsの考え方](https://zenn.dev/akfm/books/nextjs-basic-principle/viewer/intro)に基づき記載しております

### 共通原則
以下、共通の原則となります
- routingの機能および、Suspenseを活用し、適切なチャンク化を行うこと
- slotsの概念やComposition Patternを活用し、Client Module Graphを小さくし、Clientに送信されるJSバンドルを小さくすること（RSC内に移せる記述は移し、Server Module Graphを大きくする方針とする）
- 本プロジェクトでは[React Compiler](https://ja.react.dev/learn/react-compiler)を使用しているため、原則、`useMemo`や`useCallback`などのメモ化のhooksは不要とします
- PR前に実装者は`bun run build:clean`を実行し、ビルドが通ることを確認すること

### 命名について
- ファイル名・フォルダ名（dynamic routesを除く）はケバブケースを、変数名や関数名はキャメルケースを使用してください

### 関数定義について
- propsなど、個々人の記述に差異がでないよう原則、関数宣言を使用してください（例: export default async function sample() {}）

### APIについて
- [Zod  OpenAPI](https://hono.dev/examples/zod-openapi)によるAPI定義実装を行うこと

### コンポーネント設計について
- コンポーネント設計は[AHA Programming](https://kentcdodds.com/blog/aha-programming)に従い、実装を進めること
- 本プロジェクトではコンポーネントライブラリとして[shacn/ui](https://ui.shadcn.com/)を使用しているため、原則、コンポーネントはshadcn/uiに存在するものを使用する
  - shadcn/uiにあるが、プロジェクトにコンポーネントがない場合は、CLI経由で導入すること（以下、コマンド例）

```bash
bunx --bun shadcn@latest add button
```

### ディレクトリ戦略について
- ディレクトリ戦略は[bulletproof-react](https://github.com/alan2207/bulletproof-react)に従い、実装を進めること
  - ※ 具体的なディレクトリ構成は「ディレクトリ構成」の項に記載

### データフェッチについて
- RequestMemorizationおよび、並列フェッチ・preloadを活用しデータフェッチのウォーターフォールを避けること
- データフェッチはデータフェッチ コロケーションに従い、末端のリーフコンポーネントで行うこと
- fetchには`src/lib/upfetch.ts`を使用して実施し、ジェネリクスなどを活用し、型安全な実装を行うこと
  - 使用時は、HonoのPRCによる機能を使用し、urlと`InferResponseType`などを使用することを推奨

### cacheについて
- React.cacheやNextのcache tagを使用し、適切なcache管理を行うこと
- 原則、fetchにはcache: 'force-cache'を指定したうえで、tag付けを行うこと（SSRの場合はcache: 'no-store'を指定すること）
  - Next.js v15からはfetchの拡張がなくなり、デフォルトがcache: 'no-store'となっているが、本プロジェクトでは明示的にオプションを記載する

### server actionsについて
- Mutationの処理のみに使用してください
  - ※ Client Componentでfetchの代替に使用しないでください
  - 上記を実装する場合、Reactのuse APIを使用するか、[tanstack-query](https://tanstack.com/query/latest)や[SWR](https://swr.vercel.app/ja)などのClient Fetch Libraryの導入を検討してください

## ディレクトリ構成
ディレクトリ構成は[bulletproof-react](https://github.com/alan2207/bulletproof-react)に従い、以下の構成とします。

```
/skelton-task-app-main
  ├ migrations : Drizzle ORMによって生成されるデータベースマイグレーションファイル群
  |  ├ meta: マイグレーションメタデータフォルダ
  |  |   ├ _journal.json : マイグレーション履歴を追跡するジャーナルファイル
  |  |   └ XXXX_snapshot.json : データベーススキーマのスナップショットファイル
  |  └  XXXX_xxxx_xxxx.sql: 実際のSQLマイグレーション実行ファイル
  ├ public : 画像・アイコン・ファビコンなどの静的アセット類
  ├ script : プロジェクトで使用するスクリプトファイル
  |  └  setup-test-db.ts: テスト用DB構築スクリプト
  ├ src
  |  ├ app: ルーティング定義
  |  |  ├ api: Route Handler
  |  |  |  └[[...route]] : optional catch-all segmentsによるAPIルート
  |  |  |     └ route.ts: HonoのAPI Route定義
  |  |  ├ layout.tsx: ルートレイアウト
  |  |  ├ page.tsx : ルートページコンポーネント
  |  |  ├ loading.tsx: ルートローディングUI
  |  |  ├ error.tsx : ルートエラーページ（グローバルエラーページ）
  |  |  ├ not-found.tsx : 404ページ
  |  |  ├ globals.css : グローバルスタイル
  |  |  ├ favicon.ico : ファビコン
  |  |  └ sample-route（サンプルルーティング）※ `sample`の部分には画面ごとに本来のパス名が入る
  |  |     ├ layout.tsx : 当該ルーティングにおける共通レイアウト
  |  |     ├ loading.tsx : 当該ルーティングにおけるローディングUI
  |  |     ├ error.tsx : 当該ルーティングにおけるエラーページ
  |  |     └ page.tsx : 当該ルーティングにおけるページコンポーネント
  |  ├ components : アプリ全体で使われるコンポーネント実装
  |  |  ├ providers: アプリ全体で使われるProvider郡
  |  |  |  └ *-provider.tsx : その他、任意のProvider
  |  |  └ ui: アプリケーション全体で使用するUI コンポーネントを格納する
  |  |     ├ header.tsx: アプリケーション Header
  |  |     ├ footer.tsx: アプリケーション Footer
  |  |     └ shadcn: shadcn/uiのコンポーネント
  |  |       ├ button.tsx : shadcn/uiのButton
  |  |       ├ input.tsx : shadcn/uiのInput
  |  |       ├ card.tsx : shadcn/uiのCard
  |  |       └ *** : shadcn/uiのコンポーネント
  |  ├ features : 当該ルーティングにおける機能実装
  |  |  ├ tasks: 機能に関連するディレクトリをまとめる親ディレクトリ（機能に関連した命名を行う）
  |  |  |   ├ actions : server actionsを格納（server actionsは原則1ファイル（モジュール）1関数としてください）
  |  |  |   |  └ *.ts : 任意のserver actions
  |  |  |   ├ api : 当該機能のAPIルート定義とハンドラー定義
  |  |  |   |  ├ handler.ts : APIエンドポイントのリクエスト/レスポンス処理を実装するハンドラー関数
  |  |  |   |  └ route.ts : HonoのOpenAPI仕様に基づくルート定義
  |  |  |   ├ components : 当該機能で使用するコンポーネントをまとめるディレクトリ（UI層）
  |  |  |   |  ├ task-list.ts : ユーザー一覧をfetch・表示するコンポーネント
  |  |  |   |  └ *.ts : 任意のコンポーネント
  |  |  |   ├ constants : 当該機能で使用する定数をまとめるディレクトリ
  |  |  |   |  ├ task.ts : Taskに関連する定数
  |  |  |   |  └ *.ts : 任意の定数
  |  |  |   ├ hooks : 当該機能で使用するhooksをまとめるディレクトリ（ロジック層の分離）
  |  |  |   |  └ *-hook.ts: 任意のhooks
  |  |  |   ├ server : 当該機能のServer Component側で利用するfetchやqueryをまとめるディレクトリ
  |  |  |   |  └ fetcher.ts: Server Componentで利用するfetcher
  |  |  |   ├ services : 当該機能のAPIやServer ActionsのCRUDのビジネスロジックをまとめるディレクトリ（ドメイン層）
  |  |  |   |  └ task-service.ts: Taskに関するビジネスルールとデータ操作を実装するサービスクラス
  |  |  |   ├ types : 当該機能で使用する型定義をまとめるディレクトリ
  |  |  |   |  ├ schema : zod schemaをまとめるディレクトリ
  |  |  |   |  |  └ *-schema.ts : 任意のzod schema
  |  |  |   |  ├ task.ts : taskに関する型定義
  |  |  |   |  └ *.ts : 任意の型定義ファイル
  |  |  |   └ utils : 当該機能で使用するユーティリティ定義をまとめるディレクトリ
  |  |  └ *: 任意の機能ディレクトリ
  |  ├ hooks : アプリ全体で使われるカスタムフック(use-***.ts)
  |  ├ middleware.ts : [ミドルウェア実装](https://nextjs.org/docs/app/building-your-application/routing/middleware)
  ├  ├ types : アプリ全体で使われる型定義
  ├  |   └ *.ts: 任意の型定義
  ├  ├ constants : アプリ全体で使われる定数
  ├  ├ utils : アプリ全体で使われるユーティリティ実装
  ├  ├ db : DB設定やテーブルスキーマ定義
  |  |  ├ index.ts : DB設定定義
  |  |  └ schema.ts : テーブルスキーマ定義
  ├  └ lib :アプリ全体で使用されるライブラリの設定定義や共通ヘルパー関数
  |     ├ upfetch.ts : up-fetchを利用したfetchヘルパー
  |     ├ utils.ts : Tailwind CSSスタリングのマージヘルパー
  |     └ schema.ts : テーブルスキーマ定義
  ├ tests: テストコード
  |  ├ unit: Unit テストコード
  |  |  ├ utils: アプリケーション全体で使用する utilityのUnit テストコード
  |  |  | 　└ *-spec.ts: テストコード
  |  |  ├ components: アプリケーション全体で使用する componentのUnit テストコード
  |  |  | 　└ *-spec.ts: テストコード
  |  |  ├ hooks: アプリケーション全体で使用するhooksのUnit テストコード
  |  |  |   └ *-hook-spec.ts: テストコード
  |  |  ├ tasks: tasks feature unit テスト ディレクトリ
  |  |  |   ├ api: apiのUnit テストコード
  |  |  |   |  └ *-spec.ts: テストコード
  |  |  |   ├ utils: utilityのUnit テストコード
  |  |  |   | └ *-spec.ts: テストコード
  |  |  |   ├ components: componentのUnit テストコード
  |  |  |   |  └ *-spec.ts: テストコード
  |  |  |   └ hooks: hooksのUnit テストコード
  |  |  |     └ *-spec.ts: テストコード
  |  └ e2e: E2E テストコード
  |     └  tasks: utilityのUnit テストコード
  |          ├ screenshots: E2Eテスト実行時スクリーンショット
  |          └ *-spec.ts: テストコード
  ├ .env.* : 環境変数定義ファイル群（開発・本番・テスト等の環境別設定）
  ├ .env.test : テスト実行時専用の環境変数設定ファイル
  ├ .gitignore : Git バージョン管理から除外するファイル・ディレクトリの指定
  ├ biome.jsonc : Biomeの設定ファイル
  ├ bun.lock : Bunパッケージマネージャーの依存関係 lockファイル
  ├ components.json : shadcn/ui コンポーネントライブラリの設定
  ├ drizzle.config.ts : Drizzle ORM の設定
  ├ next.config.ts : Next.js の設定
  ├ package.json : プロジェクト依存関係・スクリプト・メタデータ定義
  ├ playwright.config.ts : Playwright の設定
  ├ postcss.config.mjs : PostCSS プロセッサーとTailwind CSS プラグインの設定
  ├ README.md : プロジェクト概要・セットアップ手順・アーキテクチャドキュメントなど
  ├ test.db : テスト環境用ローカルDB
  ├ tsconfig.json : TypeScript の設定
  └ vitest.config.ts : Vitest の設定
```

## 主要ライブラリ
- [Hono](https://hono.dev/): バックエンドフレームワーク
- [Drizzle](https://orm.drizzle.team/): TypeSafeなORMライブラリ
- [shadcn/ui](https://ui.shadcn.com/): コンポーネントライブラリ
- [Tailwindcss](https://tailwindcss.com/): スタイリングソリューション
- [Conform](https://conform.guide/): Server Action連携可能なformバリデーションライブラリ
- [Zod](https://zod.dev/): TypeScriptファーストなバリデーションスキーマ定義ライブラリ
- [upfetch](https://github.com/L-Blondy/up-fetch): fetchをベースとしたfetch拡張ライブラリ
- [Vitest](https://vitest.dev/): Viteベースのテストライブラリ
- [Playwright](https://playwright.dev): E2Eテスト実行ライブラリ

## 各種技術スタック採用理由

### React 19 + React Compiler
最新のReact 19とReact Compilerを採用し、パフォーマンスと開発体験を最適化しています。

**採用理由:**
- **自動最適化**: React Compilerにより`useMemo`、`useCallback`が不要となり、開発者の認知負荷を軽減
- **Concurrent Features**: Suspenseやuseなど最新機能による非同期処理の改善
- **将来性**: React生態系の最前線技術による長期サポート

### Next.js
Reactのフルスタックフレームワークとして、App Routerとサーバーサイド最適化を活用しています。

**採用理由:**
- **App Router**: ファイルベースルーティングによる直感的な構造管理
- **Server Components**: RSCによるサーバーサイドレンダリング・SEO最適化
- **Turbopack**: 高速な開発サーバーとビルド時間の短縮
- **将来拡張性**: 機能追加時のルーティング管理コスト削減・パフォーマンス・チューニングのハンドリングの細かさ

### Hono
軽量でTypeScript最適化されたWebフレームワークをBFF(Backend for Frontend)として採用しています。

**採用理由:**
- **型安全なRPC**: `hc()`クライアントによるエンドツーエンド型安全性
- **高速性**: 最も高速なNode.jsルーター（ベンチマーク上位）
- **Zod OpenAPI統合**: APIスキーマとバリデーションの統合管理
- **Next.js統合**: `[[...route]]`による完全なAPI統合
- **開発効率**: 開発速度向上と保守メンテナンス性の確保

### Drizzle
TypeScriptファーストなORMとして、型安全なデータベース操作を実現しています。

**採用理由:**
- **型安全性**: スキーマからの完全な型推論と実行時型チェック
- **軽量性**: 最小限のランタイムオーバーヘッドとバンドルサイズ
- **SQL-like**: 生SQLに近い記述でパフォーマンスと可読性を両立
- **マイグレーション**: `drizzle-kit`による安全なスキーマ変更管理
- **LibSQL対応**: Tursoデータベースとの完全統合

### Turso (LibSQL)
SQLiteベースの分散データベースサービスとして採用しています。

**採用理由:**
- **環境構築簡単**: ローカルではファイルベース・本番では分散データベース
- **スケーラビリティ**: 作成できるDB枠が大きいなどスケールしやすい
- **コスト効率**: 無料枠が大きく、段階的スケーリング対応
- **ローカルファースト**: Embedded Replicasにより、様々な環境に適合でき、Tursoネットワークに依存することなくレプリカDBをアプリケーションに保持できるなど、ユーザービリティに優れている
- **開発効率**: コンテナ不要によるセットアップ時間の大幅短縮・テスト環境の構築の容易さ

### Zod 4
TypeScriptファーストなスキーマバリデーションライブラリとして採用しています。

**採用理由:**
- **型安全性**: TypeScript型とランタイムバリデーションの統合
- **OpenAPI統合**: `@hono/zod-openapi`による自動API仕様生成
- **開発体験**: エラーメッセージの詳細化と型推論によるIDEサポート
- **軽量性**: 必要最小限のランタイムとTree-shaking対応
- **エコシステム**: TypeScriptの代表的なスキーマであり、最も開発者に馴染み深い

### shadcn/ui (Radix UI基盤)
アクセシブルなコンポーネントライブラリとして採用しています。

**採用理由:**
- **アクセシビリティ**: WAI-ARIA準拠によるスクリーンリーダー対応
- **カスタマイズ性**: Tailwind CSSによる自由なスタイリング
- **開発効率**: コピー&ペーストによる必要な分だけ導入
- **保守性**: 必要な分だけ導入できるため、依存関係を最小限に抑えたライブラリ管理

### Tailwind CSS v4
ユーティリティファーストなCSSフレームワークとして採用しています。

**採用理由:**
- **開発効率**: HTMLを離れることなく高速なスタイリング
- **一貫性**: Design Tokenによる統一されたデザインシステム
- **パフォーマンス**: 使用されるクラスのみを含むPurgeによる最適化
- **保守性**: カスタムCSSによる複雑性の回避・どのフレームワークでも動作可能
- **レスポンシブ**: レスポンシブ対応もclassName指定可能

### Conform
Server Action統合可能なフォームライブラリとして採用しています。

**採用理由:**
- **Server Action統合**: Next.jsのサーバーサイド処理との完全統合
- **Progressive Enhancement**: JavaScript無効環境でのフォーム動作保証
- **型安全性**: Zodスキーマとの統合によるバリデーション
- **アクセシビリティ**: 適切なaria属性とエラーハンドリング
- **開発効率**: 宣言的なフォーム定義による開発速度向上

### Biome
高速なリンター・フォーマッターとしてESLint・Prettierの代替として採用しています。

**採用理由:**
- **高速性**: Rustベースによる圧倒的な実行速度（ESLintの50-100倍）
- **統合性**: リンター・フォーマッター・インポートソートの一体化（ESLint・Prettierの2重管理を回避）
- **Zero Config**: 最小限の設定でモダンなルールセットを適用
- **IDE統合**: VS Codeなど主要エディタでの完全サポート
- **保守性**: 単一ツールによる設定管理の簡素化

### Vitest
Viteベースのテストフレームワークとして採用しています。

**採用理由:**
- **高速性**: Viteによる高速なテスト実行とHMR
- **TypeScript統合**: 追加設定なしのTypeScript完全サポート
- **Jest互換**: 既存Jestテストからの移行容易性（Jest互換性）
- **ESMサポート**: モダンJavaScriptモジュールの完全対応
- **開発効率**: Watch modeによるリアルタイムテスト実行

### Playwright
E2Eテストフレームワークとして採用しています。

**採用理由:**
- **クロスブラウザ**: Chromium、Firefox、Safariなど主要ブラウザの統合テスト
- **高信頼性**: 自動待機機能による堅牢なテスト実行
- **パフォーマンス**: 並列実行による高速テストスイート
- **デバッグ性**: Trace ViewerやTimelineによる詳細な実行分析・デバック機能のDXがよい

### t3-env
環境変数の型安全管理ライブラリとして採用しています。

**採用理由:**
- **型安全性**: 環境変数の型定義とランタイム検証
- **開発効率**: IDEによる環境変数の補完とエラー検出
- **セキュリティ**: 公開環境変数と秘匿環境変数の明確な分離
- **検証**: アプリケーション起動時の環境変数検証

### up-fetch
型安全なfetch拡張ライブラリとして採用しています。

**採用理由:**
- **型安全性**: レスポンス型の自動推論などfetch likeでありつつ機能の拡張性あり
- **軽量性**: 最小限のランタイムオーバーヘッド
- **開発効率**: HonoのRPCクライアントとの完全統合
- **エラーハンドリング**: 統一されたエラー処理とリトライ機能
- **Cache統合**: Next.jsキャッシュシステムとの連携

## パフォーマンス戦略

### Server-First Architecture
- **React Server Components**: サーバーサイドレンダリングによる初期表示高速化
- **Selective Hydration**: 必要な部分のみクライアントサイド化
- **Code Splitting**: 自動コード分割による最小限のJavaScriptバンドル

### キャッシング戦略
- **Next.js Cache**: `fetch`APIとCache Tagsによるきめ細かいキャッシュ制御
- **revalidateTag**: Server Actions後の選択的キャッシュ無効化
- **CDN Cache**: 静的アセットの効率的配信

## 品質保証

### 型安全性
- **End-to-End TypeScript**: データベース→API→フロントエンドの完全な型安全性
- **Runtime Validation**: Zodによるランタイム型検証
- **Strict TypeScript**: 厳格なTypeScript設定による型エラー防止

### 静的解析
- **Biome**: 高速リンティングとコード品質チェック
- **TypeScript Compiler**: 型チェックとコンパイル時エラー検出
- **Pre-commit Hooks**: コミット前の自動品質チェック

### テストピラミッド戦略
本プロジェクトでは、品質保証のため[テストピラミッド](https://zenn.dev/coconala/articles/f048377f314507#%E3%83%86%E3%82%B9%E3%83%88%E3%83%94%E3%83%A9%E3%83%9F%E3%83%83%E3%83%89)戦略を採用していますが、**統合テスト（結合テスト）は未実装**です：

#### 1. 単体テスト (Vitest) ✅ **実装済み**
- **コンポーネントテスト**: React Testing Libraryによるユーザー操作シミュレーション
- **フックテスト**: カスタムフックの独立テスト
- **ユーティリティテスト**: 純粋関数とヘルパーロジックのテスト
- **APIテスト**: Honoハンドラーの単体テスト
- **Server Actionsテスト**: フォーム処理ロジックの独立テスト

#### 2. 統合テスト (Vitest) ❌ **未実装**
**将来的な実装予定:**
- **Database + Service統合**: 実際のデータベースとサービス層の連携テスト
- **API Route + Handler統合**: リクエスト-レスポンスサイクル全体のテスト
- **Server Actions統合**: フォーム送信からデータベース更新までの一貫テスト
- **キャッシュ統合**: `revalidateTag`と実際のNext.jsキャッシュの統合テスト

#### 3. E2Eテスト (Playwright) ✅ **実装済み**
- **ユーザーワークフロー**: 実際のブラウザでの完全なユーザー体験テスト
- **クロスブラウザテスト**: Chromium、Firefox、Safariでの動作確認
- **レスポンシブテスト**: モバイル・デスクトップでの表示確認

### 現在のテスト実装状況
- **単体テスト**: 包括的に実装済み（各コンポーネント・フック・API・Actionを独立テスト）
- **統合テスト**: 未実装（モックに依存した単体テストのみ）
- **E2Eテスト**: 主要ユーザーフローを実装済み

### TDD (Test-Driven Development)
- **Red-Green-Refactor**: 失敗テスト→実装→リファクタリングサイクル
- **テストファースト**: 仕様を明確にしてから実装開始  
- **段階的実装**: 現在は単体テスト中心、将来的に統合テスト追加予定
