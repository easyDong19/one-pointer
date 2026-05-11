"use client"

import { Badge } from "@/shared/ui/badge"
import { Text } from "@/shared/ui/text"
import { formatPrice } from "@/features/agreement/lib/format-price"

import type { MyProposal } from "@/entities/proposal/api/proposal.service"
import { PROPOSAL_STATUS_LABEL } from "../lib/proposal.constants"

type Props = {
  proposal: MyProposal
  onClick?: () => void
}

/**
 * 전문가 시점 — 내가 보낸 제안 카드 (의뢰 정보 강조).
 */
export function MyProposalCard({ proposal, onClick }: Props) {
  const statusLabel = proposal.status ? PROPOSAL_STATUS_LABEL[proposal.status] : null

  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-card border-border hover:border-primary/40 hover:bg-muted/40 group flex w-full flex-col gap-2 rounded-xl border p-4 text-left transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <Text typography="body2-bold" className="text-foreground line-clamp-2">
          {proposal.ticketTitle ?? "(제목 없음)"}
        </Text>
        {statusLabel && (
          <Badge
            variant={proposal.status === "PENDING" ? "default" : "secondary"}
            className="shrink-0 text-xs"
          >
            {statusLabel}
          </Badge>
        )}
      </div>

      {(proposal.subCategoryName || proposal.clientNickname) && (
        <Text typography="caption1-medium" className="text-muted-foreground">
          {proposal.subCategoryName ?? ""}
          {proposal.subCategoryName && proposal.clientNickname ? " · " : ""}
          {proposal.clientNickname ?? ""}
        </Text>
      )}

      <div className="mt-1 flex items-center justify-between">
        <Text typography="caption2-medium" className="text-muted-foreground">
          {proposal.createdAt ?? ""}
        </Text>
        <Text typography="subtitle2-bold" className="text-foreground tabular-nums">
          {proposal.price != null ? `${formatPrice(proposal.price)}원` : "-"}
        </Text>
      </div>
    </button>
  )
}
