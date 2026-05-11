"use client"

import { overlay } from "overlay-kit"

import { ProposalFormDialog } from "../ui/proposal-form-dialog"

type Args = {
  ticketId: number
  defaultMethod?: "OFFLINE" | "ONLINE" | "BOTH"
}

/**
 * 제안서 작성 다이얼로그를 연다 (overlay-kit 명령형).
 *
 * mutation 의 invalidate 가 의뢰 상세/제안 목록을 갱신하므로 호출처는 별도 액션 불필요.
 */
export function openProposalForm({ ticketId, defaultMethod }: Args): Promise<void> {
  return new Promise((resolve) => {
    overlay.open(({ isOpen, close, unmount }) => (
      <ProposalFormDialog
        isOpen={isOpen}
        ticketId={ticketId}
        defaultMethod={defaultMethod}
        onClose={() => {
          resolve()
          close()
          setTimeout(unmount, 300)
        }}
      />
    ))
  })
}
