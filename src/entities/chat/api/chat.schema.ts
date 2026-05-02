import { z } from "zod/v4"

import {
  disputeResolutionTypeSchema,
  disputeStatusSchema,
} from "@/entities/dispute/api/dispute.schema"
import {
  escrowRefundStatusSchema,
  escrowRefundZoneSchema,
} from "@/entities/payment/api/payment.schema"
import { reviewStatusSchema, senderTypeSchema } from "@/entities/review/api/review.schema"
import { ticketStatusSchema, ticketTypeSchema } from "@/entities/ticket/api/ticket.schema"

// ─── Enums (chat 자체) ───────────────────────────────────────────────────────

export const chatRoomStatusSchema = z.enum(["ACTIVE", "REPORTED"])

export const messageTypeSchema = z.enum([
  "TEXT",
  "IMAGE",
  "FILE",
  "SYSTEM",
  "AGREEMENT",
  "DELIVERY",
])

export const chatBannerTypeSchema = z.enum([
  "NONE",
  // Online 합의서
  "AGREEMENT_NEEDED",
  "AGREEMENT_REPROPOSE",
  "AGREEMENT_WAITING",
  // Online 결제
  "PAYMENT_PENDING",
  "PAYMENT_WAITING",
  // Online 작업물
  "DELIVERY_NEEDED",
  "DELIVERY_REVISION_NEEDED",
  "DELIVERY_SUBMITTED",
  // Online 마감 초과
  "DEADLINE_OVERDUE_CLIENT",
  "DEADLINE_OVERDUE_EXPERT",
  // Offline
  "OFFLINE_COMPLETE_NEEDED",
  "OFFLINE_WAITING_COMPLETE",
  // 공통
  "REVIEW_PENDING",
  "REFUND_IN_PROGRESS",
  "DISPUTE_IN_PROGRESS",
  "DISPUTE_RESOLVED",
])

export type ChatRoomStatus = z.infer<typeof chatRoomStatusSchema>
export type MessageType = z.infer<typeof messageTypeSchema>
export type ChatBannerType = z.infer<typeof chatBannerTypeSchema>

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

/** OpponentInfo — 상대방 정보 */
export const opponentInfoSchema = z.object({
  userId: z.number().int().nullish(),
  expertProfileId: z.number().int().nullish(),
  nickname: z.string().nullish(),
  profileImageUrl: z.string().nullish(),
  expertCategoryNames: z.array(z.string()).nullish(),
})

export type OpponentInfo = z.infer<typeof opponentInfoSchema>

/** StepInfo — TicketProgress 의 한 단계 */
export const stepInfoSchema = z.object({
  label: z.string().nullish(),
  status: ticketStatusSchema.nullish(),
  completed: z.boolean().nullish(),
  current: z.boolean().nullish(),
})

export type StepInfo = z.infer<typeof stepInfoSchema>

/** TicketProgressInfo — 채팅방 상단 프로그레스 스텝 */
export const ticketProgressInfoSchema = z.object({
  ticketId: z.number().int().nullish(),
  ticketType: ticketTypeSchema.nullish(),
  currentStatus: ticketStatusSchema.nullish(),
  steps: z.array(stepInfoSchema).nullish(),
})

export type TicketProgressInfo = z.infer<typeof ticketProgressInfoSchema>

/** ChatBannerResponse — 서버 드리븐 UI 의 핵심
 *  type 에 따라 나머지 필드가 선택적으로 채워진다. */
export const chatBannerResponseSchema = z.object({
  type: chatBannerTypeSchema.nullish(),

  // 합의서
  ticketId: z.number().int().nullish(),
  rejectedAgreementId: z.number().int().nullish(),

  // 결제
  agreementId: z.number().int().nullish(),
  amount: z.number().int().nullish(),

  // 작업물
  existingDeliveryId: z.number().int().nullish(),

  // 리뷰
  reviewId: z.number().int().nullish(),

  // 환불
  refundRequestId: z.number().int().nullish(),
  refundStatus: escrowRefundStatusSchema.nullish(),
  refundZone: escrowRefundZoneSchema.nullish(),
  expertRejectReason: z.string().nullish(),
  disputeId: z.number().int().nullish(),

  // 분쟁
  disputeStatus: disputeStatusSchema.nullish(),
  resolutionType: disputeResolutionTypeSchema.nullish(),
  totalAmount: z.number().int().nullish(),
  expertSettlementAmount: z.number().int().nullish(),

  // AppBar 환불 버튼 제어
  canRequestRefund: z.boolean().default(false),
  currentRefundZone: escrowRefundZoneSchema.nullish(),
})

export type ChatBannerResponse = z.infer<typeof chatBannerResponseSchema>

// ─── Message ─────────────────────────────────────────────────────────────────

/** ChatMessageResponse — 개별 메시지 */
export const chatMessageSchema = z.object({
  id: z.string().nullish(),
  roomId: z.string().nullish(),
  senderId: z.number().int().nullish(),
  messageType: messageTypeSchema.nullish(),
  content: z.string().nullish(),
  attachmentUrl: z.string().nullish(),
  isRead: z.boolean().nullish(),
  createdAt: z.string().nullish(),
})

export type ChatMessage = z.infer<typeof chatMessageSchema>

// ─── Room aggregates ─────────────────────────────────────────────────────────

/** ChatRoomMessagesResponse — 채팅방 진입 시 전체 데이터 */
export const chatRoomDetailSchema = z.object({
  myRole: senderTypeSchema.nullish(),
  reviewId: z.number().int().nullish(),
  reviewStatus: reviewStatusSchema.nullish(),
  opponent: opponentInfoSchema.nullish(),
  ticketProgress: ticketProgressInfoSchema.nullish(),
  banner: chatBannerResponseSchema.nullish(),
  messages: z.array(chatMessageSchema).nullish(),
})

export type ChatRoomDetail = z.infer<typeof chatRoomDetailSchema>

/** MyChatRoomResponse — 채팅방 목록 아이템 */
export const chatRoomSummarySchema = z.object({
  roomId: z.string().nullish(),
  ticketId: z.number().int().nullish(),
  opponentNickname: z.string().nullish(),
  opponentProfileImageUrl: z.string().nullish(),
  ticketTitle: z.string().nullish(),
  ticketType: ticketTypeSchema.nullish(),
  ticketStatus: ticketStatusSchema.nullish(),
  statusLabel: z.string().nullish(),
  lastMessageType: messageTypeSchema.nullish(),
  lastMessage: z.string().nullish(),
  lastMessageAt: z.string().nullish(),
  unreadCount: z.number().int().nullish(),
  reviewPending: z.boolean().nullish(),
})

export type ChatRoomSummary = z.infer<typeof chatRoomSummarySchema>

// ─── WebSocket DTOs ──────────────────────────────────────────────────────────

/** SendMessageRequest — STOMP /app/chat.send 페이로드 */
export const sendMessageRequestSchema = z.object({
  roomId: z.string(),
  messageType: messageTypeSchema,
  content: z.string(),
  attachmentUrl: z.string().nullish(),
})

export type SendMessageRequest = z.infer<typeof sendMessageRequestSchema>

/** TypingEvent — /topic/chat/{roomId}/typing 페이로드 */
export const typingEventSchema = z.object({
  userId: z.number().int(),
})

export type TypingEvent = z.infer<typeof typingEventSchema>

// ─── Response wrappers ───────────────────────────────────────────────────────

const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  })

/** GET /v1/api/chat/rooms — MyChatRoomListResponse */
export const chatRoomListResponseSchema = successResponseSchema(
  z.object({
    rooms: z.array(chatRoomSummarySchema).nullish(),
    nextCursor: z.string().nullish(),
    hasNext: z.boolean().nullish(),
  }),
)

/** GET /v1/api/chat/rooms/{roomId}/messages — ChatRoomMessagesResponse */
export const chatRoomDetailResponseSchema = successResponseSchema(chatRoomDetailSchema)

/** POST /v1/api/chat/rooms/{roomId}/read */
export const readMessagesResponseSchema = successResponseSchema(z.boolean())

/** GET /v1/api/chat/rooms/by-ticket/{ticketId} — string roomId */
export const chatRoomIdByTicketResponseSchema = successResponseSchema(z.string())
