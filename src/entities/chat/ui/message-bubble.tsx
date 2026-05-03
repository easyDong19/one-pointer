"use client"

import type { ChatMessage } from "@/entities/chat/api/chat.schema"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

import { formatBubbleTime } from "../lib/format-bubble-time"
import { AgreementBubble } from "./bubbles/agreement-bubble"
import { DeliveryBubble } from "./bubbles/delivery-bubble"
import { FileBubble } from "./bubbles/file-bubble"
import { ImageBubble } from "./bubbles/image-bubble"
import { SystemBubble } from "./bubbles/system-bubble"
import { TextBubble } from "./bubbles/text-bubble"

type Props = {
  message: ChatMessage
  myUserId: number | null
  /** AGREEMENT 카드 클릭 핸들러. 호출처 (chat-room-layout) 가 합의서 상세 진입 wiring. */
  onAgreementClick?: () => void
}

/**
 * messageType 에 따라 적절한 버블을 렌더링.
 * SYSTEM 은 중앙 정렬 단독 — 시간/읽음 라벨 없음.
 * 그 외는 좌/우 정렬 + 시간 + (내 메시지일 때) 읽음 라벨.
 */
export function MessageBubble({ message, myUserId, onAgreementClick }: Props) {
  const type = message.messageType
  const content = message.content ?? ""

  if (type === "SYSTEM") {
    return <SystemBubble content={content} />
  }

  const isMine = myUserId != null && message.senderId === myUserId
  const time = formatBubbleTime(message.createdAt)

  return (
    <div
      className={cn(
        "my-1 flex items-end gap-1.5",
        isMine ? "justify-end" : "justify-start",
      )}
    >
      {isMine && <Meta time={time} isRead={message.isRead ?? false} />}

      {renderBubble(
        type,
        content,
        message.attachmentUrl ?? "",
        isMine,
        onAgreementClick,
      )}

      {!isMine && <Meta time={time} />}
    </div>
  )
}

function renderBubble(
  type: ChatMessage["messageType"],
  content: string,
  attachmentUrl: string,
  isMine: boolean,
  onAgreementClick: (() => void) | undefined,
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
      return (
        <AgreementBubble
          content={content}
          isMine={isMine}
          onClick={onAgreementClick}
        />
      )
    case "DELIVERY":
      return <DeliveryBubble content={content} isMine={isMine} />
    case "TEXT":
    default:
      return <TextBubble content={content} isMine={isMine} />
  }
}

function Meta({ time, isRead }: { time: string; isRead?: boolean }) {
  if (!time) return null
  return (
    <div className="flex shrink-0 flex-col items-end gap-0.5 pb-0.5">
      {isRead && (
        <Text
          as="span"
          typography="caption2-medium"
          className="text-muted-foreground tabular-nums"
        >
          읽음
        </Text>
      )}
      <Text
        as="span"
        typography="caption2-medium"
        className="text-muted-foreground tabular-nums"
      >
        {time}
      </Text>
    </div>
  )
}
