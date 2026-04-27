import type { Metadata } from "next"
import { PageShell, PageShellContent } from "@/shared/ui/page-shell"
import { SupportForm } from "@/features/support"

export const metadata: Metadata = {
  title: "고객센터 문의 | 쪽집게",
  description:
    "쪽집게 고객센터 문의 폼. 문의 내용을 작성해주시면 입력하신 이메일로 답변을 보내드립니다.",
}

export default function SupportPage() {
  return (
    <PageShell tier="form">
      <PageShellContent>
        <SupportForm />
      </PageShellContent>
    </PageShell>
  )
}
