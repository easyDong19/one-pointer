"use client"

import { useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { SubCategory } from "@/entities/category/api/category.schema"
import type { TicketFeedParams } from "@/entities/ticket/api/ticket.schema"
import type { ExpertListParams } from "@/entities/expert/api/expert.schema"
import { useCategoryListQuery } from "./use-category-list-query"
import { useCategoryFilterReducer } from "./use-category-filter-reducer"
import { useTicketFeedQuery } from "@/features/ticket/feed/model/use-ticket-feed-query"
import { useExpertListQuery } from "@/features/expert/browse/model/use-expert-list-query"
import { openRegionPicker } from "@/features/region/select/lib/open-region-picker"

/** 카테고리 상세 페이지의 모든 비즈니스 로직을 통합하는 facade 훅 */
export function useCategoryDetail(categoryName: string) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") === "experts" ? ("experts" as const) : ("tickets" as const)
  const [state, actions] = useCategoryFilterReducer(initialTab)

  const handleMainTabChange = (tab: "tickets" | "experts") => {
    actions.setMainTab(tab)
    const params = new URLSearchParams(searchParams.toString())
    if (tab === "experts") {
      params.set("tab", "experts")
    } else {
      params.delete("tab")
    }
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  // ── CSR: 카테고리 목록 패칭 ──
  const { data: categories, isLoading: isCategoryLoading } = useCategoryListQuery()
  const category = categories?.find((c) => c.name === categoryName)

  // Sub-category list (전체 + 하위 카테고리)
  const allSubCategories: (SubCategory & { isAll: boolean })[] = category
    ? [
        { id: -1, name: "전체", isAll: true },
        ...category.subCategories.map((sc) => ({ ...sc, isAll: false })),
      ]
    : []

  // ── Query params ──

  const ticketFeedParams: TicketFeedParams = {
    ...(category && { majorCategoryId: category.id }),
    ...(state.subCategoryId && { subCategoryId: state.subCategoryId }),
    ...(state.ticketType && { ticketType: state.ticketType }),
    ...(state.region && { region: state.region }),
    sortBy: state.ticketSort,
    size: 20,
  }

  const expertListParams: ExpertListParams = {
    ...(category && { majorCategoryId: category.id }),
    ...(state.subCategoryId && { subCategoryId: state.subCategoryId }),
    ...(state.minRating && { minRating: state.minRating }),
    ...(state.activityMethod && { method: state.activityMethod }),
    ...(state.region && { region: state.region }),
    sortBy: state.expertSort,
    size: 20,
  }

  // ── Queries ──

  const ticketQuery = useTicketFeedQuery(
    ticketFeedParams,
    state.mainTab === "tickets" && !!category,
  )
  const expertQuery = useExpertListQuery(
    expertListParams,
    state.mainTab === "experts" && !!category,
  )

  const tickets = ticketQuery.data?.pages.flatMap((p) => p.content) ?? []
  const experts = expertQuery.data?.pages.flatMap((p) => p.content) ?? []

  // ── Infinite scroll ──

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect()
      if (!node) return

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting) {
          if (
            state.mainTab === "tickets" &&
            ticketQuery.hasNextPage &&
            !ticketQuery.isFetchingNextPage
          ) {
            ticketQuery.fetchNextPage()
          }
          if (
            state.mainTab === "experts" &&
            expertQuery.hasNextPage &&
            !expertQuery.isFetchingNextPage
          ) {
            expertQuery.fetchNextPage()
          }
        }
      })

      observerRef.current.observe(node)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- use stable primitives instead of query objects to avoid infinite re-render
    [
      state.mainTab,
      ticketQuery.hasNextPage,
      ticketQuery.isFetchingNextPage,
      expertQuery.hasNextPage,
      expertQuery.isFetchingNextPage,
    ],
  )

  // ── Region picker handler ──

  const handleRegionClick = async () => {
    const result = await openRegionPicker(state.region)
    if (result !== null) {
      actions.setRegion(result)
    }
  }

  return {
    state,
    actions,
    category,
    isCategoryLoading,
    allSubCategories,
    tickets,
    experts,
    ticketQuery,
    expertQuery,
    loadMoreRef,
    handleMainTabChange,
    handleRegionClick,
  }
}
