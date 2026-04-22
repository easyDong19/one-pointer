"use client"

import Link from "next/link"
import { Button } from "@/shared/ui/button"
import { Text } from "@/shared/ui/text"
import { useAuthStore } from "@/entities/auth/model/auth-store"

export function HeaderAuthSection() {
  const status = useAuthStore((s) => s.status)

  if (status === "authenticated") {
    return (
      <Link href="/mypage">
        <Button variant="outline" className="rounded-full px-5 py-2">
          <Text as="span" typography="body3-medium">
            마이페이지
          </Text>
        </Button>
      </Link>
    )
  }

  return (
    <Link href="/login">
      <Button className="rounded-full px-5 py-2">
        <Text as="span" typography="body3-medium" className="text-primary-foreground">
          로그인
        </Text>
      </Button>
    </Link>
  )
}
