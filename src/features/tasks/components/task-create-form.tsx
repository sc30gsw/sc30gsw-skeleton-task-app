'use client'

import { getFormProps, getInputProps } from '@conform-to/react'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '~/components/ui/shadcn/button'
import { Input } from '~/components/ui/shadcn/input'
import { Label } from '~/components/ui/shadcn/label'
import { useCreateTask } from '~/features/tasks/hooks/use-create-task'

export function TaskCreateForm() {
  const { form, action, isPending, fields } = useCreateTask()

  return (
    <form
      {...getFormProps(form)}
      action={action}
      className="space-y-4"
      data-testid="task-create-form"
    >
      <div className="space-y-2">
        <Label htmlFor="title" className="cursor-text font-medium text-foreground text-sm">
          タスクタイトル
        </Label>

        <Input
          {...getInputProps(fields.title, { type: 'text' })}
          id="title"
          placeholder="タスクを入力してください"
          disabled={isPending}
          data-testid="task-title-input"
          aria-label="タスクタイトル入力欄"
        />

        <span
          id={fields.title.errorId}
          className="-bottom-5.5 absolute text-destructive text-sm"
          data-testid="task-title-error"
          role="alert"
        >
          {fields.title.errors}
        </span>
      </div>
      <Button
        className="relative w-full cursor-pointer disabled:cursor-not-allowed"
        disabled={isPending}
        data-testid="task-submit-button"
        aria-label="タスクを追加"
      >
        タスクを追加
        {isPending ? (
          <Loader2 className="-translate-y-1/2 absolute top-1/2 right-6 transform animate-spin" />
        ) : (
          <Plus className="-translate-y-1/2 absolute top-1/2 right-6 transform" />
        )}
      </Button>
    </form>
  )
}
