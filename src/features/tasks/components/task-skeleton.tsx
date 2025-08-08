import { Skeleton } from '~/components/ui/shadcn/skeleton'

export function TaskSkeleton() {
  return (
    <div className="space-y-3">
      <h2 className="mb-4 flex items-center font-semibold text-foreground text-lg">
        タスク一覧 0<Skeleton className="size-6" />
      </h2>
      <div className="space-y-2">
        <Skeleton className="h-32.5 w-full" />
        <Skeleton className="h-32.5 w-full" />
        <Skeleton className="h-32.5 w-full" />
      </div>
    </div>
  )
}
