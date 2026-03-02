import { ApiError } from "@/shared/api/http/api-error"
import { buildUrl, parseResponse } from "@/shared/api/http/core"
import {
  refreshTokenResponseSchema,
  type RefreshTokenResponse,
} from "@/shared/api/http/refresh-token.schema"

export async function refreshAccessToken(baseUrl?: string): Promise<RefreshTokenResponse> {
  const path = "/v1/api/auth/refresh"
  const method = "POST"
  const url = buildUrl(baseUrl, path)

  const response = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      accept: "application/json",
    },
  })

  const data = await parseResponse<unknown>(response, path, method)
  const parsed = refreshTokenResponseSchema.safeParse(data)

  if (parsed.success) {
    return parsed.data
  }

  throw new ApiError({
    status: 500,
    path,
    method,
    message: "Invalid refresh-token response payload",
    details: parsed.error.flatten(),
  })
}
