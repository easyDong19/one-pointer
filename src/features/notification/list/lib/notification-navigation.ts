import type { Notification, NotificationType } from "@/entities/notification/api/notification.schema"
import { getChatRoomIdByTicket } from "@/entities/chat/api/chat.service"

const CHAT_ROOM_TYPES: ReadonlySet<NotificationType> = new Set([
  "TICKET_MATCHED_CLIENT",
  "TICKET_MATCHED_EXPERT",
  "TICKET_AUTO_COMPLETED",
  "DELIVERY_SUBMITTED",
  "DELIVERY_APPROVED",
  "REVISION_REQUESTED",
  "DELIVERY_RESUBMITTED",
  "DELIVERY_REJECTED_EXPERT",
  "DELIVERY_REJECTED_CLIENT",
  "DELIVERY_AUTO_APPROVED",
  "DELIVERY_APPROVE_REMINDER",
  "AGREEMENT_PROPOSED",
  "AGREEMENT_CONFIRMED",
  "AGREEMENT_REJECTED",
  "AGREEMENT_REPROPOSED",
  "ESCROW_PAYMENT_COMPLETED",
  "ESCROW_REFUND_REQUESTED_CLIENT",
  "ESCROW_REFUND_REQUESTED_EXPERT",
  "ESCROW_REFUND_COOLING_OFF",
  "ESCROW_REFUND_EXPERT_ACCEPTED",
  "ESCROW_REFUND_EXPERT_REJECTED",
  "ESCROW_REFUND_AUTO_APPROVED",
  "ESCROW_REFUND_COMPLETED",
  "DEADLINE_OVERDUE_CLIENT",
  "DEADLINE_OVERDUE_EXPERT",
  "DEADLINE_EXTENDED_CLIENT",
  "DEADLINE_EXTENDED_EXPERT",
  "CHAT_REMINDER",
  "CHAT_MESSAGE",
])

const TICKET_DETAIL_TYPES: ReadonlySet<NotificationType> = new Set([
  "NEW_TICKET",
  "TICKET_CANCELLED",
  "TICKET_EXPIRED",
  "DIRECT_REQUEST_RECEIVED",
  "DIRECT_REQUEST_REJECTED",
  "DIRECT_REQUEST_EXPIRED",
  // PROPOSAL_RECEIVED 는 targetType 이 PROPOSAL 이고 targetId 가 proposalId 라
  // /tickets 가 아닌 /proposals 로 보낸다 (아래 PROPOSAL 분기에서 처리).
])

const REVIEW_TYPES: ReadonlySet<NotificationType> = new Set([
  "REVIEW_PUBLISHED",
  "EXPERT_REPLY",
])

const DISPUTE_TYPES: ReadonlySet<NotificationType> = new Set([
  "DISPUTE_SUBMITTED_APPLICANT",
  "DISPUTE_SUBMITTED_RESPONDENT",
  "DISPUTE_REJECTED",
  "DISPUTE_UNDER_REVIEW",
  "DISPUTE_RESPONDENT_STATEMENT",
  "DISPUTE_RESOLVED",
  "DISPUTE_CLOSED",
  "DISPUTE_CANCELLED",
])

export function getNotificationHref(n: Notification): string | null {
  // 제안 알림: targetId 는 proposalId → 제안 상세 페이지로 이동
  if (n.targetType === "PROPOSAL") {
    return n.targetId ? `/proposals/${n.targetId}` : null
  }

  if (CHAT_ROOM_TYPES.has(n.type)) {
    if (n.roomId) return `/chat/${n.roomId}`
    return null
  }

  if (DISPUTE_TYPES.has(n.type)) {
    if (n.roomId) return `/chat/${n.roomId}`
    return null
  }

  if (TICKET_DETAIL_TYPES.has(n.type)) {
    return n.targetId ? `/tickets/${n.targetId}` : null
  }

  if (REVIEW_TYPES.has(n.type)) {
    return n.targetId ? `/reviews/${n.targetId}` : null
  }

  if (n.type === "ESCROW_SETTLED") return "/mypage"

  return null
}

export async function resolveNotificationHref(
  n: Notification,
): Promise<string | null> {
  if (CHAT_ROOM_TYPES.has(n.type) || DISPUTE_TYPES.has(n.type)) {
    if (n.roomId) return `/chat/${n.roomId}`
    if (n.targetId) {
      try {
        const roomId = await getChatRoomIdByTicket(n.targetId)
        return `/chat/${roomId}`
      } catch {
        return n.targetId ? `/tickets/${n.targetId}` : null
      }
    }
    return null
  }

  return getNotificationHref(n)
}
