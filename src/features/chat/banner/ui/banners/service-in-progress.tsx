"use client"

import { Loader2 } from "lucide-react"

import { BannerCard } from "../banner-card"

/**
 * NONE 배너의 §5.4 조건부 안내.
 *
 * 의뢰인 시점 + 거래 IN_PROGRESS / PAID 상태일 때만 dispatcher 가 띄운다 —
 * "현재 전문가가 작업 중" 임을 알려주는 placeholder. 안내성이라 CTA 없음.
 */
export function ServiceInProgressBanner() {
  return (
    <BannerCard
      tone="info"
      icon={Loader2}
      title="서비스가 진행 중이에요"
      description="전문가가 작업하고 있어요. 완료되면 알림으로 안내해드릴게요."
    />
  )
}
