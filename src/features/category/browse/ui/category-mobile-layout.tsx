"use client"

import { MobileHeader } from "@/shared/ui/mobile-header"
import { CategoryMainTabs } from "./category-main-tabs"
import { CategorySubTabs } from "./category-sub-tabs"
import { TicketFilterBar, ExpertFilterBar } from "./category-filters"
import { CategoryContentList } from "./category-content-list"
import type { useCategoryDetail } from "../model/use-category-detail"

type Detail = ReturnType<typeof useCategoryDetail>

/**
 * 카테고리 상세의 모바일(< lg) 레이아웃.
 *
 * app-shell 스크롤 격리 (CATEGORY_PAGE.md §2.3):
 * - 외곽 `h-dvh overflow-hidden` — 모바일은 CommonHeader 가 이 경로에서 숨겨지므로 뷰포트 전체 사용.
 * - 상단 스택(MobileHeader · MainTabs · SubTabs · FilterBar) 은 `shrink-0` 고정.
 * - 리스트 영역만 `flex-1 overflow-y-auto` → 유일한 세로 스크롤 지점.
 * - 리스트 내부 `pb-16` 으로 BottomNav 가리지 않게 여백 확보.
 *
 * PageShell 은 사용하지 않는다 — `min-h-dvh` 가 app-shell 모델과 충돌.
 */
export function CategoryMobileLayout({
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
    <div className="bg-background flex h-dvh flex-col overflow-hidden">
      {/* Top fixed stack */}
      <div className="bg-background/80 shrink-0 backdrop-blur-md">
        <MobileHeader className="static z-auto border-border/50">
          <MobileHeader.BackButton />
          <MobileHeader.Title>{category.name}</MobileHeader.Title>
          <MobileHeader.Spacer />
        </MobileHeader>

        <CategoryMainTabs activeTab={state.mainTab} onTabChange={handleMainTabChange} />
        <CategorySubTabs
          subCategories={allSubCategories}
          activeSubCategoryId={state.subCategoryId}
          onSubCategoryChange={actions.setSubCategory}
        />

        {/* Filter Bar — 상단 스택의 마지막 요소 */}
        <div className="border-border/50 bg-background border-b">
          <div className="scrollbar-none flex items-center gap-2 overflow-x-auto px-4 py-2.5">
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
      </div>

      {/* List — 유일한 세로 스크롤 영역 */}
      <main className="flex-1 overflow-y-auto pb-16">
        <CategoryContentList
          mainTab={state.mainTab}
          tickets={tickets}
          experts={experts}
          isTicketLoading={ticketQuery.isLoading}
          isExpertLoading={expertQuery.isLoading}
          isFetchingNextPage={ticketQuery.isFetchingNextPage || expertQuery.isFetchingNextPage}
          loadMoreRef={loadMoreRef}
        />
      </main>
    </div>
  )
}
