"use client"

import { overlay } from "overlay-kit"

import { DeadlineExtendDialog } from "../ui/deadline-extend-dialog"

type Args = { ticketId: number }

/**
 * DEADLINE_OVERDUE_CLIENT 배너 "마감 연장" 진입.
 */
export function openDeadlineExtend({ ticketId }: Args): Promise<void> {
  return new Promise((resolve) => {
    overlay.open(({ isOpen, close, unmount }) => (
      <DeadlineExtendDialog
        isOpen={isOpen}
        ticketId={ticketId}
        onClose={() => {
          resolve()
          close()
          setTimeout(unmount, 300)
        }}
      />
    ))
  })
}
