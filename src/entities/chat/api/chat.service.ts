import { clientFetch } from "@/shared/api/http/client-fetch"
import { parseSchemaOrThrow } from "@/shared/api/http/parse-schema"

import {
  chatRoomDetailResponseSchema,
  chatRoomIdByTicketResponseSchema,
  chatRoomListResponseSchema,
  type ChatRoomDetail,
  type ChatRoomSummary,
} from "./chat.schema"

export type { ChatRoomDetail, ChatRoomSummary }

export type GetMyChatRoomsParams = {
  cursor?: string
  size?: number
}

export type ChatRoomListPage = {
  rooms: ChatRoomSummary[]
  nextCursor: string | null
  hasNext: boolean
}

/** GET /v1/api/chat/rooms — 내 채팅방 목록 (커서 기반) */
export async function getMyChatRooms(
  params?: GetMyChatRoomsParams,
): Promise<ChatRoomListPage> {
  const path = "/v1/api/chat/rooms"
  const method = "GET"
  const query: Record<string, string> = {}
  if (params?.cursor) query.cursor = params.cursor
  if (params?.size != null) query.size = String(params.size)

  const response = await clientFetch<unknown>({ path, method, query })
  const parsed = parseSchemaOrThrow(chatRoomListResponseSchema, response, {
    path,
    method,
    message: "Invalid chat rooms response payload",
  })

  return {
    rooms: parsed.data.rooms ?? [],
    nextCursor: parsed.data.nextCursor ?? null,
    hasNext: parsed.data.hasNext ?? false,
  }
}

/** GET /v1/api/chat/rooms/{roomId}/messages — 채팅방 진입 시 전체 데이터 */
export async function getChatRoomDetail(roomId: string): Promise<ChatRoomDetail> {
  const path = `/v1/api/chat/rooms/${encodeURIComponent(roomId)}/messages`
  const method = "GET"

  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(chatRoomDetailResponseSchema, response, {
    path,
    method,
    message: "Invalid chat room detail response payload",
  })

  return parsed.data
}

/** POST /v1/api/chat/rooms/{roomId}/read — 읽음 처리 */
export async function markRoomAsRead(roomId: string): Promise<void> {
  const path = `/v1/api/chat/rooms/${encodeURIComponent(roomId)}/read`
  const method = "POST"
  await clientFetch<unknown>({ path, method })
}

/** GET /v1/api/chat/rooms/by-ticket/{ticketId} — 의뢰별 채팅방 ID */
export async function getChatRoomIdByTicket(ticketId: number): Promise<string> {
  const path = `/v1/api/chat/rooms/by-ticket/${ticketId}`
  const method = "GET"

  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(chatRoomIdByTicketResponseSchema, response, {
    path,
    method,
    message: "Invalid chat room id by ticket response payload",
  })

  return parsed.data
}
