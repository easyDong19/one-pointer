"use client"

import { CategoryDesktopSidebar } from "./category-desktop-sidebar"
import { TicketFilterBar, ExpertFilterBar } from "./category-filters"
import { CategoryContentList } from "./category-content-list"
import type { useCategoryDetail } from "../model/use-category-detail"

type Detail = ReturnType<typeof useCategoryDetail>

/**
 * 카테고리 상세의 데스크탑(≥ lg) 레이아웃.
 *
 * 사이드바 sticky 패턴 (CATEGORY_PAGE.md §2.3):
 * - 본문은 일반 body(window) 스크롤. 페이지 끝까지 자연스럽게 흘러간다.
 * - 사이드바는 `sticky top-14 self-start` 로 CommonHeader(`h-14`) 아래에 머무름.
 * - 사이드바가 뷰포트보다 길어지면 `max-h-[calc(100dvh-3.5rem)] overflow-y-auto` 로 그 안에서만 스크롤.
 * - FilterBar 도 window 기준 sticky → `top-14` 로 헤더 아래에 위치.
 *
 * PageShell 은 사용하지 않는다 — 사이드바형 레이아웃이라 max-w 정책이 약간 다름.
 * CommonHeader 가 데스크탑에서 `md:fixed top-0 h-14` 이므로 외곽에 `pt-14` 보상.
 */
export function CategoryDesktopLayout({
  state,
  actions,
  category,
  allSubCategories,
  tickets,
  experts,
  ticketQuery,
  expertQuery,
  loadMoreRef,
  handleMainTabChange,
  handleRegionClick,
}: Detail & { category: NonNullable<Detail["category"]> }) {
  return (
    <div className="bg-background pt-14">
      <div className="mx-auto grid max-w-6xl grid-cols-[240px_minmax(0,1fr)] gap-8 px-10 lg:px-16">
        {/* Sidebar — 헤더 아래 sticky. 사이드바가 길어지면 자체 스크롤 */}
        <aside className="sticky top-14 self-start max-h-[calc(100dvh-3.5rem)] overflow-y-auto py-6 pr-1">
          <CategoryDesktopSidebar
            categoryName={category.name}
            mainTab={state.mainTab}
            onMainTabChange={handleMainTabChange}
            subCategories={allSubCategories}
            activeSubCategoryId={state.subCategoryId}
            onSubCategoryChange={actions.setSubCategory}
          />
        </aside>

        {/* Main — 자연 흐름. window 스크롤이 본 페이지를 움직인다. */}
        <div className="flex flex-col">
          {/* Filter Bar — window 기준 sticky, 헤더(h-14) 아래로 보정 */}
          <div className="border-border/50 bg-background sticky top-14 z-10 border-b">
            <div className="scrollbar-none flex items-center gap-2 overflow-x-auto py-2.5">
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

          <CategoryContentList
            mainTab={state.mainTab}
            tickets={tickets}
            experts={experts}
            isTicketLoading={ticketQuery.isLoading}
            isExpertLoading={expertQuery.isLoading}
            isFetchingNextPage={
              ticketQuery.isFetchingNextPage || expertQuery.isFetchingNextPage
            }
            loadMoreRef={loadMoreRef}
          />
        </div>
      </div>
    </div>
  )
}
