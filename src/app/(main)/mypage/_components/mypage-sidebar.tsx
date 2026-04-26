"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/shared/lib/utils"
import { useSidebarMenus, useExpertExistsQuery, openExpertRegisterPrompt, type SidebarMenuGroup } from "@/features/mypage"
import { useRoleStore } from "@/entities/user/model/role-store"

export function MypageSidebar() {
  const router = useRouter()
  const menus = useSidebarMenus()
  const activeRole = useRoleStore((s) => s.role)
  const setRole = useRoleStore((s) => s.setRole)
  const { data: expertExists, isLoading } = useExpertExistsQuery()

  const handleToggle = async () => {
    if (activeRole === "expert") {
      setRole("client")
      router.push("/mypage")
      return
    }

    if (isLoading) return

    if (expertExists) {
      setRole("expert")
      router.push("/mypage")
      return
    }

    const confirmed = await openExpertRegisterPrompt()
    if (confirmed) {
      router.push("/mypage/expert-register")
    }
  }

  return (
    <nav className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {activeRole === "expert" ? "전문가" : "의뢰인"} 모드
        </span>
        <button
          onClick={handleToggle}
          disabled={isLoading && activeRole === "client"}
          className="text-primary text-sm font-medium hover:underline"
        >
          {activeRole === "expert" ? "의뢰인" : "전문가"}으로 전환
        </button>
      </div>

      {menus.map((group, gi) => (
        <SidebarGroup key={gi} group={group} />
      ))}
    </nav>
  )
}

function SidebarGroup({ group }: { group: SidebarMenuGroup }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-1">
      {group.title && (
        <span className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {group.title}
        </span>
      )}
      {group.items.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-foreground hover:bg-muted",
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}
