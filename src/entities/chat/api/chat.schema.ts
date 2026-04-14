import { z } from "zod/v4"

// ─── Enums ───────────────────────────────────────────────────────────────────

export const ticketStatusSchema = z.enum([
  "DRAFT",
  "OPEN",
  "IN_REVIEW",
  "MATCHED",
  "PAYMENT_PENDING",
  "PAID",
  "IN_PROGRESS",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
])

export const messageTypeSchema = z.enum([
  "TEXT",
  "IMAGE",
  "FILE",
  "SYSTEM",
  "AGREEMENT",
  "DELIVERY",
])

export const senderTypeSchema = z.enum(["CLIENT", "EXPERT", "SYSTEM"])

export const participantRoleSchema = z.enum(["CLIENT", "EXPERT"])

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

export const chatParticipantSchema = z.object({
  id: z.number(),
  nickname: z.string(),
  profileImageUrl: z.string().url().nullable().optional(),
})

/** ChatMessage */
export const chatMessageSchema = z.object({
  messageId: z.number(),
  senderType: senderTypeSchema,
  senderNickname: z.string(),
  messageType: messageTypeSchema,
  content: z.string(),
  attachmentUrl: z.string().nullable(),
  attachmentName: z.string().nullable(),
  sentAt: z.string(),
  readAt: z.string().nullable(),
  // FE-only fields (not in Swagger but used in frontend)
  id: z.number().optional(),
  roomId: z.number().optional(),
  senderId: z.number().nullable().optional(),
  senderProfileImageUrl: z.string().url().nullable().optional(),
  fileUrl: z.string().nullable().optional(),
  fileName: z.string().nullable().optional(),
  fileSize: z.number().nullable().optional(),
  isRead: z.boolean().optional(),
})

/** AgreementResponse */
export const agreementResponseSchema = z
  .object({
    // placeholder – extend when Swagger publishes the full shape
  })
  .passthrough()
  .nullable()

/** ChatRoomSummary */
export const chatRoomSummarySchema = z.object({
  roomId: z.string(),
  participantNickname: z.string(),
  participantProfileImageUrl: z.string().nullable(),
  ticketTitle: z.string(),
  ticketId: z.number(),
  ticketStatus: ticketStatusSchema,
  lastMessageContent: z.string().nullable(),
  lastMessageAt: z.string(),
  unreadCount: z.number(),
  // FE-only fields (not in Swagger but used in frontend)
  id: z.number().optional(),
  participant: chatParticipantSchema.optional(),
  lastMessage: z.string().nullable().optional(),
  lastMessageType: messageTypeSchema.nullable().optional(),
})

/** DeliveryResponse (inline ref) */
import { deliverySchema } from "@/entities/delivery/api/delivery.schema"

/** ChatRoomMessagesResponse */
export const chatRoomDetailSchema = z.object({
  roomId: z.string(),
  participantId: z.number(),
  participantNickname: z.string(),
  participantProfileImageUrl: z.string().nullable(),
  participantRole: participantRoleSchema,
  ticketId: z.number(),
  ticketTitle: z.string(),
  ticketStatus: ticketStatusSchema,
  messages: z.array(chatMessageSchema),
  deliveryInfo: deliverySchema.nullable().optional(),
  agreementInfo: agreementResponseSchema.optional(),
  // FE-only fields
  id: z.number().optional(),
  participant: chatParticipantSchema.optional(),
})

export type ChatMessage = z.infer<typeof chatMessageSchema>
export type ChatRoomSummary = z.infer<typeof chatRoomSummarySchema>
export type ChatRoomDetail = z.infer<typeof chatRoomDetailSchema>

// ─── Response Schemas ─────────────────────────────────────────────────────────

const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  })

export const chatRoomListResponseSchema = successResponseSchema(
  z.object({
    content: z.array(chatRoomSummarySchema),
    nextCursor: z.string().nullable(),
    hasNext: z.boolean(),
  }),
)

export const chatRoomDetailResponseSchema = successResponseSchema(chatRoomDetailSchema)

export const readMessagesResponseSchema = successResponseSchema(z.null())
