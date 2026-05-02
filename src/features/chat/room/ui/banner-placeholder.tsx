"use client"

import type { ChatBannerResponse } from "@/entities/chat/api/chat.schema"
import { Text } from "@/shared/ui/text"

type Props = {
  banner: ChatBannerResponse | null | undefined
}

/**
 * Phase 05 placeholder. banner.type 만 표시.
 *
 * Wave 2 (Phase 08) 에서 18종 ChatBannerType 별 디스패처 컴포넌트로 교체된다
 * (AGREEMENT_NEEDED → 합의서 작성 CTA, PAYMENT_PENDING → 결제 진입, …).
 *
 * 정책 참조: docs/app/chat.md §5
 */
export function BannerPlaceholder({ banner }: Props) {
  if (!banner?.type || banner.type === "NONE") return null

  return (
    <div className="bg-primary-light/40 border-border border-y px-4 py-3 md:px-6 lg:px-10">
      <Text typography="caption1-bold" className="text-primary">
        [배너] {banner.type}
      </Text>
      <Text
        as="p"
        typography="caption2-medium"
        className="text-muted-foreground mt-1"
      >
        Phase 08 에서 배너 디스패처가 이 자리에 들어옵니다.
      </Text>
    </div>
  )
}
