"use client"

import Link from "next/link"
import { ChevronRight, Pencil } from "lucide-react"
import { Text } from "@/shared/ui/text"
import { useMyProfileQuery } from "@/features/auth/me/model/use-my-profile-query"
import { useExpertExistsQuery } from "@/features/mypage"
import { useRoleStore } from "@/entities/user/model/role-store"

export function ProfileSection() {
  const { data: user } = useMyProfileQuery()
  const { data: expertExists } = useExpertExistsQuery()
  const role = useRoleStore((s) => s.role)

  if (!user) return null

  const initial = (user.nickname ?? user.name)?.[0] ?? "?"
  const isExpertMode = role === "expert" && expertExists

  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
      {/* Avatar */}
      {user.profileImageUrl ? (
        <img
          src={user.profileImageUrl}
          alt={user.nickname}
          className="size-14 rounded-full object-cover"
        />
      ) : (
        <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-chart-2">
          <Text as="span" typography="title-bold" className="text-white">
            {initial}
          </Text>
        </div>
      )}

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <Text as="span" typography="subtitle1-bold" className="truncate">
            {user.nickname}
          </Text>
          {expertExists && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              전문가
            </span>
          )}
        </div>
        <Text as="span" typography="body3-regular" className="truncate text-muted-foreground">
          {user.email}
        </Text>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Link
          href="/mypage/profile"
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted"
        >
          <Pencil className="size-4" />
        </Link>
        {isExpertMode && (
          <Link
            href={`/experts/${user.id}`}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted"
          >
            <ChevronRight className="size-4" />
          </Link>
        )}
      </div>
    </div>
  )
}
