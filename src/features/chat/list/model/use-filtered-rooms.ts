"use client"

import { useMemo } from "react"

import type { ChatRoomSummary } from "@/entities/chat/api/chat.schema"
import {
  countByTab,
  matchesKeyword,
  matchesTab,
  type ChatFilterTab,
} from "../lib/chat-filter"

export type FilteredRoomsResult = {
  rooms: ChatRoomSummary[]
  inProgressCount: number
  totalUnread: number
}

/**
 * 채팅방 목록을 탭/키워드 기준으로 클라이언트사이드 필터링.
 * 서버 검색이 아니다 — 이미 받은 페이지들 안에서만 필터.
 */
export function useFilteredRooms(
  allRooms: ReadonlyArray<ChatRoomSummary>,
  tab: ChatFilterTab,
  keyword: string,
): FilteredRoomsResult {
  return useMemo(() => {
    const filtered = allRooms.filter(
      (room) => matchesTab(tab, room) && matchesKeyword(keyword, room),
    )
    return {
      rooms: filtered,
      inProgressCount: countByTab("IN_PROGRESS", allRooms),
      totalUnread: allRooms.reduce((acc, r) => acc + (r.unreadCount ?? 0), 0),
    }
  }, [allRooms, tab, keyword])
}
