"use client"

import { CommonHeader } from "@/shared/ui/common-header"
import { HeaderSearch } from "@/features/ticket/search/ui/header-search"
import { HeaderAuthSection } from "./header-auth-section"

/**
 * `(main)` 그룹 공용 헤더 조립체.
 *
 * - `CommonHeader` primitive 에 로고/네비/검색/Auth 를 슬롯 주입.
 * - 반응형 동작은 primitive 와 `HeaderSearch` 내부에서 처리됨.
 */
export function MainCommonHeader() {
  return (
    <CommonHeader>
      <CommonHeader.Logo href="/">쪽집게</CommonHeader.Logo>

      <CommonHeader.DesktopNav>
        <CommonHeader.NavLink href="/experts">전문가 찾기</CommonHeader.NavLink>
        <CommonHeader.NavLink href="/tickets/new">의뢰 등록</CommonHeader.NavLink>
        <CommonHeader.NavLink href="/about">서비스 소개</CommonHeader.NavLink>
      </CommonHeader.DesktopNav>

      <CommonHeader.Slot>
        <div className="flex w-full max-w-md justify-end md:max-w-sm md:justify-center">
          <HeaderSearch />
        </div>
      </CommonHeader.Slot>

      <CommonHeader.Actions>
        <HeaderAuthSection />
      </CommonHeader.Actions>
    </CommonHeader>
  )
}
