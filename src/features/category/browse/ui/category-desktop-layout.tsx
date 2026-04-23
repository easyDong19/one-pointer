"use client"

import { CategoryDesktopSidebar } from "./category-desktop-sidebar"
import { TicketFilterBar, ExpertFilterBar } from "./category-filters"
import { CategoryContentList } from "./category-content-list"
import type { useCategoryDetail } from "../model/use-category-detail"

type Detail = ReturnType<typeof useCategoryDetail>

/**
 * 카테고리 상세의 데스크탑(≥ lg) 레이아웃.
 *
 * app-shell 스크롤 격리 (CATEGORY_PAGE.md §2.3):
 * - 외곽 래퍼가 `h-[calc(100dvh-3.5rem)] overflow-hidden` — 뷰포트 - CommonHeader 높이.
 * - grid 내부 메인 컬럼에만 `overflow-y-auto` → 스크롤바는 메인 컬럼 내부에만.
 * - 사이드바는 스크롤을 안 하는 컬럼으로 자연히 고정된 모양.
 *
 * PageShell 은 사용하지 않는다 — `min-h-dvh` 가 app-shell 모델과 충돌.
 * CommonHeader 의 `md:pt-14` 보상은 이 페이지에서 직접 불필요 (fixed 헤더 아래 뷰포트 높이 계산).
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
    <div className="bg-background h-[calc(100dvh-3.5rem)] overflow-hidden pt-14">
      <div className="mx-auto grid h-full max-w-6xl grid-cols-[240px_minmax(0,1fr)] gap-8 px-10 lg:px-16">
        {/* Sidebar — 스크롤 안 함 (내부 리스트가 넘칠 때만 자체 overflow-y-auto) */}
        <aside className="overflow-y-auto py-6 pr-1">
          <CategoryDesktopSidebar
            categoryName={category.name}
            mainTab={state.mainTab}
            onMainTabChange={handleMainTabChange}
            subCategories={allSubCategories}
            activeSubCategoryId={state.subCategoryId}
            onSubCategoryChange={actions.setSubCategory}
          />
        </aside>

        {/* Main — 유일한 주 스크롤 영역 */}
        <div className="flex min-h-0 flex-col overflow-y-auto">
          {/* Filter Bar (sticky top-0 within main) */}
          <div className="border-border/50 bg-background sticky top-0 z-10 border-b">
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
