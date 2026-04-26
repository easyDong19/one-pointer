"use client"

import { useRouter } from "next/navigation"
import { cn } from "@/shared/lib/utils"
import { Text } from "@/shared/ui/text"
import { useRoleStore } from "@/entities/user/model/role-store"
import { useExpertExistsQuery, openExpertRegisterPrompt } from "@/features/mypage"

export function RoleToggle() {
  const router = useRouter()
  const role = useRoleStore((s) => s.role)
  const setRole = useRoleStore((s) => s.setRole)
  const { data: expertExists, isLoading } = useExpertExistsQuery()

  const handleExpertClick = async () => {
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
    <div className="flex rounded-lg bg-muted p-1">
      <button
        onClick={() => {
          setRole("client")
          router.push("/mypage")
        }}
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
        onClick={handleExpertClick}
        disabled={isLoading}
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
