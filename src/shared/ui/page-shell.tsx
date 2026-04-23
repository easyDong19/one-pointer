"use client"

import { createContext, useContext, type ReactNode } from "react"
import { cn } from "@/shared/lib/utils"

/**
 * PageShell — `(main)` 페이지의 공통 그리드 셸.
 *
 * tier 토큰(`shell` / `content` / `list` / `form`) 에 맞춰 Content 슬롯의
 * max-width 와 좌우 padding 을 단일 지점에서 제공한다. Header 슬롯은 CommonHeader
 * 바로 아래에 sticky 로 앉고 (`md:top-14`), Root 는 BottomNav 여백과 가로 overflow
 * 방어를 자동으로 처리한다.
 *
 * 정책: docs/design/LAYOUT.md
 */

type Tier = "shell" | "content" | "list" | "form"

const tierClasses: Record<Tier, string> = {
  shell: "max-w-6xl px-5 md:px-10 lg:px-16",
  content: "max-w-5xl px-4 md:px-0",
  list: "max-w-3xl px-4 md:px-6 lg:max-w-5xl lg:px-8",
  form: "max-w-lg px-4",
}

const TierContext = createContext<Tier>("shell")

function PageShellRoot({ tier, children }: { tier: Tier; children: ReactNode }) {
  return (
    <TierContext.Provider value={tier}>
      <div className="bg-background flex min-h-dvh flex-col overflow-x-hidden pb-16 md:pt-14 md:pb-0">
        {children}
      </div>
    </TierContext.Provider>
  )
}

/**
 * 페이지-로컬 sticky 헤더 슬롯.
 *
 * 모바일은 `top-0` (CommonHeader 가 숨겨짐), 데스크탑은 `md:top-14` (CommonHeader h-14 아래).
 * z-index 는 `z-40` 고정 (CommonHeader `z-50` 보다 아래).
 *
 * 자식의 뷰포트별 가시성에는 관여하지 않는다 (MobileHeader 의 md:hidden 등은 자식이 책임).
 */
function Header({ children }: { children: ReactNode }) {
  return <div className="sticky top-0 z-40">{children}</div>
}

/**
 * tier 토큰 기반 본문 컨테이너.
 *
 * - `spacing="default"` (기본): `py-6 md:py-10`
 * - `spacing="none"`: 세로 padding 없음. 이미지 캐러셀 같은 풀-블리드 섹션이 상단에
 *   오는 디테일 페이지에서 사용한다.
 */
function Content({
  children,
  spacing = "default",
  className,
}: {
  children: ReactNode
  spacing?: "default" | "none"
  className?: string
}) {
  const tier = useContext(TierContext)
  return (
    <div
      className={cn(
        "mx-auto w-full",
        tierClasses[tier],
        spacing === "default" && "py-6 md:py-10",
        className,
      )}
    >
      {children}
    </div>
  )
}

/**
 * 페이지-로컬 푸터/고정 CTA 슬롯.
 *
 * `mt-auto` 로 컨텐츠가 짧을 때 뷰포트 하단에 밀착. 고정 CTA (예: TicketMobileBottomBar)
 * 는 내부 컴포넌트가 자체 `fixed` 로 띄우며, BottomNav 와 겹치지 않도록 본인의
 * `bottom-*` 오프셋을 책임진다.
 */
function Footer({ children }: { children: ReactNode }) {
  return <div className="mt-auto">{children}</div>
}

export const PageShell = Object.assign(PageShellRoot, {
  Header,
  Content,
  Footer,
})

/**
 * RSC(server component) 에서 `PageShell.*` 서브프로퍼티 접근은
 * 클라이언트 참조 serialization 이슈로 undefined 가 될 수 있다.
 * 서버 컴포넌트에서는 아래 named export 를 사용한다.
 */
export { Header as PageShellHeader, Content as PageShellContent, Footer as PageShellFooter }
