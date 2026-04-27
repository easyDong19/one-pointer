import type { Metadata } from "next"
import { LegalPage } from "@/shared/legal/ui/legal-page"
import {
  chatReviewPolicyContent,
  chatReviewPolicyMeta,
} from "@/shared/legal/content/chat-review-policy"

export const metadata: Metadata = {
  title: `${chatReviewPolicyMeta.title} | 쪽집게`,
  description: "채팅 내역 리뷰 활용 동의",
}

export default function ChatReviewPolicyPage() {
  return (
    <LegalPage
      title={chatReviewPolicyMeta.title}
      effectiveDate={chatReviewPolicyMeta.effectiveDate}
      content={chatReviewPolicyContent}
    />
  )
}
