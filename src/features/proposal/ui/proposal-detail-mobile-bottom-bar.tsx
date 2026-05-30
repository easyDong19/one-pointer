"use client"

import type { ProposalDetail } from "@/entities/proposal/api/proposal.schema"

import { ProposalAcceptButton } from "./proposal-accept-button"

type Props = {
  proposalId: number
  ticketId: number
  status: ProposalDetail["status"]
}

/** 모바일 전용 하단 고정 수락 CTA. 데스크탑에서는 사이드바 CTA 사용. */
export function ProposalDetailMobileBottomBar({
  proposalId,
  ticketId,
  status,
}: Props) {
  return (
    <div className="bg-background/80 border-border/50 fixed bottom-0 left-0 right-0 z-50 border-t px-4 pb-[env(safe-area-inset-bottom,0px)] pt-3 backdrop-blur-md lg:hidden">
      <div className="mx-auto max-w-3xl pb-3">
        <ProposalAcceptButton
          proposalId={proposalId}
          ticketId={ticketId}
          status={status}
        />
      </div>
    </div>
  )
}
