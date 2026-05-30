"use client"

import { MobileHeader } from "@/shared/ui/mobile-header"

export function ProposalDetailHeader() {
  return (
    <MobileHeader>
      <MobileHeader.BackButton />
      <MobileHeader.Title>제안서 상세</MobileHeader.Title>
      <MobileHeader.Spacer />
    </MobileHeader>
  )
}
