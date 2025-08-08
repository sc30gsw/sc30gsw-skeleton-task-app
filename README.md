
## 環境構築
以下の手順にしたがい、環境構築を行ってください

### 1. envファイルの作成
```bash
# you can pick out any env file's name you like.
touch .env
```

### 2. envファイルに以下の内容を記述
```ts: .env
NEXT_PUBLIC_APP_BASE_URL = http://localhost:3000

DATABASE_URL = <database-url>
DATABASE_AUTH_TOKEN = <database-auth-token>
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
  ├ public : 画像などアセット類
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
  |  |  |   ├ api : API関連の処理を格納
  |  |  |   |  └ route.ts : APIの実装を行うファイル
  |  |  |   ├ components : 当該機能で使用するコンポーネントをまとめるディレクトリ
  |  |  |   |  ├ user-list.ts : ユーザー一覧をfetch・表示するコンポーネント
  |  |  |   |  └ *.ts : 任意のコンポーネント
  |  |  |   ├ hooks : 当該機能で使用するhooksをまとめるディレクトリ
  |  |  |   |  └ *-hook.ts: 任意のhooks
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
  |  |  ├ api: apiのUnit テストコード
  |  |  | 　└ *-spec.ts: テストコード
  |  |  ├ utils: utilityのUnit テストコード
  |  |  | 　└ *-spec.ts: テストコード
  |  |  ├ components: componentのUnit テストコード
  |  |  | 　└ *-spec.ts: テストコード
  |  |  └ hooks: hooksのUnit テストコード
  |  |    　└ *-hook-spec.ts: テストコード
  |  └ e2e: E2E テストコード
  |     └  tasks: utilityのUnit テストコード
  |          ├ screenshots: テストで取得したスクリーンショットを格納（Visual Regression Testing用）
  |          |    └ *.png : 任意の画面または要素のスクリーンショット
  |          └ *-spec.ts: テストコード
  ├ .env.* : 環境変数定義ファイル
  ├ .env.test : テスト用の環境変数定義ファイル
  ├ biome.jsonc : Linter・Formatterの設定ファイル
  ├ components.json : shadcn/uiの設定ファイル
  ├ next.config.ts : next.jsの設定ファイル
  ├ package.json : パッケージマネージャーの設定ファイル
  ├ playwright.config.ts : Playwrightの設定ファイル
  ├ vitest.config.ts : Vitestの設定ファイル
  ├ postcss.config.mjs : postcssの設定ファイル（主にtailwind cssのプラグイン設定を記述）
  └ tsconfig.json : typescriptの設定ファイル
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