"use client"

import { overlay } from "overlay-kit"

import { AgreementFormDialog } from "../ui/agreement-form-dialog"

type Args = {
  ticketId: number
  /** 기본 "create". "repropose" 일 땐 agreementId 필수 */
  mode?: "create" | "repropose"
  /** repropose 모드의 거절된 이전 합의서 id */
  agreementId?: number
}

/**
 * 합의서 작성·재제안 다이얼로그를 연다 (overlay-kit 명령형).
 *
 * 결과는 mutation 이 chat detail 을 invalidate 하므로 호출처는 별도 액션 불필요.
 */
export function openAgreementForm({
  ticketId,
  mode = "create",
  agreementId,
}: Args): Promise<void> {
  return new Promise((resolve) => {
    overlay.open(({ isOpen, close, unmount }) => (
      <AgreementFormDialog
        isOpen={isOpen}
        ticketId={ticketId}
        mode={mode}
        agreementId={agreementId}
        onClose={() => {
          resolve()
          close()
          setTimeout(unmount, 300)
        }}
      />
    ))
  })
}
