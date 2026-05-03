"use client"

import { ShieldAlert } from "lucide-react"

import type { ChatBannerResponse } from "@/entities/chat/api/chat.schema"

import { BannerActionButton } from "../banner-action-button"
import { BannerCard } from "../banner-card"

type Props = { banner: ChatBannerResponse }

export function DisputeInProgressBanner({ banner: _banner }: Props) {
  // disputeStatus 별 한글 라벨은 Wave 5 에서 추가.
  return (
    <BannerCard
      tone="destructive"
      icon={ShieldAlert}
      title="분쟁이 진행 중이에요"
      description="분쟁 상세에서 진행 상황을 확인해주세요."
      action={<BannerActionButton tone="destructive">분쟁 상세</BannerActionButton>}
    />
  )
}
