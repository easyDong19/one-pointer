"use client"

import { PackageOpen } from "lucide-react"

import type { ChatBannerResponse } from "@/entities/chat/api/chat.schema"

import { BannerActionButton } from "../banner-action-button"
import { BannerCard } from "../banner-card"

type Props = { banner: ChatBannerResponse }

export function DeliveryRevisionNeededBanner({ banner: _banner }: Props) {
  return (
    <BannerCard
      tone="primary"
      icon={PackageOpen}
      title="수정 요청이 들어왔어요"
      description="수정 사항을 반영해 작업물을 다시 제출해주세요."
      action={<BannerActionButton tone="primary">수정본 제출</BannerActionButton>}
    />
  )
}
