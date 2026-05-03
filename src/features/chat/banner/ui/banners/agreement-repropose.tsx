"use client"

import { FilePen } from "lucide-react"

import type { ChatBannerResponse } from "@/entities/chat/api/chat.schema"

import { BannerActionButton } from "../banner-action-button"
import { BannerCard } from "../banner-card"

type Props = { banner: ChatBannerResponse }

export function AgreementReproposeBanner({ banner: _banner }: Props) {
  return (
    <BannerCard
      tone="primary"
      icon={FilePen}
      title="합의서가 반려되었어요"
      description="조건을 수정해 다시 제안해주세요."
      action={<BannerActionButton tone="primary">합의서 재제안</BannerActionButton>}
    />
  )
}
