"use client"

import Link from "next/link"
import { Pencil } from "lucide-react"
import { Text } from "@/shared/ui/text"

export function HomeFabButton() {
  return (
    <Link
      href="/tickets/new"
      className="fixed right-5 bottom-20 z-40 flex items-center gap-op-sm rounded-full bg-primary px-5 py-3 shadow-lg transition-all hover:bg-primary-hover hover:shadow-xl active:scale-95 md:bottom-8"
    >
      <Pencil className="h-4 w-4 text-primary-foreground" />
      <Text as="span" typography="body3-medium" className="text-primary-foreground">
        의뢰 등록
      </Text>
    </Link>
  )
}
