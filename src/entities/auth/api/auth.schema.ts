import { z } from "zod/v4"

export const loginRequestSchema = z.object({
  email: z.string().email("유효한 이메일 형식이 아닙니다."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
})

export type LoginRequest = z.infer<typeof loginRequestSchema>

const authUserRoleSchema = z.enum(["USER", "ADMIN", "CLIENT", "EXPERT", "BOTH"])
const authUserStatusSchema = z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "DORMANT", "WITHDRAWN"])

export const authUserSchema = z.object({
  id: z.union([z.number(), z.string()]),
  email: z.string().email(),
  name: z.string(),
  nickname: z.string(),
  phone: z.string().optional(),
  profileImageUrl: z.string().url().nullable().optional(),
  role: authUserRoleSchema,
  status: authUserStatusSchema,
})

export type AuthUser = z.infer<typeof authUserSchema>

export const loginResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: authUserSchema,
  }),
})

export type LoginResponse = z.infer<typeof loginResponseSchema>

export const myProfileResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: authUserSchema,
})

export type MyProfileResponse = z.infer<typeof myProfileResponseSchema>
