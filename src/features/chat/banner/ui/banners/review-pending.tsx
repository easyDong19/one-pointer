"use client"

import { Star } from "lucide-react"

import type { ChatBannerResponse } from "@/entities/chat/api/chat.schema"

import { BannerActionButton } from "../banner-action-button"
import { BannerCard } from "../banner-card"

type Props = { banner: ChatBannerResponse }

export function ReviewPendingBanner({ banner: _banner }: Props) {
  return (
    <BannerCard
      tone="primary"
      icon={Star}
      title="리뷰를 작성해주세요"
      description="메시지를 공개·비공개로 정리하고 별점을 남겨주세요."
      action={<BannerActionButton tone="primary">리뷰 작성</BannerActionButton>}
    />
  )
}
