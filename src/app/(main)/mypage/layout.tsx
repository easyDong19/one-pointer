"use client"

import { AuthGuard } from "@/features/auth/guard"
import { PageShell } from "@/shared/ui/page-shell"
import { MypageSidebar } from "./_components/mypage-sidebar"

export default function MypageLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <PageShell tier="shell">
        <PageShell.Content>
          <div className="flex gap-6">
            <aside className="hidden w-60 shrink-0 md:block">
              <MypageSidebar />
            </aside>
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </PageShell.Content>
      </PageShell>
    </AuthGuard>
  )
}
