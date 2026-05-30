"use client"

import type { ProposalDetail } from "@/entities/proposal/api/proposal.schema"
import { Text } from "@/shared/ui/text"
import { formatPrice } from "@/features/agreement/lib/format-price"

import { METHOD_LABEL, PROPOSED_DURATION_LABEL } from "../lib/proposal.constants"

type Props = {
  proposal: ProposalDetail
}

/**
 * 제안 정보 카드 — 제안 금액 강조 블록 + 세부 정보 행.
 * 모바일 앱 ProposalDetailView 의 제안 정보 섹션을 따른다.
 * 모바일 본문 / 데스크탑 사이드바 양쪽에서 동일하게 렌더된다.
 */
export function ProposalInfoCard({ proposal }: Props) {
  const showLocation =
    (proposal.method === "OFFLINE" || proposal.method === "BOTH") &&
    !!proposal.locationProposal
  const showOnlineTool =
    (proposal.method === "ONLINE" || proposal.method === "BOTH") &&
    !!proposal.onlineTool

  return (
    <div className="bg-card border-border rounded-2xl border p-5 shadow-sm md:p-6">
      <Text typography="subtitle2-bold" className="text-foreground">
        제안 정보
      </Text>

      {/* 제안 금액 강조 */}
      <div className="bg-primary-light mt-4 flex flex-col items-center gap-1 rounded-xl py-5">
        <Text typography="caption1-medium" className="text-muted-foreground">
          제안 금액
        </Text>
        <Text typography="h2-bold" className="text-primary tabular-nums">
          {proposal.price != null ? `${formatPrice(proposal.price)}원` : "협의"}
        </Text>
      </div>

      <div className="border-border my-4 border-t border-dashed" />

      <dl className="flex flex-col gap-3">
        {proposal.proposedDuration && (
          <InfoRow
            label="소요 시간"
            value={
              PROPOSED_DURATION_LABEL[proposal.proposedDuration] ??
              proposal.proposedDuration
            }
          />
        )}
        {proposal.method && (
          <InfoRow label="진행 방식" value={METHOD_LABEL[proposal.method]} />
        )}
        {showLocation && (
          <InfoRow label="장소" value={proposal.locationProposal!} />
        )}
        {showOnlineTool && (
          <InfoRow label="서비스 제공 방식" value={proposal.onlineTool!} />
        )}
      </dl>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt>
        <Text typography="body3-regular" className="text-muted-foreground">
          {label}
        </Text>
      </dt>
      <dd className="min-w-0 text-right">
        <Text typography="body3-medium" className="text-foreground">
          {value}
        </Text>
      </dd>
    </div>
  )
}
