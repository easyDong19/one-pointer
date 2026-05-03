"use client"

import { Handshake } from "lucide-react"

import type { ChatBannerResponse } from "@/entities/chat/api/chat.schema"
import { useCompleteOfflineTicketMutation } from "@/features/ticket/model/use-complete-offline-ticket-mutation"
import { openConfirm } from "@/shared/lib/open-confirm-dialog"

import { BannerActionButton } from "../banner-action-button"
import { BannerCard } from "../banner-card"

type Props = { banner: ChatBannerResponse; roomId: string }

export function OfflineCompleteNeededBanner({ banner, roomId }: Props) {
  const mutation = useCompleteOfflineTicketMutation(roomId)
  const ticketId = banner.ticketId

  const handleClick = async () => {
    if (ticketId == null) {
      console.warn("[offline-complete-needed] ticketId is missing")
      return
    }
    const ok = await openConfirm({
      title: "거래를 완료하시겠어요?",
      description: "거래 완료는 되돌릴 수 없으며, 곧바로 리뷰 작성 단계로 넘어갑니다.",
      confirmLabel: "완료",
      cancelLabel: "취소",
      variant: "destructive",
    })
    if (!ok) return
    mutation.mutate(ticketId)
  }

  return (
    <BannerCard
      tone="primary"
      icon={Handshake}
      title="오프라인 거래가 완료되었나요?"
      description="완료 확인 후 리뷰를 남길 수 있어요."
      action={
        ticketId != null ? (
          <BannerActionButton tone="primary" onClick={handleClick}>
            거래 완료
          </BannerActionButton>
        ) : undefined
      }
    />
  )
}
