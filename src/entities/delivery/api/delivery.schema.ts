import { z } from "zod/v4"

// ─── Enums ───────────────────────────────────────────────────────────────────

export const deliveryTypeSchema = z.enum(["SERVICE_COMPLETE", "FILE_DELIVERY"])
export const deliveryStatusSchema = z.enum(["SUBMITTED", "APPROVED", "REVISION_REQUESTED", "REJECTED"])
export const fileTypeSchema = z.enum(["IMAGE", "VIDEO", "FILE"])

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

/** AttachmentResponse */
export const attachmentSchema = z.object({
  id: z.number(),
  fileType: fileTypeSchema,
  fileUrl: z.string(),
  originalFileName: z.string(),
  fileSize: z.number(),
})

/** DeliveryResponse */
export const deliverySchema = z.object({
  id: z.number(),
  ticketId: z.number(),
  expertId: z.number(),
  deliveryType: deliveryTypeSchema,
  memo: z.string(),
  status: deliveryStatusSchema,
  revisionCount: z.number(),
  revisionMessage: z.string().nullable(),
  submittedAt: z.string(),
  approvedAt: z.string().nullable(),
  attachments: z.array(attachmentSchema),
  maxRevisions: z.number(),
  remainingRevisions: z.number(),
  workDeadline: z.string(),
  // FE-only fields
  updatedAt: z.string().optional(),
})

export type Attachment = z.infer<typeof attachmentSchema>
export type Delivery = z.infer<typeof deliverySchema>

// ─── Request Schemas ──────────────────────────────────────────────────────────

const attachmentRequestSchema = z.object({
  fileType: fileTypeSchema,
  fileUrl: z.string(),
  originalFileName: z.string(),
  fileSize: z.number(),
})

export const submitDeliveryRequestSchema = z.object({
  ticketId: z.number(),
  deliveryType: deliveryTypeSchema,
  memo: z.string().optional(),
  attachments: z.array(attachmentRequestSchema).optional(),
})

export const requestRevisionRequestSchema = z.object({
  revisionMessage: z.string().min(1),
})

export const resubmitDeliveryRequestSchema = z.object({
  memo: z.string().optional(),
  attachments: z.array(attachmentRequestSchema).optional(),
})

export const rejectDeliveryRequestSchema = z.object({
  rejectionReason: z.string().min(1),
})

export type SubmitDeliveryRequest = z.infer<typeof submitDeliveryRequestSchema>
export type RequestRevisionRequest = z.infer<typeof requestRevisionRequestSchema>
export type ResubmitDeliveryRequest = z.infer<typeof resubmitDeliveryRequestSchema>
export type RejectDeliveryRequest = z.infer<typeof rejectDeliveryRequestSchema>

// ─── Response Schemas ─────────────────────────────────────────────────────────

const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  })

export const deliveryResponseSchema = successResponseSchema(deliverySchema)
