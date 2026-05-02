"use client"

import { useQuery } from "@tanstack/react-query"

import { getChatRoomDetail } from "@/entities/chat/api/chat.service"
import { chatQueryKeys } from "@/entities/chat/model/chat.query-keys"

/**
 * `GET /v1/api/chat/rooms/{roomId}/messages` —
 * 채팅방 진입 시 한 번에 받는 전체 데이터 (myRole, opponent, ticketProgress,
 * banner, messages).
 */
export function useChatRoomDetailQuery(roomId: string, enabled = true) {
  return useQuery({
    queryKey: chatQueryKeys.roomDetail(roomId),
    queryFn: () => getChatRoomDetail(roomId),
    enabled: enabled && roomId.length > 0,
  })
}
