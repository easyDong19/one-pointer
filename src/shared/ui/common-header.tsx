"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { cn } from "@/shared/lib/utils"
import { Text } from "@/shared/ui/text"

/**
 * CommonHeader — `(main)` 레이아웃 공용 반응형 헤더 primitive.
 *
 * - 도메인 지식 없음. 레이아웃/슬롯 시맨틱만 제공.
 * - 단일 컴포넌트에서 뷰포트별 레이아웃을 CSS 로 분기.
 *   - DesktopNav: `hidden md:flex` — 모바일 완전 제거
 *   - Slot/Actions/Logo: 항상 렌더, 자식이 자체 반응형 처리
 *
 * 사용 예:
 * ```tsx
 * <CommonHeader>
 *   <CommonHeader.Logo href="/">쪽집게</CommonHeader.Logo>
 *   <CommonHeader.DesktopNav>
 *     <CommonHeader.NavLink href="/experts">전문가 찾기</CommonHeader.NavLink>
 *   </CommonHeader.DesktopNav>
 *   <CommonHeader.Slot><HeaderSearch /></CommonHeader.Slot>
 *   <CommonHeader.Actions>{actions}</CommonHeader.Actions>
 * </CommonHeader>
 * ```
 */

/* ─── Root ─────────────────────────────────────────────────────────────────── */

function CommonHeaderRoot({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        "border-border/50 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-12 items-center gap-3 px-4",
          "md:h-14 md:max-w-6xl md:gap-6 md:px-10 lg:px-16",
        )}
      >
        {children}
      </div>
    </header>
  )
}

/* ─── Logo ─────────────────────────────────────────────────────────────────── */

function Logo({
  href = "/",
  children,
}: {
  href?: string
  children: ReactNode
}) {
  return (
    <Link href={href} className="shrink-0">
      <Text as="span" typography="subtitle1-bold" className="text-primary">
        {children}
      </Text>
    </Link>
  )
}

/* ─── DesktopNav ──────────────────────────────────────────────────────────── */

function DesktopNav({ children }: { children: ReactNode }) {
  return <nav className="hidden shrink-0 items-center gap-6 md:flex">{children}</nav>
}

/* ─── NavLink ──────────────────────────────────────────────────────────────── */

function NavLink({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  return (
    <Link href={href} className="transition-colors">
      <Text
        as="span"
        typography="body3-medium"
        className="text-muted-foreground hover:text-primary"
      >
        {children}
      </Text>
    </Link>
  )
}

/* ─── Slot ─────────────────────────────────────────────────────────────────── */

/**
 * 가변 중앙 영역. 데스크탑에선 검색 Input 이 확장되며, 모바일에선 Search 아이콘 버튼만
 * 우측 가까이 정렬된다. 레이아웃 뉘앙스는 자식이 결정한다.
 */
function Slot({ children }: { children: ReactNode }) {
  return <div className="flex flex-1 items-center justify-end md:justify-center">{children}</div>
}

/* ─── Actions ──────────────────────────────────────────────────────────────── */

function Actions({ children }: { children: ReactNode }) {
  return <div className="flex shrink-0 items-center gap-2">{children}</div>
}

/* ─── Export ───────────────────────────────────────────────────────────────── */

export const CommonHeader = Object.assign(CommonHeaderRoot, {
  Logo,
  DesktopNav,
  NavLink,
  Slot,
  Actions,
})
