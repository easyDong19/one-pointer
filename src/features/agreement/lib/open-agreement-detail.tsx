"use client"

import { overlay } from "overlay-kit"

import type { SenderType } from "@/entities/review/api/review.schema"

import { AgreementDetailDialog } from "../ui/agreement-detail-dialog"

type Args = {
  ticketId: number
  /** "CLIENT" 시점 + status PROPOSED 일 때만 footer (승인/거절) 노출 */
  myRole: SenderType | null
}

/**
 * AGREEMENT 메시지 카드 클릭 시 합의서 상세 다이얼로그를 연다.
 */
export function openAgreementDetail({
  ticketId,
  myRole,
}: Args): Promise<void> {
  return new Promise((resolve) => {
    overlay.open(({ isOpen, close, unmount }) => (
      <AgreementDetailDialog
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
