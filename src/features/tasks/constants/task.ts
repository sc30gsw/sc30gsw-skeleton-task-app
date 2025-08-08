import type { Task } from '~/db/schema'

export const TASK_STATUS = {
  INCOMPLETE: 'incomplete',
  COMPLETE: 'complete',
} as const satisfies Record<string, Task['status']>
