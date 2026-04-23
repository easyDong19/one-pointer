"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageSquare, Smile, SquarePen } from "lucide-react"
import { Text } from "@/shared/ui/text"

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "홈" },
  { href: "/tickets/new", icon: SquarePen, label: "의뢰 등록" },
  { href: "/chat", icon: MessageSquare, label: "채팅" },
  { href: "/mypage", icon: Smile, label: "마이페이지" },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around py-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-4 py-1"
            >
              <item.icon
                className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`}
              />
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
