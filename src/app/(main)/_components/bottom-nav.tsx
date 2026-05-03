"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageSquare, Smile, SquarePen } from "lucide-react"
import { useAuthStore } from "@/entities/auth/model/auth-store"
import { useTotalUnread } from "@/features/chat/list/model/use-total-unread"
import { Text } from "@/shared/ui/text"

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "홈" },
  { href: "/tickets/new", icon: SquarePen, label: "의뢰 등록" },
  { href: "/chat", icon: MessageSquare, label: "채팅" },
  { href: "/mypage", icon: Smile, label: "마이페이지" },
] as const

export function BottomNav() {
  const pathname = usePathname()
  const isAuthed = useAuthStore((s) => s.status === "authenticated")
  const totalUnread = useTotalUnread(isAuthed)

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around py-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)
          const showUnread = item.href === "/chat" && totalUnread > 0

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-4 py-1"
            >
              <span className="relative">
                <item.icon
                  className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                />
                {showUnread && (
                  <span className="bg-primary text-primary-foreground absolute -top-1.5 -right-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums">
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </span>
                )}
              </span>
              <Text
                as="span"
                typography="caption2-medium"
                className={isActive ? "text-primary" : "text-muted-foreground"}
              >
                {item.label}
              </Text>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
