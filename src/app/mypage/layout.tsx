"use client"

import { AuthGuard } from "@/features/auth/guard"
import { MypageSidebar } from "./_components/mypage-sidebar"

export default function MypageLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="mx-auto flex w-full max-w-screen-xl gap-6 px-4 py-6">
        <aside className="hidden w-60 shrink-0 md:block">
          <MypageSidebar />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </AuthGuard>
  )
}
