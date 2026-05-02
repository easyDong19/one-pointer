"use client"

import { usePathname } from "next/navigation"
import { CommonHeader } from "@/shared/ui/common-header"
import { HeaderSearch } from "@/features/ticket/search/ui/header-search"
import { HeaderAuthSection } from "./header-auth-section"

/**
 * `(main)` 그룹 공용 헤더 조립체.
 *
 * - 모바일에서는 홈(`/`) 에서만 노출, 그 외 경로에서는 `MobileHeader` 가 대체.
 * - 데스크탑에서는 모든 `(main)` 경로에서 노출.
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
        <CommonHeader.NavLink href="/chat">채팅</CommonHeader.NavLink>
        <CommonHeader.NavLink href="/tickets/new">의뢰 등록</CommonHeader.NavLink>
        <HeaderAuthSection />
      </CommonHeader.Actions>
    </CommonHeader>
  )
}
