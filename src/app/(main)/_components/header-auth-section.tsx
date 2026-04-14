"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogOut, User } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Text } from "@/shared/ui/text"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { useAuthStore } from "@/entities/auth/model/auth-store"
import { logout } from "@/entities/auth/api/auth.service"

export function HeaderAuthSection() {
  const { status, user } = useAuthStore()
  const router = useRouter()

  if (status !== "authenticated" || !user) {
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

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      useAuthStore.getState().setUnauthenticated()
      router.push("/")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Text as="span" typography="body3-bold">
            {user.nickname?.charAt(0) ?? user.name?.charAt(0) ?? "U"}
          </Text>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link href="/mypage" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            마이페이지
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
