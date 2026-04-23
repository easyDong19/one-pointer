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
export const couponPaymentMethodSchema = z.enum([
  "CARD",
  "KAKAO_PAY",
  "TOSS",
  "APPLE_IAP",
  "GOOGLE_IAP",
])
export const couponPurchaseStatusSchema = z.enum(["PAID", "REFUNDED", "PARTIAL_REFUNDED", "FAILED"])

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

export const couponSchema = z.object({
  id: z.number(),
  couponType: couponTypeSchema,
  status: couponStatusSchema,
  expiresAt: z.string().nullable().optional(),
  createdAt: z.string(),
})

/** CouponPurchaseResponse */
export const couponPurchaseSchema = z.object({
  id: z.number(),
  packageType: couponPackageTypeSchema,
  quantity: z.number(),
  totalPrice: z.number(),
  paymentMethod: couponPaymentMethodSchema,
  status: couponPurchaseStatusSchema,
  createdAt: z.string(),
})

/** CouponBalanceResponse */
export const couponBalanceSchema = z.object({
  totalCount: z.number(),
  packageBreakdown: z.record(z.string(), z.number()),
})

/** CouponClaimResponse */
export const couponClaimSchema = z.object({
  totalCount: z.number(),
  ticketCouponCount: z.number(),
  directRequestCouponCount: z.number(),
})

/** KakaoShareCouponResponse */
export const kakaoShareCouponSchema = z.object({
  totalSharedCount: z.number(),
  chatRoomAlreadyShared: z.boolean().nullable(),
})

/** ReferralStatusResponse */
export const referralStatusSchema = z.object({
  referralCode: z.string(),
  referredUserCount: z.number(),
  totalReward: z.number(),
})

export type Coupon = z.infer<typeof couponSchema>
export type CouponPurchase = z.infer<typeof couponPurchaseSchema>
export type CouponBalance = z.infer<typeof couponBalanceSchema>
export type CouponClaim = z.infer<typeof couponClaimSchema>
export type KakaoShareCoupon = z.infer<typeof kakaoShareCouponSchema>
export type ReferralStatus = z.infer<typeof referralStatusSchema>

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

export const inAppPurchaseRequestSchema = z.object({
  inAppType: z.string(),
  transactionId: z.string(),
  packageType: couponPackageTypeSchema,
  receiptData: z.string().optional(),
})

export type PurchaseCouponRequest = z.infer<typeof purchaseCouponRequestSchema>
export type ClaimCouponRequest = z.infer<typeof claimCouponRequestSchema>
export type InAppPurchaseRequest = z.infer<typeof inAppPurchaseRequestSchema>

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

export const couponClaimResponseSchema = successResponseSchema(couponClaimSchema)

export const kakaoShareCouponResponseSchema = successResponseSchema(kakaoShareCouponSchema)

export const referralStatusResponseSchema = successResponseSchema(referralStatusSchema)

export const directRequestCouponBalanceResponseSchema = successResponseSchema(
  z.object({ balance: z.number() }),
)
