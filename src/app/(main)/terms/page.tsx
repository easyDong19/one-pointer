import type { Metadata } from "next"
import { LegalPage } from "@/shared/legal/ui/legal-page"
import {
  termsOfServiceContent,
  termsOfServiceMeta,
} from "@/shared/legal/content/terms-of-service"

export const metadata: Metadata = {
  title: `${termsOfServiceMeta.title} | 쪽집게`,
  description: "쪽집게 서비스 이용약관",
}

export default function TermsPage() {
  return (
    <LegalPage
      title={termsOfServiceMeta.title}
      effectiveDate={termsOfServiceMeta.effectiveDate}
      content={termsOfServiceContent}
    />
  )
}
