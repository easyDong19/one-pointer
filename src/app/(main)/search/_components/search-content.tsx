"use client"

import { useCallback, useRef } from "react"
import { Inbox, Search } from "lucide-react"
import { Text } from "@/shared/ui/text"
import { PageShell } from "@/shared/ui/page-shell"
import { TicketList } from "@/features/category/browse/ui/ticket-list-item"
import { useTicketSearchQuery } from "@/features/ticket/search/model/use-ticket-search-query"
import { openRegionPicker } from "@/features/region/select/lib/open-region-picker"
import { useSearchFilterState } from "./use-search-filter-state"
import { SearchFilterBar } from "./search-filter-bar"

/**
 * /search 페이지 본체.
 *
 * - URL searchParams 를 source of truth 로 필터 state 를 관리.
 * - keyword 가 비어 있으면 안내 placeholder 를 보여주고 API 호출을 차단.
 * - `useTicketSearchQuery` + IntersectionObserver 로 무한스크롤.
 */
export function SearchContent() {
  const [state, actions] = useSearchFilterState()

  const query = useTicketSearchQuery({
    keyword: state.keyword,
    region: state.region,
    ticketType: state.ticketType,
    sortBy: state.sortBy,
    majorCategoryId: state.majorCategoryId,
    subCategoryId: state.subCategoryId,
  })

  const tickets = query.data?.pages.flatMap((p) => p.content) ?? []
  const totalLoaded = tickets.length

  // ── Infinite scroll sentinel ──

  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect()
      if (!node) return

      observerRef.current = new IntersectionObserver((entries) => {
        if (
          entries[0]?.isIntersecting &&
          query.hasNextPage &&
          !query.isFetchingNextPage
        ) {
          query.fetchNextPage()
        }
      })
      observerRef.current.observe(node)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- query 객체 전체 대신 프리미티브 사용
    [query.hasNextPage, query.isFetchingNextPage],
  )

  // ── Region picker ──

  const handleRegionClick = async () => {
    const result = await openRegionPicker(state.region)
    if (result !== null) actions.setRegion(result)
  }

  const hasKeyword = state.keyword.trim().length > 0

  return (
    <PageShell tier="list">
      <PageShell.Content spacing="none">
        {/* 검색어 표시 바: tier 내 풀-블리드 bg */}
        <div className="border-border/50 -mx-4 border-b md:-mx-6 lg:-mx-8">
          <div className="flex items-center gap-2 px-4 py-3 md:px-6 lg:px-8">
            <Search className="text-muted-foreground h-4 w-4 shrink-0" />
            <Text as="h1" typography="body2-bold" className="text-foreground truncate">
              {hasKeyword ? `"${state.keyword}" 검색 결과` : "검색어를 입력하세요"}
            </Text>
            {hasKeyword && !query.isLoading && (
              <Text
                as="span"
                typography="caption1-medium"
                className="text-muted-foreground ml-auto shrink-0"
              >
                {totalLoaded}
                {query.hasNextPage ? "+" : ""}건
              </Text>
            )}
          </div>
        </div>

        <SearchFilterBar state={state} actions={actions} onRegionClick={handleRegionClick} />

        {!hasKeyword ? (
          <EmptyState
            message="검색어를 입력해주세요"
            sub="헤더의 검색창에 찾고 싶은 의뢰 키워드를 입력하세요"
          />
        ) : query.isError ? (
          <ErrorState onRetry={() => query.refetch()} />
        ) : (
          <>
            <TicketList tickets={tickets} isLoading={query.isLoading} />

            <div ref={loadMoreRef} className="h-px" />

            {query.isFetchingNextPage && (
              <div className="flex justify-center py-6">
                <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
              </div>
            )}

            {!query.isLoading && tickets.length === 0 && (
              <EmptyState
                message={`"${state.keyword}" 에 대한 검색 결과가 없습니다`}
                sub="다른 키워드나 필터를 시도해보세요"
              />
            )}
          </>
        )}
      </PageShell.Content>
    </PageShell>
  )
}

/* ─── Empty / Error ───────────────────────────────────────────────────────── */

function EmptyState({ message, sub }: { message: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
        <Inbox className="text-muted-foreground" size={32} />
      </div>
      <Text as="p" typography="body2-medium" className="text-foreground">
        {message}
      </Text>
      {sub && (
        <Text as="p" typography="caption1-medium" className="text-muted-foreground mt-1">
          {sub}
        </Text>
      )}
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
      <Text as="p" typography="body2-medium" className="text-foreground">
        검색 결과를 불러오지 못했습니다
      </Text>
      <button
        type="button"
        onClick={onRetry}
        className="bg-primary text-primary-foreground mt-4 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:opacity-90"
      >
        다시 시도
      </button>
    </div>
  )
}
