"use client"

import type { SnapshotMessage } from "@/entities/review/api/review.schema"
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
  message: SnapshotMessage
}

/**
 * 리뷰 스냅샷의 단일 메시지 버블.
 *
 * 채팅의 MessageBubble 과 같은 leaf bubble 들을 사용하되, 정렬 기준이 다름:
 *   - EXPERT 메시지 → 우측 (primary-light, 강조)
 *   - CLIENT 메시지 → 좌측 (muted)
 *   - SYSTEM      → 중앙 단독
 *
 * 평가 대상인 전문가의 응답에 시각 강조를 주는 컨벤션 (다른 리뷰 플랫폼들과 동일).
 *
 * `visibility !== PUBLIC` 메시지의 placeholder 처리는 호출자(`ReviewSnapshotList`)가
 * 책임 — 이 컴포넌트는 무조건 렌더한다.
 */
export function SnapshotMessageBubble({ message }: Props) {
  const type = message.messageType
  const content = message.content ?? ""

  if (type === "SYSTEM") {
    return <SystemBubble content={content} />
  }

  const isExpert = message.senderType === "EXPERT"
  const time = formatBubbleTime(message.sentAt)

  return (
    <div
      className={cn(
        "my-1 flex items-end gap-1.5",
        isExpert ? "justify-end" : "justify-start",
      )}
    >
      {isExpert && <Meta time={time} />}
      {renderBubble(type, content, message.attachmentUrl ?? "", isExpert)}
      {!isExpert && <Meta time={time} />}
    </div>
  )
}

function renderBubble(
  type: SnapshotMessage["messageType"],
  content: string,
  attachmentUrl: string,
  isHighlighted: boolean,
) {
  switch (type) {
    case "IMAGE":
      return attachmentUrl ? (
        <ImageBubble url={attachmentUrl} isMine={isHighlighted} />
      ) : (
        <TextBubble content="(이미지 없음)" isMine={isHighlighted} />
      )
    case "FILE":
      return attachmentUrl ? (
        <FileBubble url={attachmentUrl} fileName={content} isMine={isHighlighted} />
      ) : (
        <TextBubble content="(파일 없음)" isMine={isHighlighted} />
      )
    case "AGREEMENT":
      return <AgreementBubble content={content} isMine={isHighlighted} />
    case "DELIVERY":
      return <DeliveryBubble content={content} isMine={isHighlighted} />
    case "TEXT":
    default:
      return <TextBubble content={content} isMine={isHighlighted} />
  }
}

function Meta({ time }: { time: string }) {
  if (!time) return null
  return (
    <Text
      as="span"
      typography="caption2-medium"
      className="text-muted-foreground shrink-0 pb-0.5 tabular-nums"
    >
      {time}
    </Text>
  )
}
