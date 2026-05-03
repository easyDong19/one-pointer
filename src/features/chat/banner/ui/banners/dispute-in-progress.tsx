"use client"

import { ShieldAlert } from "lucide-react"
import { toast } from "sonner"

import type { ChatBannerResponse } from "@/entities/chat/api/chat.schema"

import { BannerActionButton } from "../banner-action-button"
import { BannerCard } from "../banner-card"

type Props = { banner: ChatBannerResponse }

/**
 * 분쟁 상세 페이지는 Wave 5 위임 — 본 wave 에선 다듬어진 안내 토스트만.
 * disputeStatus 별 한글 라벨도 Wave 5 에서 추가.
 */
export function DisputeInProgressBanner({ banner: _banner }: Props) {
  const handleClick = () =>
    toast.info("분쟁이 운영팀 검토 중이에요. 자세한 진행은 알림으로 안내드릴게요")

  return (
    <BannerCard
      tone="destructive"
      icon={ShieldAlert}
      title="분쟁이 진행 중이에요"
      description="분쟁 상세에서 진행 상황을 확인해주세요."
      action={
        <BannerActionButton tone="destructive" onClick={handleClick}>
          분쟁 상세
        </BannerActionButton>
      }
    />
  )
}
