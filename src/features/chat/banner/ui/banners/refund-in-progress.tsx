"use client"

import { RotateCcw } from "lucide-react"

import type { ChatBannerResponse } from "@/entities/chat/api/chat.schema"
import type { SenderType } from "@/entities/review/api/review.schema"

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
 * docs/app/chat.md §5.3 — RefundStatus × myRole 매트릭스를 그대로 따른다.
 * CTA 의 실제 onClick 은 Wave 3b 에서 wiring (현재는 stub toast).
 */
export function RefundInProgressBanner({ banner, myRole }: Props) {
  const variant = resolveVariant(
    banner.refundStatus ?? null,
    myRole,
    banner.expertRejectReason ?? null,
  )

  return (
    <BannerCard
      tone={variant.tone}
      icon={RotateCcw}
      title={variant.title}
      description={variant.description}
      action={
        variant.cta ? (
          <BannerActionButton tone={variant.tone}>{variant.cta}</BannerActionButton>
        ) : undefined
      }
    />
  )
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
