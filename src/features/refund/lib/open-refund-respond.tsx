"use client"

import { overlay } from "overlay-kit"

import { RefundRespondDialog } from "../ui/refund-respond-dialog"

type Args = { refundRequestId: number }

export function openRefundRespond({ refundRequestId }: Args): Promise<void> {
  return new Promise((resolve) => {
    overlay.open(({ isOpen, close, unmount }) => (
      <RefundRespondDialog
        isOpen={isOpen}
        refundRequestId={refundRequestId}
        onClose={() => {
          resolve()
          close()
          setTimeout(unmount, 300)
        }}
      />
    ))
  })
}
