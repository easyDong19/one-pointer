"use client"

import { CreditCard } from "lucide-react"
import { toast } from "sonner"

import type { ChatBannerResponse } from "@/entities/chat/api/chat.schema"

import { BannerActionButton } from "../banner-action-button"
import { BannerCard } from "../banner-card"

type Props = { banner: ChatBannerResponse }

export function PaymentPendingBanner({ banner }: Props) {
  const description =
    banner.amount != null
      ? `${banner.amount.toLocaleString("ko-KR")}원을 안전결제로 진행해주세요.`
      : "안전결제로 진행해주세요."

  const handleClick = () => {
    toast.info("결제는 준비 중입니다")
  }

  return (
    <BannerCard
      tone="primary"
      icon={CreditCard}
      title="결제가 필요해요"
      description={description}
      action={
        <BannerActionButton tone="primary" onClick={handleClick}>
          결제하기
        </BannerActionButton>
      }
    />
  )
}
