"use client"

import { RotateCcw } from "lucide-react"
import { toast } from "sonner"

import type { ChatBannerResponse } from "@/entities/chat/api/chat.schema"
import type { SenderType } from "@/entities/review/api/review.schema"
import { openDisputeCreate } from "@/features/dispute/lib/open-dispute-create"
import { openRefundRespond } from "@/features/refund/lib/open-refund-respond"

import type { BannerTone } from "../../lib/banner.constants"
import { BannerActionButton } from "../banner-action-button"
import { BannerCard } from "../banner-card"

type Props = {
  banner: ChatBannerResponse
  myRole: SenderType | null
}

type Variant = {
  tone: BannerTone
  title: string
  description?: string
  cta?: string
}

/**
 * docs/app/chat.md §5.3 — RefundStatus × myRole 매트릭스.
 *
 * CTA wiring (wave-3b):
 * - REQUESTED + EXPERT → openRefundRespond
 * - EXPERT_REJECTED + CLIENT → openDisputeCreate
 * - CONVERTED_TO_DISPUTE → wave-5 위임 (다듬어진 stub toast)
 * - 그 외 terminal — BannerActionButton 의 기본 stub
 */
export function RefundInProgressBanner({ banner, myRole }: Props) {
  const status = banner.refundStatus ?? null
  const variant = resolveVariant(
    status,
    myRole,
    banner.expertRejectReason ?? null,
  )
  const handleClick = resolveHandler(status, myRole, banner)

  return (
    <BannerCard
      tone={variant.tone}
      icon={RotateCcw}
      title={variant.title}
      description={variant.description}
      action={
        variant.cta ? (
          <BannerActionButton tone={variant.tone} onClick={handleClick}>
            {variant.cta}
          </BannerActionButton>
        ) : undefined
      }
    />
  )
}

function resolveHandler(
  status: ChatBannerResponse["refundStatus"],
  myRole: SenderType | null,
  banner: ChatBannerResponse,
): (() => void) | undefined {
  const isExpert = myRole === "EXPERT"

  switch (status) {
    case "REQUESTED":
      if (!isExpert) return undefined
      return () => {
        if (banner.refundRequestId == null) {
          console.warn("[refund-in-progress] refundRequestId missing for REQUESTED+EXPERT")
          return
        }
        openRefundRespond({ refundRequestId: banner.refundRequestId })
      }

    case "EXPERT_REJECTED":
      if (isExpert) return undefined
      return () => {
        if (banner.ticketId == null) {
          console.warn("[refund-in-progress] ticketId missing for EXPERT_REJECTED+CLIENT")
          return
        }
        openDisputeCreate({ ticketId: banner.ticketId })
      }

    case "CONVERTED_TO_DISPUTE":
      // Wave 5 위임 — 분쟁 상세 페이지 미존재. 다듬어진 안내 토스트.
      return () => toast.info("분쟁 진행 상황은 곧 만나보실 수 있어요")

    default:
      return undefined
  }
}

function resolveVariant(
  status: ChatBannerResponse["refundStatus"],
  myRole: SenderType | null,
  rejectReason: string | null,
): Variant {
  const isExpert = myRole === "EXPERT"

  switch (status) {
    case "REQUESTED":
      return isExpert
        ? {
            tone: "warning",
            title: "환불 요청이 도착했어요",
            description: "수락 또는 거절로 응답해주세요.",
            cta: "응답하기",
          }
        : {
            tone: "warning",
            title: "환불 요청이 접수되었어요",
            description: "전문가의 응답을 기다리고 있어요.",
          }

    case "EXPERT_ACCEPTED":
      return {
        tone: "info",
        title: isExpert ? "환불을 승인했어요" : "환불이 승인되었어요",
        description: "환불이 정상 처리됩니다.",
      }

    case "AUTO_APPROVED":
      return {
        tone: "info",
        title: "자동 승인되었어요",
        description: "쿨링오프 기간이라 환불이 자동 처리되었어요.",
      }

    case "EXPERT_REJECTED":
      return isExpert
        ? {
            tone: "destructive",
            title: "환불을 거부했어요",
            description: rejectReason ? `사유: ${rejectReason}` : undefined,
          }
        : {
            tone: "destructive",
            title: "환불이 거부되었어요",
            description: rejectReason ? `사유: ${rejectReason}` : "분쟁을 신청할 수 있어요.",
            cta: "분쟁 신청",
          }

    case "CONVERTED_TO_DISPUTE":
      return {
        tone: "info",
        title: "분쟁으로 전환되었어요",
        description: "분쟁 진행 상황을 확인해주세요.",
        cta: "분쟁 보기",
      }

    case "DISPUTE_FULL_REFUND":
      return {
        tone: "info",
        title: "전액 환불로 결정되었어요",
      }

    case "DISPUTE_EXPERT_SETTLEMENT":
      return {
        tone: "info",
        title: "전문가 정산으로 결정되었어요",
      }

    // 종결 상태들 — 명시되지 않은 status 는 단순 안내
    case "REFUNDED":
    case "CANCELLED":
    case "DISPUTE_CLOSED":
    case null:
    case undefined:
    default:
      return {
        tone: "warning",
        title: "환불이 진행 중이에요",
        description: "환불 진행 상황을 확인해주세요.",
        cta: "환불 상세",
      }
  }
}
