"use client"

import { Handshake } from "lucide-react"

import type { ChatBannerResponse } from "@/entities/chat/api/chat.schema"

import { BannerActionButton } from "../banner-action-button"
import { BannerCard } from "../banner-card"

type Props = { banner: ChatBannerResponse }

export function OfflineCompleteNeededBanner({ banner: _banner }: Props) {
  return (
    <BannerCard
      tone="primary"
      icon={Handshake}
      title="오프라인 거래가 완료되었나요?"
      description="완료 확인 후 리뷰를 남길 수 있어요."
      action={<BannerActionButton tone="primary">거래 완료</BannerActionButton>}
    />
  )
}
