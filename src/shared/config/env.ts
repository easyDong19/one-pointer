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
  },
  runtimeEnv: {
    BASE_URL: baseUrl,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
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
