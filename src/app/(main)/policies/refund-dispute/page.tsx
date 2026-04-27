import type { Metadata } from "next"
import { LegalPage } from "@/shared/legal/ui/legal-page"
import {
  refundDisputePolicyContent,
  refundDisputePolicyMeta,
} from "@/shared/legal/content/refund-dispute-policy"

export const metadata: Metadata = {
  title: `${refundDisputePolicyMeta.title} | 쪽집게`,
  description: "온라인 거래 환불·분쟁 처리 정책",
}

export default function RefundDisputePolicyPage() {
  return (
    <LegalPage
      title={refundDisputePolicyMeta.title}
      effectiveDate={refundDisputePolicyMeta.effectiveDate}
      content={refundDisputePolicyContent}
    />
  )
}
