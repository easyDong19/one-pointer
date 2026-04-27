import type { Metadata } from "next"
import { LegalPage } from "@/shared/legal/ui/legal-page"
import {
  marketingPolicyContent,
  marketingPolicyMeta,
} from "@/shared/legal/content/marketing-policy"

export const metadata: Metadata = {
  title: `${marketingPolicyMeta.title} | 쪽집게`,
  description: "마케팅 정보 수신 동의",
}

export default function MarketingPolicyPage() {
  return (
    <LegalPage
      title={marketingPolicyMeta.title}
      effectiveDate={marketingPolicyMeta.effectiveDate}
      content={marketingPolicyContent}
    />
  )
}
