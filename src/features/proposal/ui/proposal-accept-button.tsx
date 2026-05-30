"use client"

import { Loader2 } from "lucide-react"

import type { ProposalDetail } from "@/entities/proposal/api/proposal.schema"
import { Button } from "@/shared/ui/button"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

import { useAcceptProposalAction } from "../model/use-accept-proposal-action"
import { PROPOSAL_STATUS_LABEL } from "../lib/proposal.constants"

type Props = {
  proposalId: number
  ticketId: number
  status: ProposalDetail["status"]
  className?: string
}

/**
 * 제안 수락 CTA. status 가 PENDING 일 때만 활성, 그 외에는 상태 라벨을 비활성으로 노출.
 * 데스크탑 사이드바 / 모바일 바텀바 양쪽에서 공용.
 */
export function ProposalAcceptButton({
  proposalId,
  ticketId,
  status,
  className,
}: Props) {
  const { accept, isAccepting } = useAcceptProposalAction(proposalId, ticketId)
  const canAccept = status === "PENDING"

  return (
    <Button
      type="button"
      size="lg"
      className={cn("w-full rounded-xl py-6", className)}
      disabled={!canAccept || isAccepting}
      onClick={canAccept ? accept : undefined}
    >
      {isAccepting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      <Text as="span" typography="body1-bold">
        {canAccept
          ? "이 제안서 수락하기"
          : (status && PROPOSAL_STATUS_LABEL[status]) ?? "수락할 수 없는 제안"}
      </Text>
    </Button>
  )
}
