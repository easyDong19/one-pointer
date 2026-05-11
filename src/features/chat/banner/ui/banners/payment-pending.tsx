"use client"

import { CreditCard } from "lucide-react"

import type { ChatBannerResponse } from "@/entities/chat/api/chat.schema"
import { openPayment } from "@/features/payment/lib/open-payment"

import { BannerActionButton } from "../banner-action-button"
import { BannerCard } from "../banner-card"

type Props = { banner: ChatBannerResponse }

export function PaymentPendingBanner({ banner }: Props) {
  const amount = banner.amount ?? 0
  const ticketId = banner.ticketId

  const description =
    amount > 0
      ? `${amount.toLocaleString("ko-KR")}원을 안전결제로 진행해주세요.`
      : "안전결제로 진행해주세요."

  const handleClick = () => {
    if (ticketId == null || amount <= 0) return
    openPayment({ ticketId, amount, orderName: "원포인터 레슨 결제" })
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
