"use client"

import { openConfirm } from "@/shared/lib/open-confirm-dialog"

import { useAcceptProposalMutation } from "./use-accept-proposal-mutation"

/**
 * 제안 수락 액션 — 확인 다이얼로그 후 수락 뮤테이션 실행.
 *
 * 모바일 앱 로직 참조: 수락 시 "다른 제안 자동 거절 + 취소 불가" 경고를 띄우고,
 * 성공하면 채팅방으로 이동(뮤테이션이 처리). 사이드바·모바일 바텀바에서 공용.
 */
export function useAcceptProposalAction(proposalId: number, ticketId: number) {
  const mutation = useAcceptProposalMutation(ticketId)

  const accept = async () => {
    const ok = await openConfirm({
      title: "이 제안서를 수락하시겠어요?",
      description:
        "수락하면 다른 제안서는 자동으로 거절돼요. 수락 후에는 취소할 수 없어요.",
      confirmLabel: "수락하기",
      cancelLabel: "돌아가기",
    })
    if (!ok) return
    await mutation.mutateAsync(proposalId)
  }

  return { accept, isAccepting: mutation.isPending }
}
