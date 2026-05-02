"use client"

import { useInfiniteQuery } from "@tanstack/react-query"

import { getMyChatRooms } from "@/entities/chat/api/chat.service"
import { chatQueryKeys } from "@/entities/chat/model/chat.query-keys"

const PAGE_SIZE = 20

/**
 * `GET /v1/api/chat/rooms` 의 cursor 기반 무한 쿼리 훅.
 * 비로그인 시 enabled=false 로 차단할 수 있다.
 */
export function useChatRoomsQuery(enabled = true) {
  return useInfiniteQuery({
    queryKey: chatQueryKeys.roomsList({ size: PAGE_SIZE }),
    queryFn: ({ pageParam }) =>
      getMyChatRooms({
        cursor: pageParam ?? undefined,
        size: PAGE_SIZE,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
    enabled,
  })
}
