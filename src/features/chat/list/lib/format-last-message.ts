import type { MessageType } from "@/entities/chat/api/chat.schema"

/**
 * 채팅방 목록 아이템의 마지막 메시지 미리보기 텍스트.
 * 메시지 타입에 따라 본문 대신 카드 라벨을 노출한다.
 */
export function formatLastMessagePreview(
  messageType: MessageType | null | undefined,
  message: string | null | undefined,
): string {
  if (!messageType) return message ?? ""

  switch (messageType) {
    case "TEXT":
    case "SYSTEM":
      return message ?? ""
    case "IMAGE":
      return "사진"
    case "FILE":
      return message ?? "파일"
    case "AGREEMENT":
      return "합의서"
    case "DELIVERY":
      return "작업물"
    default:
      return message ?? ""
  }
}
