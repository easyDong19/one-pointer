"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { cn } from "@/shared/lib/utils"
import { Text } from "@/shared/ui/text"

/**
 * CommonHeader — `(main)` 레이아웃 공용 반응형 헤더 primitive.
 *
 * - 도메인 지식 없음. 레이아웃/슬롯 시맨틱만 제공.
 * - Slot: 데스크탑 좌측(로고 옆) / 모바일 우측 정렬
 * - Actions: 데스크탑 전용 (`hidden md:flex`). 모바일에서는 렌더되지 않음.
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
        "border-border/50 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-md md:fixed md:top-0 md:right-0 md:left-0",
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
  return <div className="flex flex-1 items-center justify-end md:justify-start">{children}</div>
}

/* ─── Actions ──────────────────────────────────────────────────────────────── */

function Actions({ children }: { children: ReactNode }) {
  return <div className="hidden shrink-0 items-center gap-2 md:flex">{children}</div>
}

/* ─── Export ───────────────────────────────────────────────────────────────── */

export const CommonHeader = Object.assign(CommonHeaderRoot, {
  Logo,
  NavLink,
  Slot,
  Actions,
})
