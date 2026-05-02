import type { GetMyChatRoomsParams } from "@/entities/chat/api/chat.service"

export const chatQueryKeys = {
  all: ["chat"] as const,

  /** /v1/api/chat/rooms 무한 스크롤 키 (params 단위로 분리) */
  roomsList: (params?: GetMyChatRoomsParams) =>
    ["chat", "rooms", "list", params ?? {}] as const,

  /** /v1/api/chat/rooms/{roomId}/messages */
  roomDetail: (roomId: string) => ["chat", "rooms", roomId, "messages"] as const,

  /** /v1/api/chat/rooms/by-ticket/{ticketId} */
  roomIdByTicket: (ticketId: number) =>
    ["chat", "rooms", "by-ticket", ticketId] as const,
}
