import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/shadcn/card'
import { TaskCreateForm } from '~/features/tasks/components/task-create-form'
import { TaskList } from '~/features/tasks/components/task-list'
import { TaskSkeleton } from '~/features/tasks/components/task-skeleton'

// ? ServerComponent側でHono RPC呼び出しがキャッシュされbuildが失敗するため追加
export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8">
        <h1 className="mb-2 font-bold text-3xl text-foreground">タスク管理</h1>
        <p className="text-muted-foreground">
          やるべきことを整理して、効率的に作業を進めましょう。
        </p>
      </header>

      <div className="grid gap-8">
        <div className="space-y-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-lg">新しいタスクを作成</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskCreateForm />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Suspense fallback={<TaskSkeleton />}>
            <TaskList />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
