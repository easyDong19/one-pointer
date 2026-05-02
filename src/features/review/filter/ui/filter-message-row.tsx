"use client"

import { Eye, EyeOff, Loader2 } from "lucide-react"

import type { FilteringMessage } from "@/entities/review/api/review.schema"
import { AgreementBubble } from "@/entities/chat/ui/bubbles/agreement-bubble"
import { DeliveryBubble } from "@/entities/chat/ui/bubbles/delivery-bubble"
import { FileBubble } from "@/entities/chat/ui/bubbles/file-bubble"
import { ImageBubble } from "@/entities/chat/ui/bubbles/image-bubble"
import { SystemBubble } from "@/entities/chat/ui/bubbles/system-bubble"
import { TextBubble } from "@/entities/chat/ui/bubbles/text-bubble"
import { formatBubbleTime } from "@/entities/chat/lib/format-bubble-time"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

type Props = {
  message: FilteringMessage
  onToggleVisibility: () => void
  isToggling: boolean
}

/**
 * 필터링 페이지의 단일 메시지 row.
 *
 * - own=true 메시지는 우측 (본인) / own=false 는 좌측 (상대방)
 * - canToggle=true & own=true 메시지에만 토글 버튼 노출
 * - visibility !== PUBLIC 인 메시지는 dimmed + 잠금 안내
 *
 * 토글 동작:
 *   PUBLIC → 클릭 → reason 다이얼로그 → mutation
 *   HIDDEN_BY_SENDER → (이 MVP 에선 toggle 불가, 비공개 유지) — 향후 unhide API 분기되면 추가
 */
export function FilterMessageRow({ message, onToggleVisibility, isToggling }: Props) {
  const type = message.messageType ?? "TEXT"
  const content = message.content ?? ""
  const isOwn = message.own === true
  const isHidden = message.visibility !== "PUBLIC" && message.visibility != null
  const showToggle = isOwn && message.canToggle === true && !isHidden
  const time = formatBubbleTime(message.sentAt)

  if (type === "SYSTEM") {
    return (
      <div className={cn(isHidden && "opacity-50")}>
        <SystemBubble content={content} />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "my-1 flex items-end gap-1.5",
        isOwn ? "justify-end" : "justify-start",
        isHidden && "opacity-50",
      )}
    >
      {isOwn && (
        <>
          <ToggleArea
            visible={showToggle}
            isHidden={isHidden}
            isToggling={isToggling}
            onToggle={onToggleVisibility}
          />
          <Meta time={time} hidden={isHidden} />
        </>
      )}

      {renderBubble(type, content, message.attachmentUrl ?? "", isOwn)}

      {!isOwn && <Meta time={time} hidden={isHidden} />}
    </div>
  )
}

function renderBubble(
  type: NonNullable<FilteringMessage["messageType"]>,
  content: string,
  attachmentUrl: string,
  isMine: boolean,
) {
  switch (type) {
    case "IMAGE":
      return attachmentUrl ? (
        <ImageBubble url={attachmentUrl} isMine={isMine} />
      ) : (
        <TextBubble content="(이미지 없음)" isMine={isMine} />
      )
    case "FILE":
      return attachmentUrl ? (
        <FileBubble url={attachmentUrl} fileName={content} isMine={isMine} />
      ) : (
        <TextBubble content="(파일 없음)" isMine={isMine} />
      )
    case "AGREEMENT":
      return <AgreementBubble content={content} isMine={isMine} />
    case "DELIVERY":
      return <DeliveryBubble content={content} isMine={isMine} />
    case "TEXT":
    default:
      return <TextBubble content={content} isMine={isMine} />
  }
}

function ToggleArea({
  visible,
  isHidden,
  isToggling,
  onToggle,
}: {
  visible: boolean
  isHidden: boolean
  isToggling: boolean
  onToggle: () => void
}) {
  if (!visible) {
    if (isHidden) {
      return (
        <span
          aria-label="비공개 메시지"
          className="text-muted-foreground inline-flex h-7 w-7 items-center justify-center"
        >
          <EyeOff className="h-4 w-4" />
        </span>
      )
    }
    return null
  }
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isToggling}
      aria-label="메시지 비공개로 전환"
      className="text-muted-foreground hover:bg-muted/40 hover:text-foreground inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors disabled:opacity-50"
    >
      {isToggling ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Eye className="h-4 w-4" />
      )}
    </button>
  )
}

function Meta({ time, hidden }: { time: string; hidden: boolean }) {
  if (!time) return null
  return (
    <Text
      as="span"
      typography="caption2-medium"
      className={cn(
        "shrink-0 pb-0.5 tabular-nums",
        hidden ? "text-muted-foreground/60" : "text-muted-foreground",
      )}
    >
      {time}
    </Text>
  )
}
