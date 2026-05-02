import type { z } from "zod/v4"

import type { ChatRoomSummary } from "@/entities/chat/api/chat.schema"
import type { ticketStatusSchema } from "@/entities/ticket/api/ticket.schema"

type TicketStatus = z.infer<typeof ticketStatusSchema>

export type ChatFilterTab = "ALL" | "IN_PROGRESS" | "DONE"

const IN_PROGRESS_STATUSES: ReadonlySet<TicketStatus> = new Set([
  "MATCHED",
  "PAYMENT_PENDING",
  "PAID",
  "IN_PROGRESS",
  "DELIVERED",
  "IN_REVIEW",
])

const DONE_STATUSES: ReadonlySet<TicketStatus> = new Set([
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
])

export const CHAT_TABS: ReadonlyArray<{ key: ChatFilterTab; label: string }> = [
  { key: "ALL", label: "전체" },
  { key: "IN_PROGRESS", label: "진행중" },
  { key: "DONE", label: "완료" },
]

export function matchesTab(tab: ChatFilterTab, room: ChatRoomSummary): boolean {
  if (tab === "ALL") return true
  if (!room.ticketStatus) return false
  if (tab === "IN_PROGRESS") return IN_PROGRESS_STATUSES.has(room.ticketStatus)
  return DONE_STATUSES.has(room.ticketStatus)
}

export function matchesKeyword(keyword: string, room: ChatRoomSummary): boolean {
  const trimmed = keyword.trim().toLowerCase()
  if (!trimmed) return true
  const haystack = [room.opponentNickname, room.ticketTitle, room.lastMessage]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase()
  return haystack.includes(trimmed)
}

export function countByTab(tab: ChatFilterTab, rooms: ReadonlyArray<ChatRoomSummary>): number {
  return rooms.reduce((acc, room) => acc + (matchesTab(tab, room) ? 1 : 0), 0)
}
