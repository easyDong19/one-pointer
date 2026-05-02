"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { markRoomAsRead } from "@/entities/chat/api/chat.service"

/**
 * `POST /v1/api/chat/rooms/{roomId}/read` — 방 입장 시 1회 호출.
 *
 * 성공 후 채팅방 목록 쿼리들을 invalidate 해서 sidebar 의 unread 뱃지 갱신.
 * 방 detail 자체는 invalidate 하지 않는다 — 방금 받은 데이터를 또 받을 이유 없음.
 */
export function useMarkRoomReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roomId: string) => markRoomAsRead(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "rooms", "list"] })
    },
  })
}
