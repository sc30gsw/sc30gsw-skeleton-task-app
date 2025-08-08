import { ListTodo } from 'lucide-react'
import { EmptyState } from '~/components/ui/empty-state'
import { TaskItem } from '~/features/tasks/components/task-item'
import { fetchAllTasks } from '~/features/tasks/server/fetcher'

export async function TaskList() {
  const taskList = await fetchAllTasks()

  if (taskList.length === 0) {
    return (
      <EmptyState
        icon={<ListTodo className="h-12 w-12" />}
        title="タスクがありません"
        description="新しいタスクを作成して、やるべきことを整理しましょう。"
      />
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="mb-4 font-semibold text-foreground text-lg">タスク一覧 ({taskList.length})</h2>
      <div className="space-y-2" role="list" aria-label="タスク一覧">
        {taskList.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}
