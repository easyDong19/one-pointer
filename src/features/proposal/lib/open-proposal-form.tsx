"use client"

import { overlay } from "overlay-kit"

import { ProposalFormDialog } from "../ui/proposal-form-dialog"

type Args = {
  ticketId: number
  /**
   * 의뢰의 ticketType. 노출 필드와 검증 규칙이 이 값으로 결정된다.
   * - ONLINE → `onlineTool` 만 노출 (필수)
   * - OFFLINE → `locationProposal` 만 노출 (선택)
   *
   * 모바일과 동일한 도메인 규칙. 제안자가 별도로 진행 방식을 선택하지 않는다.
   */
  ticketType: "OFFLINE" | "ONLINE"
}

/**
 * 제안서 작성 다이얼로그를 연다 (overlay-kit 명령형).
 *
 * mutation 의 invalidate 가 의뢰 상세/제안 목록을 갱신하므로 호출처는 별도 액션 불필요.
 */
export function openProposalForm({ ticketId, ticketType }: Args): Promise<void> {
  return new Promise((resolve) => {
    overlay.open(({ isOpen, close, unmount }) => (
      <ProposalFormDialog
        isOpen={isOpen}
        ticketId={ticketId}
        ticketType={ticketType}
        onClose={() => {
          resolve()
          close()
          setTimeout(unmount, 300)
        }}
      />
    ))
  })
}
