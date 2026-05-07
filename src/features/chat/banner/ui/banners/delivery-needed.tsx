"use client"

import { Package } from "lucide-react"

import type { ChatBannerResponse } from "@/entities/chat/api/chat.schema"
import { openDeliverySubmit } from "@/features/delivery/lib/open-delivery-submit"

import { BannerActionButton } from "../banner-action-button"
import { BannerCard } from "../banner-card"

type Props = { banner: ChatBannerResponse }

export function DeliveryNeededBanner({ banner }: Props) {
  const ticketId = banner.ticketId

  const handleClick = () => {
    if (ticketId == null) {
      console.warn("[delivery-needed] ticketId is missing")
      return
    }
    openDeliverySubmit({ ticketId, mode: "submit" })
  }

  return (
    <BannerCard
      tone="primary"
      icon={Package}
      title="작업물을 제출해주세요"
      description="마감일 전 제출이 필요해요."
      action={
        ticketId != null ? (
          <BannerActionButton tone="primary" onClick={handleClick}>
            작업물 제출
          </BannerActionButton>
        ) : undefined
      }
    />
  )
}
