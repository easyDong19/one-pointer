"use client"

import { Clock } from "lucide-react"

import type { ChatBannerResponse } from "@/entities/chat/api/chat.schema"

import { BannerCard } from "../banner-card"

type Props = { banner: ChatBannerResponse }

export function DeadlineOverdueExpertBanner({ banner: _banner }: Props) {
  return (
    <BannerCard
      tone="warning"
      icon={Clock}
      title="마감일이 지났어요"
      description="의뢰인이 환불을 요청할 수 있어요. 작업물을 빠르게 제출해주세요."
    />
  )
}
