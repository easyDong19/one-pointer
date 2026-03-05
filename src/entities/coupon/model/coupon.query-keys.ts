export const couponQueryKeys = {
  all: ["coupon"] as const,
  balance: ["coupon", "balance"] as const,
  directRequestBalance: ["coupon", "balance", "direct-request"] as const,
  purchases: (params?: { cursor?: string; size?: number }) =>
    ["coupon", "purchases", params] as const,
}
