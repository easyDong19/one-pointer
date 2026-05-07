"use client"

import { PackageOpen } from "lucide-react"

import type { ChatBannerResponse } from "@/entities/chat/api/chat.schema"
import { openDeliverySubmit } from "@/features/delivery/lib/open-delivery-submit"

import { BannerActionButton } from "../banner-action-button"
import { BannerCard } from "../banner-card"

type Props = { banner: ChatBannerResponse }

export function DeliveryRevisionNeededBanner({ banner }: Props) {
  const ticketId = banner.ticketId
  const deliveryId = banner.existingDeliveryId

  const handleClick = () => {
    if (ticketId == null || deliveryId == null) {
      console.warn("[delivery-revision-needed] ticketId or deliveryId missing")
      return
    }
    openDeliverySubmit({ ticketId, mode: "resubmit", deliveryId })
  }

  return (
    <BannerCard
      tone="primary"
      icon={PackageOpen}
      title="수정 요청이 들어왔어요"
      description="수정 사항을 반영해 작업물을 다시 제출해주세요."
      action={
        ticketId != null && deliveryId != null ? (
          <BannerActionButton tone="primary" onClick={handleClick}>
            수정본 제출
          </BannerActionButton>
        ) : undefined
      }
    />
  )
}
