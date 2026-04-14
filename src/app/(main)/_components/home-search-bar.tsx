"use client"

import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Text } from "@/shared/ui/text"

export function HomeSearchBar() {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.push("/search")}
      className="flex w-full items-center gap-op-md rounded-xl border border-border bg-card px-op-lg py-op-md transition-colors hover:border-primary/30"
    >
      <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
      <Text as="span" typography="body3-regular" className="text-muted-foreground">
        전문가 또는 의뢰 검색
      </Text>
    </button>
  )
}
