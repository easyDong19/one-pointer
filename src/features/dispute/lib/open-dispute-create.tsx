"use client"

import { overlay } from "overlay-kit"

import { DisputeCreateDialog } from "../ui/dispute-create-dialog"

type Args = { ticketId: number }

/**
 * REFUND_IN_PROGRESS EXPERT_REJECTED CLIENT 의 "분쟁 신청" 진입.
 * escrowPaymentId 는 다이얼로그 마운트 시 ticketId 로 fetch.
 */
export function openDisputeCreate({ ticketId }: Args): Promise<void> {
  return new Promise((resolve) => {
    overlay.open(({ isOpen, close, unmount }) => (
      <DisputeCreateDialog
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
