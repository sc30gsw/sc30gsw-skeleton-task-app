'use client'

import type { ComponentProps } from 'react'
import { createCallable } from 'react-call'
import { Button } from '~/components/ui/shadcn/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/shadcn/dialog'

type ConfirmProps = {
  title: string
  message: string
  confirmButtonLabel: string
  variant?: ComponentProps<typeof Button>['variant']
}

export const { Root, ...Confirm } = createCallable<ConfirmProps, boolean>(
  ({ call, title, message, confirmButtonLabel, variant }) => (
    <Dialog open={true} onOpenChange={() => call.end(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild={true} aria-label="dialog-cancel">
            <Button variant="outline" className="cursor-pointer">
              キャンセル
            </Button>
          </DialogClose>
          <Button
            variant={variant}
            aria-label="dialog-action"
            className="cursor-pointer"
            onClick={() => call.end(true)}
          >
            {confirmButtonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
)
