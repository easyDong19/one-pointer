"use client"

import { Fragment, useEffect, useRef } from "react"

import type {
  ChatMessage,
  TicketProgressInfo,
} from "@/entities/chat/api/chat.schema"
import { isSameCalendarDay } from "@/entities/chat/lib/format-bubble-time"
import { DateSeparator } from "@/entities/chat/ui/date-separator"
import { MessageBubble } from "@/entities/chat/ui/message-bubble"

import { TicketSummaryCard } from "./ticket-summary-card"

type Props = {
  messages: ReadonlyArray<ChatMessage>
  myUserId: number | null
  ticketProgress: TicketProgressInfo | null | undefined
  /** AGREEMENT 메시지 카드 클릭 핸들러 — chat-room-layout 이 wiring */
  onAgreementClick?: () => void
  /** DELIVERY 메시지 카드 클릭 핸들러 — chat-room-layout 이 wiring */
  onDeliveryClick?: () => void
}

const NEAR_BOTTOM_THRESHOLD = 200

/**
 * 메시지 목록.
 *
 * - 의뢰 요약 카드를 최상단에 1회 표시
 * - 날짜가 바뀌면 DateSeparator 삽입
 * - 자체 overflow 없음 — body window 스크롤 (LAYOUT.md §6.1)
 * - 자동 스크롤: 초기 로드 시 즉시 맨 아래로, 새 메시지 도착 시 사용자가 하단
 *   근처에 있을 때만 부드럽게 스크롤 (위쪽 메시지 읽는 중이면 yank 하지 않음)
 */
export function MessageList({
  messages,
  myUserId,
  ticketProgress,
  onAgreementClick,
  onDeliveryClick,
}: Props) {
  const initialScrollDoneRef = useRef(false)
  const lastCountRef = useRef(0)

  useEffect(() => {
    const count = messages.length
    if (count === 0) return

    const wasInitial = !initialScrollDoneRef.current
    const newArrived = count > lastCountRef.current
    lastCountRef.current = count

    if (wasInitial) {
      initialScrollDoneRef.current = true
      requestAnimationFrame(() => {
        window.scrollTo(0, document.body.scrollHeight)
      })
      return
    }

    if (!newArrived) return

    const isNearBottom =
      window.innerHeight + window.scrollY >=
      document.body.scrollHeight - NEAR_BOTTOM_THRESHOLD

    if (isNearBottom) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
      })
    }
  }, [messages.length])

  return (
    <div className="flex flex-1 flex-col px-4 py-3 md:px-6 lg:px-10">
      <TicketSummaryCard progress={ticketProgress} />

      <div className="flex flex-1 flex-col justify-end">
        {messages.map((msg, index) => {
          const prev = index > 0 ? messages[index - 1] : null
          const showDateSep =
            !prev || !isSameCalendarDay(msg.createdAt, prev.createdAt)
          return (
            <Fragment key={msg.id ?? `idx-${index}`}>
              {showDateSep && <DateSeparator date={msg.createdAt} />}
              <MessageBubble
                message={msg}
                myUserId={myUserId}
                onAgreementClick={onAgreementClick}
                onDeliveryClick={onDeliveryClick}
              />
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
