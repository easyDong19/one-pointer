"use client"

import { Hourglass } from "lucide-react"

import type { ChatBannerResponse } from "@/entities/chat/api/chat.schema"

import { BannerCard } from "../banner-card"

type Props = { banner: ChatBannerResponse }

export function OfflineWaitingCompleteBanner({ banner: _banner }: Props) {
  return (
    <BannerCard
      tone="info"
      icon={Hourglass}
      title="의뢰인의 거래 완료 확인을 기다리고 있어요"
    />
  )
}
