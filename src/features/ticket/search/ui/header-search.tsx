"use client"

import { usePathname } from "next/navigation"
import { useMediaQuery } from "@/shared/hooks/use-media-query"
import { HeaderSearchPopover } from "./header-search-popover"
import { HeaderSearchModal } from "./header-search-modal"

/**
 * 뷰포트에 따라 데스크탑(Popover + Input) / 모바일(Search 아이콘 + 풀스크린 Dialog) 분기.
 *
 * - Popover 와 Dialog 는 내부 state 가 섞이면 안 되므로 CSS hidden 이 아닌
 *   `useMediaQuery` 로 둘 중 하나만 마운트한다.
 * - SSR 초기 렌더에서는 `useMediaQuery` 가 false 를 반환하므로 모바일 variant 가 먼저
 *   마운트되고, 하이드레이션 후 데스크탑으로 교체된다 — 이는 matchMedia 기반 훅의 표준 동작.
 * - `key={pathname}` 으로 페이지 이동 시 내부 state(keyword, popover open 등)를 자연스럽게 초기화한다.
 */
export function HeaderSearch() {
  const pathname = usePathname()
  const isDesktop = useMediaQuery("(min-width: 768px)")
  return isDesktop ? <HeaderSearchPopover key={pathname} /> : <HeaderSearchModal />
}
