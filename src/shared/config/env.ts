import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

const DEFAULT_BASE_URL = "http://localhost:3000"
const baseUrl = normalizeBaseUrl(process.env.BASE_URL)

export const env = createEnv({
  server: {
    BASE_URL: z.url().default(DEFAULT_BASE_URL),
  },
  client: {
    NEXT_PUBLIC_BASE_URL: z.url().optional(),
    // 결제(PortOne) — 공개값이지만 누락 시 빈 storeId 로 조용히 깨지지 않도록 필수 검증.
    NEXT_PUBLIC_PORTONE_STORE_ID: z.string().min(1),
    NEXT_PUBLIC_PORTONE_CHANNEL_KEY: z.string().min(1),
    NEXT_PUBLIC_PAYMENT_REDIRECT_URL: z.url(),
    // WS: 미지정 시 NEXT_PUBLIC_BASE_URL 에서 파생되므로 optional.
    NEXT_PUBLIC_WS_URL: z.url().optional(),
  },
  runtimeEnv: {
    BASE_URL: baseUrl,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_PORTONE_STORE_ID: process.env.NEXT_PUBLIC_PORTONE_STORE_ID,
    NEXT_PUBLIC_PORTONE_CHANNEL_KEY: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY,
    NEXT_PUBLIC_PAYMENT_REDIRECT_URL: process.env.NEXT_PUBLIC_PAYMENT_REDIRECT_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },
  emptyStringAsUndefined: true,
})

function normalizeBaseUrl(value: string | undefined): string {
  const candidate = value?.trim()

  if (!candidate) {
    return DEFAULT_BASE_URL
  }

  try {
    return new URL(candidate).toString()
  } catch {
    return DEFAULT_BASE_URL
  }
}
