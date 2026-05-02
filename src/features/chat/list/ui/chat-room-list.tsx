"use client"

import { usePathname } from "next/navigation"
import { useCallback, useRef } from "react"

import type { ChatRoomSummary } from "@/entities/chat/api/chat.schema"

import { ChatRoomItem } from "./chat-room-item"

type Props = {
  rooms: ReadonlyArray<ChatRoomSummary>
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
}

export function ChatRoomList({
  rooms,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: Props) {
  const pathname = usePathname()
  const activeRoomId = pathname.startsWith("/chat/") ? pathname.slice("/chat/".length) : null

  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect()
      if (!node) return
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      })
      observerRef.current.observe(node)
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  )

  return (
    <ul className="divide-border divide-y">
      {rooms.map((room) => (
        <li key={room.roomId ?? `${room.ticketId}-${room.lastMessageAt}`}>
          <ChatRoomItem room={room} isActive={room.roomId === activeRoomId} />
        </li>
      ))}
      {hasNextPage && (
        <li>
          <div ref={sentinelRef} className="h-12" aria-hidden />
          {isFetchingNextPage && (
            <div className="flex items-center justify-center py-4">
              <div className="border-primary size-5 animate-spin rounded-full border-2 border-t-transparent" />
            </div>
          )}
        </li>
      )}
    </ul>
  )
}
