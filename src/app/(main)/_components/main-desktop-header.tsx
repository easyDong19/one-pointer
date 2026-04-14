"use client"

import { DesktopHeader } from "@/shared/ui/desktop-header"
import { HeaderAuthSection } from "./header-auth-section"

export function MainDesktopHeader() {
  return (
    <DesktopHeader>
      <DesktopHeader.Logo />
      <DesktopHeader.Nav>
        <DesktopHeader.NavLink href="/experts">전문가 찾기</DesktopHeader.NavLink>
        <DesktopHeader.NavLink href="/tickets/new">의뢰 등록</DesktopHeader.NavLink>
        <DesktopHeader.NavLink href="/about">서비스 소개</DesktopHeader.NavLink>
      </DesktopHeader.Nav>
      <DesktopHeader.Actions>
        <HeaderAuthSection />
      </DesktopHeader.Actions>
    </DesktopHeader>
  )
}
