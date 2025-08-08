import { useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod/v4'
import { useRouter } from 'next/navigation'
import { useActionState } from 'react'
import { toast } from 'sonner'
import { TOAST_COLOR } from '~/constants/toast'
import { createTaskAction } from '~/features/tasks/actions/create-task-action'
import { TASK_ERROR_MESSAGES, TASK_SUCCESS_MESSAGES } from '~/features/tasks/constants/validation'
import { type CreateTaskSchema, createTaskSchema } from '~/features/tasks/types/schema/task-schema'
import { withCallbacks } from '~/utils/with-callback'

export function useCreateTask() {
  const router = useRouter()

  const [lastResult, action, isPending] = useActionState(
    withCallbacks(createTaskAction, {
      onSuccess() {
        toast.success(TASK_SUCCESS_MESSAGES.TASK_CREATED.message, {
          style: TOAST_COLOR.SUCCESS,
          position: 'top-center',
        })

        router.refresh()
      },
      onError() {
        toast.error(TASK_ERROR_MESSAGES.TASK_CREATE_FAILED.message, {
          style: TOAST_COLOR.ERROR,
          position: 'top-center',
        })
      },
    }),
    null,
  )

  const [form, fields] = useForm<CreateTaskSchema>({
    constraint: getZodConstraint(createTaskSchema),
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: createTaskSchema })
    },
    defaultValue: {
      title: '',
    },
  })

  return { form, action, isPending, fields } as const
}
