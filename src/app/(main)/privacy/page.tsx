import type { Metadata } from "next"
import { LegalPage } from "@/shared/legal/ui/legal-page"
import {
  privacyPolicyContent,
  privacyPolicyMeta,
} from "@/shared/legal/content/privacy-policy"

export const metadata: Metadata = {
  title: `${privacyPolicyMeta.title} | 쪽집게`,
  description: "쪽집게 개인정보 처리방침",
}

export default function PrivacyPage() {
  return (
    <LegalPage
      title={privacyPolicyMeta.title}
      effectiveDate={privacyPolicyMeta.effectiveDate}
      content={privacyPolicyContent}
    />
  )
}
