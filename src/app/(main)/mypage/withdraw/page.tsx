import type { Metadata } from "next"
import { PageShell, PageShellContent } from "@/shared/ui/page-shell"
import { WithdrawForm } from "@/features/user/withdraw"

export const metadata: Metadata = {
  title: "회원탈퇴 | 쪽집게",
  description: "쪽집게 회원 탈퇴 안내 및 진행",
}

export default function WithdrawPage() {
  return (
    <PageShell tier="form">
      <PageShellContent>
        <WithdrawForm />
      </PageShellContent>
    </PageShell>
  )
}
