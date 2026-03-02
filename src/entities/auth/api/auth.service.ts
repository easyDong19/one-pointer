import { clientFetch } from "@/shared/api/http/client-fetch"
import { ApiError } from "@/shared/api/http/api-error"
import {
  loginRequestSchema,
  loginResponseSchema,
  logoutResponseSchema,
  myProfileResponseSchema,
  type AuthUser,
  type LoginRequest,
  type LoginResponse,
  type LogoutResponse,
  type MyProfileResponse,
} from "@/entities/auth/api/auth.schema"
import type { ZodType } from "zod/v4"

export type { AuthUser, LoginRequest, LoginResponse, LogoutResponse, MyProfileResponse }

export async function login(input: LoginRequest): Promise<LoginResponse> {
  const path = "/v1/api/auth/login"
  const method = "POST"
  const payload = parseSchemaOrThrow(loginRequestSchema, input, {
    path,
    method,
    message: "Invalid login request payload",
  })

  const response = await clientFetch<unknown, LoginRequest>({
    path,
    method,
    body: payload,
  })

  return parseSchemaOrThrow(loginResponseSchema, response, {
    path,
    method,
    message: "Invalid login response payload",
  })
}

export async function getMyProfile(): Promise<AuthUser> {
  const path = "/v1/api/user/me"
  const method = "GET"

  const response = await clientFetch<unknown>({
    path,
    method,
  })

  const parsed = parseSchemaOrThrow(myProfileResponseSchema, response, {
    path,
    method,
    message: "Invalid my-profile response payload",
  })

  return parsed.data
}

export async function logout(): Promise<LogoutResponse> {
  const path = "/v1/api/auth/logout"
  const method = "POST"

  const response = await clientFetch<unknown>({
    path,
    method,
    skipAuthRefresh: true,
  })

  return parseSchemaOrThrow(logoutResponseSchema, response, {
    path,
    method,
    message: "Invalid logout response payload",
  })
}

function parseSchemaOrThrow<T>(
  schema: ZodType<T>,
  data: unknown,
  context: { path: string; method: string; message: string },
): T {
  const parsed = schema.safeParse(data)

  if (parsed.success) {
    return parsed.data
  }

  throw new ApiError({
    status: 500,
    path: context.path,
    method: context.method,
    message: context.message,
    details: parsed.error.flatten(),
  })
}
