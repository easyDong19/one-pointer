import { z } from "zod/v4"

// ─── Enums ───────────────────────────────────────────────────────────────────

export const couponTypeSchema = z.enum(["PURCHASED", "WELCOME", "EVENT"])
export const couponStatusSchema = z.enum([
  "AVAILABLE",
  "RESERVED",
  "CONSUMED",
  "RETURNED",
  "EXPIRED",
  "REFUNDED",
])
export const couponPackageTypeSchema = z.enum([
  "TRIAL",
  "BASIC",
  "STANDARD",
  "PREMIUM",
  "CONTACT_SINGLE",
  "CONTACT_BASIC",
  "CONTACT_STANDARD",
  "CONTACT_PREMIUM",
])
export const couponPaymentMethodSchema = z.enum(["CARD", "KAKAO_PAY", "TOSS"])

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

export const couponSchema = z.object({
  id: z.number(),
  couponType: couponTypeSchema,
  status: couponStatusSchema,
  expiresAt: z.string().nullable().optional(),
  createdAt: z.string(),
})

export const couponPurchaseSchema = z.object({
  id: z.number(),
  packageType: couponPackageTypeSchema,
  quantity: z.number(),
  totalPrice: z.number(),
  paymentMethod: couponPaymentMethodSchema.optional(),
  purchasedAt: z.string(),
})

export const couponBalanceSchema = z.object({
  balance: z.number(),
  directRequestBalance: z.number().optional(),
})

export type Coupon = z.infer<typeof couponSchema>
export type CouponPurchase = z.infer<typeof couponPurchaseSchema>
export type CouponBalance = z.infer<typeof couponBalanceSchema>

// ─── Request Schemas ──────────────────────────────────────────────────────────

export const purchaseCouponRequestSchema = z.object({
  packageType: couponPackageTypeSchema,
  paymentMethod: couponPaymentMethodSchema,
  paymentKey: z.string().min(1),
})

export const claimCouponRequestSchema = z.object({
  couponType: couponTypeSchema,
  eventCode: z.string().optional(),
})

export type PurchaseCouponRequest = z.infer<typeof purchaseCouponRequestSchema>
export type ClaimCouponRequest = z.infer<typeof claimCouponRequestSchema>

// ─── Response Schemas ─────────────────────────────────────────────────────────

const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  })

export const couponPurchaseResponseSchema = successResponseSchema(couponPurchaseSchema)

export const couponPurchaseListResponseSchema = successResponseSchema(
  z.object({
    content: z.array(couponPurchaseSchema),
    nextCursor: z.string().nullable(),
    hasNext: z.boolean(),
  }),
)

export const couponBalanceResponseSchema = successResponseSchema(couponBalanceSchema)

export const directRequestCouponBalanceResponseSchema = successResponseSchema(
  z.object({ balance: z.number() }),
)
