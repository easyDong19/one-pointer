"use client"

import { useMemo, useState } from "react"

import { ChatEmptyState } from "@/features/chat/list/ui/chat-empty-state"
import { ChatRoomFilterTabs } from "@/features/chat/list/ui/chat-room-filter-tabs"
import { ChatRoomList } from "@/features/chat/list/ui/chat-room-list"
import { ChatSearchBar } from "@/features/chat/list/ui/chat-search-bar"
import { useChatRoomsQuery } from "@/features/chat/list/model/use-chat-rooms-query"
import { useFilteredRooms } from "@/features/chat/list/model/use-filtered-rooms"
import type { ChatFilterTab } from "@/features/chat/list/lib/chat-filter"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

/**
 * 채팅방 목록 본체.
 *
 * 모바일: `chat/layout.tsx` 의 aside 가 viewport 전체를 차지 — 페이지 자체로 보임.
 * 데스크탑: 340px sidebar 안에서 컴팩트 모드로 작동.
 *
 * 같은 컴포넌트가 두 컨텍스트 모두 처리. 차이는 Tailwind responsive 유틸로만.
 */
export function ChatRoomsSidebar() {
  const [tab, setTab] = useState<ChatFilterTab>("ALL")
  const [keyword, setKeyword] = useState("")

  const query = useChatRoomsQuery()
  const allRooms = useMemo(
    () => query.data?.pages.flatMap((p) => p.rooms) ?? [],
    [query.data],
  )

  const { rooms, inProgressCount, totalUnread } = useFilteredRooms(
    allRooms,
    tab,
    keyword,
  )

  return (
    <div className="md:flex md:h-full md:flex-col">
      <header
        className={cn(
          "bg-background sticky top-0 z-30 border-b border-border px-4 pt-4 pb-2",
          "md:bg-sidebar md:border-sidebar-border md:static md:shrink-0 md:px-3 md:pt-3",
        )}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <Text
            as="h1"
            typography="title-bold"
            className="text-foreground md:text-sidebar-foreground"
          >
            채팅
          </Text>
          {totalUnread > 0 && (
            <span className="bg-primary text-primary-foreground inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums">
              {totalUnread > 99 ? "99+" : totalUnread}
            </span>
          )}
        </div>
        <ChatSearchBar value={keyword} onChange={setKeyword} className="mb-2" />
        <ChatRoomFilterTabs
          active={tab}
          onChange={setTab}
          inProgressCount={inProgressCount}
        />
      </header>

      <section className="md:scrollbar-none md:flex-1 md:overflow-y-auto md:overscroll-contain">
        {query.isLoading ? (
          <ListSkeleton />
        ) : query.isError ? (
          <ErrorState onRetry={() => query.refetch()} />
        ) : allRooms.length === 0 ? (
          <ChatEmptyState variant="no-rooms" />
        ) : rooms.length === 0 ? (
          <ChatEmptyState variant="no-results" />
        ) : (
          <ChatRoomList
            rooms={rooms}
            hasNextPage={Boolean(query.hasNextPage)}
            isFetchingNextPage={query.isFetchingNextPage}
            fetchNextPage={query.fetchNextPage}
          />
        )}
      </section>
    </div>
  )
}

function ListSkeleton() {
  return (
    <ul className="divide-border divide-y">
      {Array.from({ length: 6 }).map((_, index) => (
        <li
          key={index}
          className="flex items-center gap-3 px-4 py-3 md:gap-2.5 md:px-3 md:py-2.5"
        >
          <div className="bg-muted h-12 w-12 shrink-0 animate-pulse rounded-full md:h-10 md:w-10" />
          <div className="flex-1 space-y-2">
            <div className="bg-muted h-3 w-1/3 animate-pulse rounded" />
            <div className="bg-muted h-3 w-2/3 animate-pulse rounded" />
          </div>
        </li>
      ))}
    </ul>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <Text typography="body1-bold" className="text-foreground mb-1">
        채팅방을 불러오지 못했어요
      </Text>
      <Text typography="caption1-medium" className="text-muted-foreground mb-4">
        잠시 후 다시 시도해주세요.
      </Text>
      <button
        type="button"
        onClick={onRetry}
        className="border-border text-foreground hover:bg-muted/40 rounded-lg border px-4 py-2 text-sm transition-colors"
      >
        다시 불러오기
      </button>
    </div>
  )
}
