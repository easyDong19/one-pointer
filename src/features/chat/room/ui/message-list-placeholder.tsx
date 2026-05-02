"use client"

import { MessagesSquare } from "lucide-react"

import type { ChatMessage } from "@/entities/chat/api/chat.schema"
import { Text } from "@/shared/ui/text"

type Props = {
  messages: ReadonlyArray<ChatMessage> | null | undefined
}

/**
 * Phase 05 placeholder.
 *
 * Phase 06 에서 진짜 메시지 렌더 (타입별 버블 / 날짜 구분선 / 자동 스크롤 /
 * 의뢰 요약 카드) 로 교체된다. 지금은 메시지 개수만 표시.
 */
export function MessageListPlaceholder({ messages }: Props) {
  const count = messages?.length ?? 0

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <MessagesSquare
        className="text-muted-foreground/30 mb-4 h-10 w-10"
        strokeWidth={1.5}
      />
      <Text typography="body2-bold" className="text-foreground mb-1">
        메시지 영역 (Phase 06)
      </Text>
      <Text
        typography="caption1-medium"
        className="text-muted-foreground tabular-nums"
      >
        현재 {count}개의 메시지
      </Text>
    </div>
  )
}
