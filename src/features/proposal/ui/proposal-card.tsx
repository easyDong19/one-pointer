"use client"

import { Badge } from "@/shared/ui/badge"
import { Text } from "@/shared/ui/text"
import { formatPrice } from "@/features/agreement/lib/format-price"

import type { ProposalSummary } from "@/entities/proposal/api/proposal.service"
import {
  METHOD_LABEL,
  PROPOSAL_STATUS_LABEL,
  PROPOSED_DURATION_LABEL,
} from "../lib/proposal.constants"

type Props = {
  proposal: ProposalSummary
  onClick?: () => void
}

/**
 * 의뢰인 시점 — 받은 제안 카드.
 */
export function ProposalCard({ proposal, onClick }: Props) {
  const statusLabel = proposal.status ? PROPOSAL_STATUS_LABEL[proposal.status] : null

  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-card border-border hover:border-primary/40 hover:bg-muted/40 group flex w-full flex-col gap-3 rounded-xl border p-4 text-left transition-colors"
    >
      <div className="flex items-start gap-3">
        {proposal.expertProfileImageUrl ? (
          <img
            src={proposal.expertProfileImageUrl}
            alt={proposal.expertNickname ?? ""}
            className="size-10 rounded-full object-cover"
          />
        ) : (
          <div className="bg-muted size-10 rounded-full" />
        )}
        <div className="flex flex-1 flex-col">
          <Text typography="body2-bold" className="text-foreground">
            {proposal.expertNickname ?? "전문가"}
          </Text>
          {statusLabel && (
            <Text typography="caption2-medium" className="text-muted-foreground">
              {statusLabel}
            </Text>
          )}
        </div>
        {proposal.status === "SELECTED" && (
          <Badge variant="default" className="text-xs">
            수락됨
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Text typography="caption1-medium" className="text-muted-foreground">
          {proposal.proposedDuration
            ? PROPOSED_DURATION_LABEL[proposal.proposedDuration] ?? proposal.proposedDuration
            : ""}
          {proposal.method ? ` · ${METHOD_LABEL[proposal.method]}` : ""}
        </Text>
        <Text typography="subtitle2-bold" className="text-foreground tabular-nums">
          {proposal.price != null ? `${formatPrice(proposal.price)}원` : "-"}
        </Text>
      </div>
    </button>
  )
}
