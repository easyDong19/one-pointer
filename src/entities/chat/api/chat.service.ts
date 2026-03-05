import { clientFetch } from "@/shared/api/http/client-fetch"
import { parseSchemaOrThrow } from "@/shared/api/http/parse-schema"
import {
  chatRoomListResponseSchema,
  chatRoomDetailResponseSchema,
  type ChatRoomSummary,
  type ChatRoomDetail,
} from "./chat.schema"

export type { ChatRoomSummary, ChatRoomDetail }


export async function getChatRooms(params?: {
  cursor?: string
  size?: number
}): Promise<{ content: ChatRoomSummary[]; nextCursor: string | null; hasNext: boolean }> {
  const path = "/v1/api/chat/rooms"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method, query: params })
  const parsed = parseSchemaOrThrow(chatRoomListResponseSchema, response, {
    path,
    method,
    message: "Invalid chat rooms response payload",
  })
  return parsed.data
}

export async function getChatRoomMessages(
  roomId: number,
  params?: { cursor?: string; size?: number },
): Promise<ChatRoomDetail> {
  const path = `/v1/api/chat/rooms/${roomId}/messages`
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method, query: params })
  const parsed = parseSchemaOrThrow(chatRoomDetailResponseSchema, response, {
    path,
    method,
    message: "Invalid chat room messages response payload",
  })
  return parsed.data
}

export async function markMessagesAsRead(roomId: number): Promise<void> {
  const path = `/v1/api/chat/rooms/${roomId}/read`
  const method = "POST"
  await clientFetch<unknown>({ path, method })
}
