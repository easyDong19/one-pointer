"use client"

import { AlarmClock } from "lucide-react"

import type { ChatBannerResponse } from "@/entities/chat/api/chat.schema"
import { openDeadlineExtend } from "@/features/agreement/lib/open-deadline-extend"
import { openRefundRequest } from "@/features/refund/lib/open-refund-request"

import { BannerActionButton } from "../banner-action-button"
import { BannerCard } from "../banner-card"

/**
 * §5.2 — 의뢰인 시점에 마감 초과 알림.
 * §7.6 — "마감 연장" (wave-3a) 또는 "환불 요청" (wave-3b) 분기.
 */
type Props = { banner: ChatBannerResponse }

export function DeadlineOverdueClientBanner({ banner }: Props) {
  const ticketId = banner.ticketId

  const handleExtend = () => {
    if (ticketId == null) {
      console.warn("[deadline-overdue-client] ticketId is missing")
      return
    }
    openDeadlineExtend({ ticketId })
  }

  const handleRefund = () => {
    if (ticketId == null) {
      console.warn("[deadline-overdue-client] ticketId is missing")
      return
    }
    openRefundRequest({ ticketId, refundZone: banner.refundZone ?? null })
  }

  return (
    <BannerCard
      tone="destructive"
      icon={AlarmClock}
      title="마감 기한이 초과되었어요"
      description="마감일을 연장하거나 환불을 요청할 수 있어요."
      action={
        <div className="flex items-center gap-2">
          <BannerActionButton tone="info" onClick={handleExtend}>
            마감 연장
          </BannerActionButton>
          <BannerActionButton tone="destructive" onClick={handleRefund}>
            환불 요청
          </BannerActionButton>
        </div>
      }
    />
  )
}
