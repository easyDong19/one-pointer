"use client"

import { useChatRoomsQuery } from "./use-chat-rooms-query"

/**
 * 모든 채팅방의 unreadCount 합산.
 *
 * `useChatRoomsQuery` 와 동일 queryKey 라 사이드바·BottomNav 가 React Query
 * 캐시를 공유한다 (중복 fetch 없음). 비로그인 등으로 fetch 를 막아야 할 때
 * `enabled=false`.
 */
export function useTotalUnread(enabled: boolean): number {
  const { data } = useChatRoomsQuery(enabled)
  const rooms = data?.pages.flatMap((p) => p.rooms ?? []) ?? []
  return rooms.reduce((acc, r) => acc + (r.unreadCount ?? 0), 0)
}
