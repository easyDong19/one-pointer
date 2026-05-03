"use client"

import { FileText } from "lucide-react"

import type { ChatBannerResponse } from "@/entities/chat/api/chat.schema"
import { openAgreementForm } from "@/features/agreement/lib/open-agreement-form"

import { BannerActionButton } from "../banner-action-button"
import { BannerCard } from "../banner-card"

type Props = { banner: ChatBannerResponse }

export function AgreementNeededBanner({ banner }: Props) {
  const ticketId = banner.ticketId

  const handleClick = () => {
    if (ticketId == null) {
      console.warn("[agreement-needed] ticketId is missing")
      return
    }
    openAgreementForm({ ticketId })
  }

  return (
    <BannerCard
      tone="primary"
      icon={FileText}
      title="합의서를 작성해주세요"
      description="의뢰인과 작업 조건을 합의한 뒤 결제 단계로 넘어가요."
      action={
        ticketId != null ? (
          <BannerActionButton tone="primary" onClick={handleClick}>
            합의서 작성
          </BannerActionButton>
        ) : undefined
      }
    />
  )
}
