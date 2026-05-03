"use client"

import { ShieldCheck } from "lucide-react"

import type { ChatBannerResponse } from "@/entities/chat/api/chat.schema"

import { BannerCard } from "../banner-card"

type Props = { banner: ChatBannerResponse }

/**
 * docs §5.2 — 분쟁 종결 안내 + 정산 내역 표시.
 * `resolutionType` 별 한글 라벨 + `totalAmount` / `expertSettlementAmount` 가 있을 때 노출.
 */
export function DisputeResolvedBanner({ banner }: Props) {
  const description = formatResolution(banner)

  return (
    <BannerCard
      tone="info"
      icon={ShieldCheck}
      title="분쟁이 종결되었어요"
      description={description}
    />
  )
}

function formatResolution(banner: ChatBannerResponse): string {
  const parts: string[] = []

  if (banner.resolutionType === "FULL_REFUND") {
    parts.push("전액 환불로 결정")
  } else if (banner.resolutionType === "EXPERT_SETTLEMENT") {
    parts.push("전문가 정산으로 결정")
  }

  if (banner.totalAmount != null) {
    parts.push(`총 ${banner.totalAmount.toLocaleString("ko-KR")}원`)
  }

  if (banner.expertSettlementAmount != null) {
    parts.push(`전문가 정산 ${banner.expertSettlementAmount.toLocaleString("ko-KR")}원`)
  }

  return parts.length > 0 ? parts.join(" · ") : "처리 결과를 확인할 수 있어요."
}
