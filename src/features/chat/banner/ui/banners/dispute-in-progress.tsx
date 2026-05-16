"use client"

import { ShieldAlert } from "lucide-react"

import type { ChatBannerResponse } from "@/entities/chat/api/chat.schema"
import { openDisputeDetail } from "@/features/dispute/lib/open-dispute-detail"

import { BannerActionButton } from "../banner-action-button"
import { BannerCard } from "../banner-card"

type Props = { banner: ChatBannerResponse }

export function DisputeInProgressBanner({ banner }: Props) {
  const ticketId = banner.ticketId

  const handleClick = () => {
    if (ticketId == null) {
      console.warn("[dispute-in-progress] ticketId is missing")
      return
    }
    openDisputeDetail({ ticketId })
  }

  return (
    <BannerCard
      tone="destructive"
      icon={ShieldAlert}
      title="분쟁이 진행 중이에요"
      description="분쟁 상세에서 진행 상황을 확인해주세요."
      action={
        ticketId != null ? (
          <BannerActionButton tone="destructive" onClick={handleClick}>
            분쟁 상세
          </BannerActionButton>
        ) : undefined
      }
    />
  )
}
