import { clientFetch } from "@/shared/api/http/client-fetch"
import {
  authUserSchema,
  loginRequestSchema,
  loginResponseSchema,
  myProfileResponseSchema,
  type AuthUser,
  type LoginRequest,
  type LoginResponse,
  type MyProfileResponse,
} from "@/entities/auth/api/auth.schema"

export type { AuthUser, LoginRequest, LoginResponse, MyProfileResponse }

export async function login(input: LoginRequest): Promise<LoginResponse> {
  const payload = loginRequestSchema.parse(input)

  const response = await clientFetch<unknown, LoginRequest>({
    path: "/v1/api/auth/login",
    method: "POST",
    body: payload,
  })

  return loginResponseSchema.parse(response)
}

export async function getMyProfile(): Promise<AuthUser> {
  const response = await clientFetch<unknown>({
    path: "/v1/api/user/me",
    method: "GET",
  })

  const parsed = myProfileResponseSchema.parse(response)
  return authUserSchema.parse(parsed.data)
}
