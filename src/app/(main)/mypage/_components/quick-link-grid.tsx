"use client"

import Link from "next/link"
import { FolderOpen, Landmark, ChevronRight } from "lucide-react"
import { Text } from "@/shared/ui/text"
import { useRoleStore } from "@/entities/user/model/role-store"
import { useExpertExistsQuery } from "@/features/mypage"

type QuickLink = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bg: string
}

const EXPERT_QUICK_LINKS: QuickLink[] = [
  {
    label: "포트폴리오",
    href: "/mypage/portfolios",
    icon: FolderOpen,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "내 정산 계좌",
    href: "/mypage/bank-account",
    icon: Landmark,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
]

export function QuickLinkGrid() {
  const role = useRoleStore((s) => s.role)
  const { data: expertExists } = useExpertExistsQuery()

  if (role !== "expert" || !expertExists) return null

  return (
    <div className="grid grid-cols-2 gap-3">
      {EXPERT_QUICK_LINKS.map((link) => {
        const Icon = link.icon
        return (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-muted"
          >
            <div className={`flex size-9 items-center justify-center rounded-lg ${link.bg}`}>
              <Icon className={`size-5 ${link.color}`} />
            </div>
            <Text as="span" typography="body3-medium" className="flex-1">
              {link.label}
            </Text>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        )
      })}
    </div>
  )
}
