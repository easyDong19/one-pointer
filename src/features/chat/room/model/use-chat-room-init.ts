"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useRef } from "react"

import {
  type ChatMessage,
  type ChatRoomDetail,
  type SendMessageRequest,
} from "@/entities/chat/api/chat.schema"
import { chatQueryKeys } from "@/entities/chat/model/chat.query-keys"
import { useAuthStore } from "@/entities/auth/model/auth-store"
import { useChatSocket } from "@/features/chat/realtime/model/use-chat-socket"
import { useTypingIndicator } from "@/features/chat/realtime/model/use-typing-indicator"

import { useChatRoomDetailQuery } from "./use-chat-room-detail-query"
import { useMarkRoomReadMutation } from "./use-mark-room-read-mutation"

export type UseChatRoomInitReturn = {
  detail: ChatRoomDetail | undefined
  isLoading: boolean
  isError: boolean
  isConnected: boolean
  myUserId: number | null
  send: (payload: SendMessageRequest) => void
  sendTyping: () => void
  /** 상대방이 타이핑 중일 때 그 userId, 아니면 null. 3초 자동 해제. */
  typingUserId: number | null
}

/**
 * 채팅방 진입 init 시퀀스 오케스트레이션.
 *
 *   1. auth store 에서 myUserId 로드
 *   2. GET detail (REST)
 *   3. detail 도착 후 WebSocket connect + topic subscribe (메시지 / 타이핑)
 *   4. detail 도착 후 markAsRead (방당 1회)
 *   5. (Phase 07) 새 메시지가 상대방으로부터 도착하면 markAsRead 재호출
 *      → sidebar unread 뱃지 즉시 갱신
 *
 * 수신된 새 메시지는 detail 캐시의 messages 배열에 push — 컴포넌트가 별도
 * 구독 없이 query data 만 보면 됨.
 *
 * 참고: docs/app/chat.md §4.1
 */
export function useChatRoomInit(roomId: string): UseChatRoomInitReturn {
  const myUserId = useAuthStore((s) => s.user?.id ?? null)
  const queryClient = useQueryClient()

  const detailQuery = useChatRoomDetailQuery(roomId)
  const markReadMutation = useMarkRoomReadMutation()

  // 방당 1회만 markAsRead — roomId 바뀌면 리셋
  const markedRoomIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (!detailQuery.isSuccess) return
    if (markedRoomIdRef.current === roomId) return
    markedRoomIdRef.current = roomId
    markReadMutation.mutate(roomId)
    // markReadMutation 은 stable instance — deps 에서 의도적으로 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailQuery.isSuccess, roomId])

  const { typingUserId, onTyping } = useTypingIndicator(myUserId)

  const handleMessage = useCallback(
    (message: ChatMessage) => {
      queryClient.setQueryData<ChatRoomDetail | undefined>(
        chatQueryKeys.roomDetail(roomId),
        (prev) => {
          if (!prev) return prev
          const messages = prev.messages ?? []
          return { ...prev, messages: [...messages, message] }
        },
      )

      // 상대방 메시지면 즉시 읽음 처리 (방에 머물러 있는 동안)
      if (message.senderId != null && message.senderId !== myUserId) {
        markReadMutation.mutate(roomId)
      }
      // markReadMutation 은 stable instance
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [queryClient, roomId, myUserId],
  )

  const { isConnected, send, sendTyping } = useChatSocket({
    roomId: detailQuery.isSuccess ? roomId : null,
    onMessage: handleMessage,
    onTyping,
    enabled: detailQuery.isSuccess,
  })

  return {
    detail: detailQuery.data,
    isLoading: detailQuery.isLoading,
    isError: detailQuery.isError,
    isConnected,
    myUserId,
    send,
    sendTyping,
    typingUserId,
  }
}
