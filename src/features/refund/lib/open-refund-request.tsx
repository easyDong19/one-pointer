"use client"

import { overlay } from "overlay-kit"

import type { EscrowRefundZone } from "@/entities/payment/api/payment.service"

import { RefundRequestDialog } from "../ui/refund-request-dialog"

type Args = {
  ticketId: number
  /** 표시 전용 — 서버가 zone 재계산. 배너 진입 시 banner.refundZone, AppBar 진입 시 banner.currentRefundZone */
  refundZone?: EscrowRefundZone | null
}

export function openRefundRequest({
  ticketId,
  refundZone,
}: Args): Promise<void> {
  return new Promise((resolve) => {
    overlay.open(({ isOpen, close, unmount }) => (
      <RefundRequestDialog
        isOpen={isOpen}
        ticketId={ticketId}
        refundZone={refundZone}
        onClose={() => {
          resolve()
          close()
          setTimeout(unmount, 300)
        }}
      />
    ))
  })
}
