import { z } from "zod/v4"

// ─── Enums ───────────────────────────────────────────────────────────────────

export const messageTypeSchema = z.enum([
  "TEXT",
  "IMAGE",
  "FILE",
  "SYSTEM",
  "AGREEMENT",
  "DELIVERY",
])

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

export const chatParticipantSchema = z.object({
  id: z.number(),
  nickname: z.string(),
  profileImageUrl: z.string().url().nullable().optional(),
})

export const chatMessageSchema = z.object({
  id: z.number(),
  roomId: z.number(),
  senderId: z.number().nullable().optional(),
  senderNickname: z.string().nullable().optional(),
  senderProfileImageUrl: z.string().url().nullable().optional(),
  content: z.string().nullable().optional(),
  messageType: messageTypeSchema,
  fileUrl: z.string().nullable().optional(),
  fileName: z.string().nullable().optional(),
  fileSize: z.number().nullable().optional(),
  sentAt: z.string(),
  isRead: z.boolean().optional(),
})

export const chatRoomSummarySchema = z.object({
  id: z.number(),
  ticketId: z.number(),
  ticketTitle: z.string().optional(),
  participant: chatParticipantSchema,
  lastMessage: z.string().nullable().optional(),
  lastMessageType: messageTypeSchema.nullable().optional(),
  lastMessageAt: z.string().nullable().optional(),
  unreadCount: z.number().optional(),
})

export const chatRoomDetailSchema = z.object({
  id: z.number(),
  ticketId: z.number(),
  ticketTitle: z.string().optional(),
  participant: chatParticipantSchema,
  messages: z.object({
    content: z.array(chatMessageSchema),
    nextCursor: z.string().nullable(),
    hasNext: z.boolean(),
  }),
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
