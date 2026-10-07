import { http, HttpResponse } from "msw"
import { myProfileResponseSchema } from "@/entities/auth/api/auth.schema"
import { refreshTokenResponseSchema } from "@/shared/api/http/refresh-token.schema"
import { apiPath, mock, mockOk } from "../lib/respond"
import { isGuest } from "../lib/session"
import { ME } from "../world"

const meUser = {
  id: ME.userId,
  email: ME.email,
  name: ME.name,
  nickname: ME.nickname,
  profileImageUrl: ME.profileImageUrl,
  role: "BOTH" as const,
  status: "ACTIVE" as const,
}

const unauthorized = () =>
  HttpResponse.json(
    { success: false, message: "로그인이 필요합니다.", data: null },
    { status: 401 },
  )

export const authHandlers = [
  http.get(apiPath("/v1/api/user/me"), ({ cookies }) =>
    isGuest(cookies) ? unauthorized() : undefined,
  ),
  mock("get", "/v1/api/user/me", myProfileResponseSchema, () => meUser),

  http.post(apiPath("/v1/api/auth/refresh"), ({ cookies }) =>
    isGuest(cookies) ? unauthorized() : undefined,
  ),
  mock("post", "/v1/api/auth/refresh", refreshTokenResponseSchema, () => meUser),

  mockOk("post", "/v1/api/auth/logout"),
]
