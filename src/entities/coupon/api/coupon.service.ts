import { clientFetch } from "@/shared/api/http/client-fetch"
import { parseSchemaOrThrow } from "@/shared/api/http/parse-schema"
import {
  purchaseCouponRequestSchema,
  claimCouponRequestSchema,
  couponPurchaseResponseSchema,
  couponPurchaseListResponseSchema,
  couponBalanceResponseSchema,
  directRequestCouponBalanceResponseSchema,
  type PurchaseCouponRequest,
  type ClaimCouponRequest,
  type CouponPurchase,
  type CouponBalance,
} from "./coupon.schema"

export type { PurchaseCouponRequest, ClaimCouponRequest, CouponPurchase, CouponBalance }


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
