import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/shadcn/card'
import { TaskCreateForm } from '~/features/tasks/components/task-create-form'
import { TaskList } from '~/features/tasks/components/task-list'
import { TaskSkeleton } from '~/features/tasks/components/task-skeleton'

// ? ServerComponent側でHono RPC呼び出しがキャッシュされbuildが失敗するため追加
export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8" data-testid="task-manager-container">
      <header className="mb-8" data-testid="header">
        <h1 className="mb-2 font-bold text-3xl text-foreground" data-testid="main-title">タスク管理</h1>
        <p className="text-muted-foreground" data-testid="main-description">
          やるべきことを整理して、効率的に作業を進めましょう。
        </p>
      </header>

      <div className="grid gap-8">
        <div className="space-y-6">
          <Card className="w-full" data-testid="task-create-card">
            <CardHeader>
              <CardTitle className="text-lg" data-testid="task-create-title">新しいタスクを作成</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskCreateForm />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6" data-testid="task-list-section">
          <Suspense fallback={<TaskSkeleton />}>
            <TaskList />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
