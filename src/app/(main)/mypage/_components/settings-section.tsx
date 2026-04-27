"use client"

import { Headphones, FileText, Shield, Scale, LogOut, ChevronRight } from "lucide-react"
import { Text } from "@/shared/ui/text"
import { Separator } from "@/shared/ui/separator"
import { useLogoutMutation } from "@/features/auth/sign-out/model/use-logout-mutation"

type SettingsItem = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  action: "link" | "logout"
  href?: string
  /** true 면 같은 탭에서 이동, false/생략 시 새 탭 */
  sameTab?: boolean
  destructive?: boolean
}

const SETTINGS_ITEMS: SettingsItem[] = [
  { label: "고객센터", icon: Headphones, action: "link", href: "/support" },
  { label: "이용약관", icon: FileText, action: "link", href: "/terms" },
  { label: "개인정보처리방침", icon: Shield, action: "link", href: "/privacy" },
  { label: "환불·분쟁 정책", icon: Scale, action: "link", href: "/policies/refund-dispute" },
  { label: "로그아웃", icon: LogOut, action: "logout", destructive: true },
]

export function SettingsSection() {
  const logoutMutation = useLogoutMutation()

  const handleItemClick = (item: SettingsItem) => {
    if (item.action === "logout") {
      if (window.confirm("로그아웃 하시겠습니까?")) {
        logoutMutation.mutate()
      }
    } else if (item.href) {
      if (item.href === "#") return // placeholder 미구현 항목 — 클릭 무시
      if (item.sameTab) {
        window.location.href = item.href
      } else {
        window.open(item.href, "_blank", "noopener,noreferrer")
      }
    }
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      {SETTINGS_ITEMS.map((item, i) => {
        const Icon = item.icon
        return (
          <div key={item.label}>
            {i > 0 && <Separator />}
            <button
              onClick={() => handleItemClick(item)}
              disabled={item.action === "logout" && logoutMutation.isPending}
              className="flex w-full items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted"
            >
              <Icon
                className={item.destructive ? "size-5 text-destructive" : "size-5 text-muted-foreground"}
              />
              <Text
                as="span"
                typography="body3-medium"
                className={item.destructive ? "flex-1 text-left text-destructive" : "flex-1 text-left"}
              >
                {item.action === "logout" && logoutMutation.isPending
                  ? "로그아웃 중..."
                  : item.label}
              </Text>
              {item.action === "link" && (
                <ChevronRight className="size-4 text-muted-foreground" />
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}
