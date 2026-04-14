import { clientFetch } from "@/shared/api/http/client-fetch"
import { parseSchemaOrThrow } from "@/shared/api/http/parse-schema"
import {
  purchaseCouponRequestSchema,
  claimCouponRequestSchema,
  inAppPurchaseRequestSchema,
  couponPurchaseResponseSchema,
  couponPurchaseListResponseSchema,
  couponBalanceResponseSchema,
  directRequestCouponBalanceResponseSchema,
  kakaoShareCouponResponseSchema,
  referralStatusResponseSchema,
  type PurchaseCouponRequest,
  type ClaimCouponRequest,
  type InAppPurchaseRequest,
  type CouponPurchase,
  type CouponBalance,
  type KakaoShareCoupon,
  type ReferralStatus,
} from "./coupon.schema"

export type { PurchaseCouponRequest, ClaimCouponRequest, InAppPurchaseRequest, CouponPurchase, CouponBalance, KakaoShareCoupon, ReferralStatus }


export async function purchaseCoupon(input: PurchaseCouponRequest): Promise<CouponPurchase> {
  const path = "/v1/api/coupon/purchase"
  const method = "POST"
  const payload = parseSchemaOrThrow(purchaseCouponRequestSchema, input, {
    path,
    method,
    message: "Invalid purchase coupon request payload",
  })
  const response = await clientFetch<unknown, PurchaseCouponRequest>({
    path,
    method,
    body: payload,
  })
  const parsed = parseSchemaOrThrow(couponPurchaseResponseSchema, response, {
    path,
    method,
    message: "Invalid purchase coupon response payload",
  })
  return parsed.data
}

export async function claimCoupon(input: ClaimCouponRequest): Promise<void> {
  const path = "/v1/api/coupon/claim"
  const method = "POST"
  const payload = parseSchemaOrThrow(claimCouponRequestSchema, input, {
    path,
    method,
    message: "Invalid claim coupon request payload",
  })
  await clientFetch<unknown, ClaimCouponRequest>({ path, method, body: payload })
}

export async function getCouponPurchases(params?: {
  cursor?: string
  size?: number
}): Promise<{ content: CouponPurchase[]; nextCursor: string | null; hasNext: boolean }> {
  const path = "/v1/api/coupon/purchases"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method, query: params })
  const parsed = parseSchemaOrThrow(couponPurchaseListResponseSchema, response, {
    path,
    method,
    message: "Invalid coupon purchases response payload",
  })
  return parsed.data
}

export async function getCouponBalance(): Promise<CouponBalance> {
  const path = "/v1/api/coupon/balance"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(couponBalanceResponseSchema, response, {
    path,
    method,
    message: "Invalid coupon balance response payload",
  })
  return parsed.data
}

export async function getDirectRequestCouponBalance(): Promise<{ balance: number }> {
  const path = "/v1/api/coupon/balance/direct-request"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(directRequestCouponBalanceResponseSchema, response, {
    path,
    method,
    message: "Invalid direct request coupon balance response payload",
  })
  return parsed.data
}

// ─── In-App Purchase ─────────────────────────────────────────────────────────

export async function purchaseCouponInApp(input: InAppPurchaseRequest): Promise<CouponPurchase> {
  const path = "/v1/api/coupon/purchase/in-app"
  const method = "POST"
  const payload = parseSchemaOrThrow(inAppPurchaseRequestSchema, input, {
    path,
    method,
    message: "Invalid in-app purchase request payload",
  })
  const response = await clientFetch<unknown, InAppPurchaseRequest>({
    path,
    method,
    body: payload,
  })
  const parsed = parseSchemaOrThrow(couponPurchaseResponseSchema, response, {
    path,
    method,
    message: "Invalid in-app purchase response payload",
  })
  return parsed.data
}

// ─── Kakao Share & Referral ──────────────────────────────────────────────────

export async function getKakaoShareCouponStatus(): Promise<KakaoShareCoupon> {
  const path = "/v1/api/coupon/share/kakao/status"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(kakaoShareCouponResponseSchema, response, {
    path,
    method,
    message: "Invalid kakao share coupon status response payload",
  })
  return parsed.data
}

export async function getReferralStatus(): Promise<ReferralStatus> {
  const path = "/v1/api/coupon/referral/status"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(referralStatusResponseSchema, response, {
    path,
    method,
    message: "Invalid referral status response payload",
  })
  return parsed.data
}
