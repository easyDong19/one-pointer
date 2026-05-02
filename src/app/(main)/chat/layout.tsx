"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import { AuthGuard } from "@/features/auth/guard/ui/auth-guard"
import { cn } from "@/shared/lib/utils"

import { ChatRoomsSidebar } from "./_components/chat-rooms-sidebar"

/**
 * 채팅 영역 마스터-디테일 셸.
 *
 * **모바일**
 * - `/chat` → sidebar 가 viewport 전체 차지 (main 은 hidden).
 * - `/chat/[id]` → main 만 표시 (sidebar 는 hidden).
 *
 * **데스크탑 (md+)**
 * - shell tier (`max-w-6xl` + `px-10 lg:px-16`) 안에 sidebar(340px) + main 배치.
 * - **§6.1 사이드바 sticky 패턴** — 외곽 height 강제 X, body window 스크롤.
 *   sidebar 는 `sticky top-14 self-start max-h-[calc(100dvh-3.5rem)] overflow-y-auto` 로
 *   CommonHeader 아래 머무름. main 은 자체 overflow 없이 페이지 흐름과 함께 흐른다.
 *
 * Persistent layout — 자식 페이지 전환 시 sidebar(쿼리 캐시 · scroll · state) 가 unmount 되지 않음.
 *
 * 정책: docs/design/LAYOUT.md §3, §6.1 / docs/design/desktop-chat-ux.md
 */
export default function ChatLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isRoomSelected = pathname !== "/chat"

  return (
    <AuthGuard>
      <div className="bg-background min-h-dvh pb-16 md:pt-14 md:pb-0">
        <div className="mx-auto max-w-6xl md:flex md:px-10 lg:px-16">
          <aside
            className={cn(
              "md:bg-sidebar md:border-border md:sticky md:top-14 md:flex md:h-[calc(100dvh-3.5rem)] md:w-[340px] md:shrink-0 md:flex-col md:self-start md:border-r",
              isRoomSelected && "hidden md:flex",
            )}
          >
            <ChatRoomsSidebar />
          </aside>

          <main
            className={cn(
              "md:min-w-0 md:flex-1",
              !isRoomSelected && "hidden md:block",
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}
