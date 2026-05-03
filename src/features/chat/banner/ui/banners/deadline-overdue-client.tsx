"use client"

import { AlarmClock } from "lucide-react"

import type { ChatBannerResponse } from "@/entities/chat/api/chat.schema"
import { openDeadlineExtend } from "@/features/agreement/lib/open-deadline-extend"

import { BannerActionButton } from "../banner-action-button"
import { BannerCard } from "../banner-card"

/**
 * §5.2 — 의뢰인 시점에 마감 초과 알림.
 * §7.6 — "마감 연장" 으로 합의서 마감일 갱신, 또는 환불 요청 분기.
 *
 * "마감 연장" 은 wave-3a (본 트랙). "환불 요청" 은 wave-3b 에서 wiring.
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
          <BannerActionButton tone="destructive">환불 요청</BannerActionButton>
        </div>
      }
    />
  )
}
