import Link from "next/link"
import { Home, MessageSquare, Smile } from "lucide-react"
import { Text } from "@/shared/ui/text"

const NAV_ITEMS = [
  { href: "/", icon: Home, label: "홈", active: true },
  { href: "/chat", icon: MessageSquare, label: "채팅", active: false },
  { href: "/mypage", icon: Smile, label: "마이페이지", active: false },
] as const

export function HomeBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around py-2">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-0.5 px-4 py-1"
          >
            <item.icon
              className={`h-5 w-5 ${item.active ? "text-primary" : "text-muted-foreground"}`}
            />
            <Text
              as="span"
              typography="caption2-medium"
              className={item.active ? "text-primary" : "text-muted-foreground"}
            >
              {item.label}
            </Text>
          </Link>
        ))}
      </div>
    </nav>
  )
}
