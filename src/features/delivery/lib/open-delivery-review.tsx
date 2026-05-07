"use client"

import { overlay } from "overlay-kit"

import type { SenderType } from "@/entities/review/api/review.schema"
import { DeliveryReviewDialog } from "../ui/delivery-review-dialog"

type Args = {
  ticketId: number
  myRole: SenderType | null
}

export function openDeliveryReview({
  ticketId,
  myRole,
}: Args): Promise<void> {
  return new Promise((resolve) => {
    overlay.open(({ isOpen, close, unmount }) => (
      <DeliveryReviewDialog
        isOpen={isOpen}
        ticketId={ticketId}
        myRole={myRole}
        onClose={() => {
          resolve()
          close()
          setTimeout(unmount, 300)
        }}
      />
    ))
  })
}
