import { clientFetch } from "@/shared/api/http/client-fetch"
import {
  authUserSchema,
  loginRequestSchema,
  loginResponseSchema,
  type AuthUser,
  type LoginRequest,
  type LoginResponse,
} from "@/entities/auth/api/auth.schema"

export type { AuthUser, LoginRequest, LoginResponse }

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
    path: "/auth/me",
    method: "GET",
  })

  return authUserSchema.parse(response)
}
