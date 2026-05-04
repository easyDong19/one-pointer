"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageSquare, Pencil } from "lucide-react"
import { CommonHeader } from "@/shared/ui/common-header"
import { Button } from "@/shared/ui/button"
import { HeaderSearch } from "@/features/ticket/search/ui/header-search"
import { HeaderAuthSection } from "./header-auth-section"

/**
 * `(main)` 그룹 공용 헤더 조립체.
 *
 * - 모바일에서는 홈(`/`) 에서만 노출, 그 외 경로에서는 `MobileHeader` 가 대체.
 * - 데스크탑에서는 모든 `(main)` 경로에서 노출.
 *
 * Actions: "Three-tier Pill Rhythm" — 모두 rounded-full pill, 농도로 hierarchy.
 * - 채팅: ghost (가장 약함)
 * - 의뢰 등록: filled primary (핵심 CTA)
 * - 마이페이지: outline (utility)
 */
export function MainCommonHeader() {
  const pathname = usePathname()
  const isHome = pathname === "/"

  return (
    <CommonHeader className={isHome ? undefined : "hidden md:block"}>
      <CommonHeader.Logo href="/">쪽집게</CommonHeader.Logo>

      <CommonHeader.Slot>
        <div className="flex w-full max-w-md justify-end md:max-w-sm md:justify-start">
          <HeaderSearch />
        </div>
      </CommonHeader.Slot>

      <CommonHeader.Actions>
        <Button asChild variant="ghost" className="rounded-full px-5 py-2">
          <Link href="/chat">
            <MessageSquare className="size-4" />
            채팅
          </Link>
        </Button>
        <Button asChild className="rounded-full px-5 py-2">
          <Link href="/tickets/new">
            <Pencil className="size-4" />
            의뢰 등록
          </Link>
        </Button>
        <HeaderAuthSection />
      </CommonHeader.Actions>
    </CommonHeader>
  )
}
