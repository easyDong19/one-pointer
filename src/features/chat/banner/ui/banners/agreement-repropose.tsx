"use client"

import { FilePen } from "lucide-react"

import type { ChatBannerResponse } from "@/entities/chat/api/chat.schema"
import { openAgreementForm } from "@/features/agreement/lib/open-agreement-form"

import { BannerActionButton } from "../banner-action-button"
import { BannerCard } from "../banner-card"

type Props = { banner: ChatBannerResponse }

export function AgreementReproposeBanner({ banner }: Props) {
  const ticketId = banner.ticketId
  const agreementId = banner.rejectedAgreementId

  const handleClick = () => {
    if (ticketId == null || agreementId == null) {
      console.warn("[agreement-repropose] ticketId or rejectedAgreementId missing")
      return
    }
    openAgreementForm({ ticketId, mode: "repropose", agreementId })
  }

  const canAct = ticketId != null && agreementId != null

  return (
    <BannerCard
      tone="primary"
      icon={FilePen}
      title="합의서가 반려되었어요"
      description="조건을 수정해 다시 제안해주세요."
      action={
        canAct ? (
          <BannerActionButton tone="primary" onClick={handleClick}>
            합의서 재제안
          </BannerActionButton>
        ) : undefined
      }
    />
  )
}
