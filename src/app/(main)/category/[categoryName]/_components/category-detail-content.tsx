"use client"

import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Text } from "@/shared/ui/text"
import { MobileHeader } from "@/shared/ui/mobile-header"
import { useCategoryDetail } from "@/features/category/browse/model/use-category-detail"
import { CategoryMainTabs } from "@/features/category/browse/ui/category-main-tabs"
import { CategorySubTabs } from "@/features/category/browse/ui/category-sub-tabs"
import { TicketFilterBar, ExpertFilterBar } from "@/features/category/browse/ui/category-filters"
import { CategoryContentList } from "@/features/category/browse/ui/category-content-list"

export function CategoryDetailContent({ categoryName }: { categoryName: string }) {
  const router = useRouter()
  const {
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
  } = useCategoryDetail(categoryName)

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

  return (
    <div className="bg-background flex min-h-dvh flex-col">
      {/* ── Sticky Header Group ── */}
      <div className="bg-background/80 sticky top-0 z-40 backdrop-blur-md md:top-14">
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
      </div>

      {/* ── Filter Bar ── */}
      <div className="border-border/50 bg-background border-b">
        <div className="scrollbar-none mx-auto flex max-w-3xl items-center gap-2 overflow-x-auto px-4 py-2.5 md:px-6 lg:max-w-5xl lg:px-8">
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
      <CategoryContentList
        mainTab={state.mainTab}
        tickets={tickets}
        experts={experts}
        isTicketLoading={ticketQuery.isLoading}
        isExpertLoading={expertQuery.isLoading}
        isFetchingNextPage={ticketQuery.isFetchingNextPage || expertQuery.isFetchingNextPage}
        loadMoreRef={loadMoreRef}
      />
    </div>
  )
}
