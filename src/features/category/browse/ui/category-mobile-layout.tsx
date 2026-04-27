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
 * 일반 body(window) 스크롤 + MobileHeader 만 sticky:
 * - 페이지 전체가 자연스럽게 스크롤된다.
 * - MobileHeader 는 `shared/ui/common-header.tsx` 에서 자체 `sticky top-0` 적용 → 추가 처리 불필요.
 * - MainTabs · SubTabs · FilterBar 는 일반 흐름 → 스크롤 시 위로 사라져 콘텐츠 영역 확보.
 * - 리스트 하단에 `pb-16` 로 BottomNav 가리지 않게 여백 확보.
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
    <div className="bg-background">
      <MobileHeader className="border-border/50">
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

      {/* Filter Bar */}
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

      {/* List — 자연 흐름. BottomNav 보정용 pb-16 */}
      <main className="pb-16">
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
