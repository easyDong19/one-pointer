"use client"

import { cn } from "@/shared/lib/utils"
import { Text } from "@/shared/ui/text"
import { useRoleStore } from "@/entities/user/model/role-store"

export function RoleToggle() {
  const role = useRoleStore((s) => s.role)
  const setRole = useRoleStore((s) => s.setRole)

  return (
    <div className="flex rounded-lg bg-muted p-1">
      <button
        onClick={() => setRole("client")}
        className={cn(
          "flex-1 rounded-md px-4 py-2 text-center transition-colors",
          role === "client"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Text as="span" typography="body3-medium">
          의뢰인
        </Text>
      </button>
      <button
        onClick={() => setRole("expert")}
        className={cn(
          "flex-1 rounded-md px-4 py-2 text-center transition-colors",
          role === "expert"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Text as="span" typography="body3-medium">
          전문가
        </Text>
      </button>
    </div>
  )
}
