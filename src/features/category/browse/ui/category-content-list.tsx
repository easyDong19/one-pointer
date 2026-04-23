import { Inbox } from "lucide-react"
import { Text } from "@/shared/ui/text"
import type { TicketFeedItem } from "@/entities/ticket/api/ticket.schema"
import type { ExpertSummary } from "@/entities/expert/api/expert.schema"
import type { MainTab } from "../model/use-category-filter-reducer"
import { TicketList } from "./ticket-list-item"
import { ExpertList } from "./expert-list-item"

export function CategoryContentList({
  mainTab,
  tickets,
  experts,
  isTicketLoading,
  isExpertLoading,
  isFetchingNextPage,
  loadMoreRef,
}: {
  mainTab: MainTab
  tickets: TicketFeedItem[]
  experts: ExpertSummary[]
  isTicketLoading: boolean
  isExpertLoading: boolean
  isFetchingNextPage: boolean
  loadMoreRef: (node: HTMLDivElement | null) => void
}) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 lg:max-w-5xl">
      {mainTab === "tickets" ? (
        <TicketList tickets={tickets} isLoading={isTicketLoading} />
      ) : (
        <ExpertList experts={experts} isLoading={isExpertLoading} />
      )}

      {/* Infinite scroll sentinel */}
      <div ref={loadMoreRef} className="h-px" />

      {/* Loading indicator */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
      )}

      {/* Empty state */}
      {mainTab === "tickets" && !isTicketLoading && tickets.length === 0 && (
        <EmptyState message="등록된 의뢰가 없습니다" />
      )}
      {mainTab === "experts" && !isExpertLoading && experts.length === 0 && (
        <EmptyState message="등록된 전문가가 없습니다" />
      )}
    </main>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
        <Inbox className="text-muted-foreground" size={32} />
      </div>
      <Text as="p" typography="body2-medium" className="text-muted-foreground">
        {message}
      </Text>
    </div>
  )
}
