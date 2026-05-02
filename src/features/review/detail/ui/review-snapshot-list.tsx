"use client"

import { Fragment } from "react"

import type { SnapshotMessage } from "@/entities/review/api/review.schema"
import { isSameCalendarDay } from "@/entities/chat/lib/format-bubble-time"
import { DateSeparator } from "@/entities/chat/ui/date-separator"
import { SnapshotMessageBubble } from "@/entities/chat/ui/snapshot-message-bubble"
import { Text } from "@/shared/ui/text"

import { PrivateMessagePlaceholder } from "./private-message-placeholder"

type Props = {
  messages: ReadonlyArray<SnapshotMessage>
}

/**
 * 리뷰 본문 — 채팅 스냅샷 메시지 목록.
 *
 * 채팅의 MessageList 와 같은 레이아웃 (날짜 구분선 + 버블) 이지만 다른 점:
 *   - 의뢰 요약 카드는 ReviewHeader 가 별도로 표시 → 여기서는 X
 *   - 자동 스크롤 X (정적 페이지)
 *   - visibility !== PUBLIC 메시지는 PrivateMessagePlaceholder
 *   - 정렬: SnapshotMessageBubble 이 senderType (EXPERT 우측 / CLIENT 좌측) 로 결정
 */
export function ReviewSnapshotList({ messages }: Props) {
  if (messages.length === 0) {
    return (
      <div className="bg-muted/30 rounded-xl py-12 text-center">
        <Text typography="caption1-medium" className="text-muted-foreground">
          공개된 메시지가 없습니다
        </Text>
      </div>
    )
  }

  return (
    <div className="flex flex-col py-2">
      {messages.map((msg, index) => {
        const prev = index > 0 ? messages[index - 1] : null
        const showDateSep = !prev || !isSameCalendarDay(msg.sentAt, prev.sentAt)
        return (
          <Fragment key={msg.messageId}>
            {showDateSep && <DateSeparator date={msg.sentAt} />}
            {msg.visibility === "PUBLIC" ? (
              <SnapshotMessageBubble message={msg} />
            ) : (
              <PrivateMessagePlaceholder />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
