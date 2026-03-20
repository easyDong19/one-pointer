"use client"

import { useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Loader2 } from "lucide-react"
import InboxIcon from "@mui/icons-material/Inbox"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"
import type { SubCategory } from "@/entities/category/api/category.schema"
import type { TicketFeedParams } from "@/entities/ticket/api/ticket.schema"
import type { ExpertListParams } from "@/entities/expert/api/expert.schema"
import { useCategoryListQuery } from "@/features/category/browse/model/use-category-list-query"
import { useTicketFeedQuery } from "@/features/ticket/feed/model/use-ticket-feed-query"
import { useExpertListQuery } from "@/features/expert/browse/model/use-expert-list-query"
import { openRegionPicker } from "@/features/region/select/lib/open-region-picker"
import { useCategoryFilterReducer } from "./use-category-filter-reducer"
import { TicketFilterBar, ExpertFilterBar } from "./category-filters"
import { TicketList } from "./ticket-list-item"
import { ExpertList } from "./expert-list-item"

// ─── Main Component ───────────────────────────────────────────────────────────

export function CategoryDetailContent({ categoryName }: { categoryName: string }) {
  const router = useRouter()
  const [state, actions] = useCategoryFilterReducer()

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
    [state.mainTab, ticketQuery, expertQuery],
  )

  // ── Region picker handler ──

  const handleRegionClick = async () => {
    const result = await openRegionPicker(state.region)
    if (result !== null) {
      actions.setRegion(result)
    }
  }

  // ── Loading state (카테고리 패칭 중) ──

  if (isCategoryLoading) {
    return (
      <div className="bg-background flex min-h-dvh items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="bg-background flex min-h-dvh flex-col items-center justify-center gap-3">
        <Text as="p" typography="body1-medium" className="text-muted-foreground">
          카테고리를 찾을 수 없습니다
        </Text>
        <button
          onClick={() => router.back()}
          className="text-primary text-sm font-medium underline"
        >
          뒤로가기
        </button>
      </div>
    )
  }

  // ── Render ──

  return (
    <div className="bg-background flex min-h-dvh flex-col">
      {/* ── Sticky Header Group ── */}
      <div className="bg-background/80 sticky top-0 z-50 backdrop-blur-md">
        {/* Header */}
        <header className="border-border/50 border-b">
          <div className="mx-auto flex max-w-3xl items-center px-4 py-2.5 lg:max-w-5xl">
            <button
              onClick={() => router.back()}
              className="hover:bg-muted -ml-2 flex items-center justify-center rounded-full p-2 transition-colors"
            >
              <ChevronLeft className="text-foreground h-5 w-5" />
            </button>
            <Text
              as="h1"
              typography="subtitle1-bold"
              className="text-foreground flex-1 text-center"
            >
              {category.name}
            </Text>
            <div className="w-9" />
          </div>
        </header>

        {/* Main Tabs (의뢰 / 전문가) */}
        <div className="border-border/50 border-b">
          <div className="mx-auto flex max-w-3xl lg:max-w-5xl">
            {(["tickets", "experts"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => actions.setMainTab(tab)}
                className={cn(
                  "relative flex-1 py-2.5 text-center transition-colors",
                  state.mainTab === tab ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Text as="span" typography="body2-bold">
                  {tab === "tickets" ? "의뢰" : "전문가"}
                </Text>
                {state.mainTab === tab && (
                  <span className="bg-primary absolute bottom-0 left-1/2 h-[2px] w-12 -translate-x-1/2 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-category Tabs */}
        <div className="border-border/50 border-b">
          <div className="scrollbar-none mx-auto flex max-w-3xl gap-0 overflow-x-auto lg:max-w-5xl">
            {allSubCategories.map((sc) => {
              const isActive = sc.isAll
                ? state.subCategoryId === undefined
                : state.subCategoryId === sc.id
              return (
                <button
                  key={sc.id}
                  onClick={() => actions.setSubCategory(sc.isAll ? undefined : sc.id)}
                  className={cn(
                    "shrink-0 px-5 py-2.5 transition-colors",
                    isActive
                      ? "border-foreground text-foreground border-b-2 font-semibold"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Text as="span" typography="body3-medium">
                    {sc.name}
                  </Text>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="border-border/50 bg-background border-b">
        <div className="scrollbar-none mx-auto flex max-w-3xl items-center gap-2 overflow-x-auto px-4 py-2.5 lg:max-w-5xl">
          {state.mainTab === "tickets" ? (
            <TicketFilterBar
              ticketType={state.ticketType}
              ticketSort={state.ticketSort}
              region={state.region}
              onTicketTypeChange={actions.setTicketType}
              onTicketSortChange={(val) =>
                actions.setTicketSort(val as typeof state.ticketSort)
              }
              onRegionClick={handleRegionClick}
            />
          ) : (
            <ExpertFilterBar
              minRating={state.minRating}
              activityMethod={state.activityMethod}
              expertSort={state.expertSort}
              region={state.region}
              onMinRatingChange={actions.setMinRating}
              onActivityMethodChange={actions.setActivityMethod}
              onExpertSortChange={(val) =>
                actions.setExpertSort(val as typeof state.expertSort)
              }
              onRegionClick={handleRegionClick}
            />
          )}
        </div>
      </div>

      {/* ── Content List ── */}
      <main className="mx-auto w-full max-w-3xl flex-1 lg:max-w-5xl">
        {state.mainTab === "tickets" ? (
          <TicketList tickets={tickets} isLoading={ticketQuery.isLoading} />
        ) : (
          <ExpertList experts={experts} isLoading={expertQuery.isLoading} />
        )}

        {/* Infinite scroll sentinel */}
        <div ref={loadMoreRef} className="h-px" />

        {/* Loading indicator */}
        {(ticketQuery.isFetchingNextPage || expertQuery.isFetchingNextPage) && (
          <div className="flex justify-center py-6">
            <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
        )}

        {/* Empty state */}
        {state.mainTab === "tickets" && !ticketQuery.isLoading && tickets.length === 0 && (
          <EmptyState message="등록된 의뢰가 없습니다" />
        )}
        {state.mainTab === "experts" && !expertQuery.isLoading && experts.length === 0 && (
          <EmptyState message="등록된 전문가가 없습니다" />
        )}
      </main>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
        <InboxIcon className="text-muted-foreground" style={{ fontSize: 32 }} />
      </div>
      <Text as="p" typography="body2-medium" className="text-muted-foreground">
        {message}
      </Text>
    </div>
  )
}
