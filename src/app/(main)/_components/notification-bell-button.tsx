"use client"

import Link from "next/link"
import { Bell } from "lucide-react"

import { useAuthStore } from "@/entities/auth/model/auth-store"
import { useUnreadCountQuery } from "@/features/notification/list/model/use-unread-count-query"
import { Button } from "@/shared/ui/button"

export function NotificationBellButton() {
  const isAuthed = useAuthStore((s) => s.status === "authenticated")
  const { data: count } = useUnreadCountQuery(isAuthed)

  if (!isAuthed) return null

  return (
    <Button asChild variant="ghost" className="relative rounded-full px-5 py-2">
      <Link href="/notifications">
        <Bell className="size-4" />
        알림
        {!!count && count > 0 && (
          <span className="bg-primary text-primary-foreground absolute -top-0.5 right-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Link>
    </Button>
  )
}
