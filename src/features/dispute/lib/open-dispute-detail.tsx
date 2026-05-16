"use client"

import { overlay } from "overlay-kit"

import { DisputeDetailDialog } from "../ui/dispute-detail-dialog"

type Args = { ticketId: number }

/**
 * 분쟁 상세 다이얼로그 진입점.
 *
 * 채팅 배너(`DisputeInProgressBanner`, `DisputeResolvedBanner`) CTA 에서 호출.
 * 내부에서 ticketId → disputeId → MyDisputeDetail 으로 chained fetch.
 */
export function openDisputeDetail({ ticketId }: Args): Promise<void> {
  return new Promise((resolve) => {
    overlay.open(({ isOpen, close, unmount }) => (
      <DisputeDetailDialog
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
