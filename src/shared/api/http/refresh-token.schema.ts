import { z } from "zod/v4"

const refreshUserRoleSchema = z.enum(["USER", "ADMIN", "CLIENT", "EXPERT", "BOTH"])
const refreshUserStatusSchema = z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "DORMANT", "WITHDRAWN"])

export const refreshTokenResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.object({
    id: z.union([z.number(), z.string()]),
    email: z.string().email(),
    name: z.string(),
    nickname: z.string(),
    role: refreshUserRoleSchema,
    status: refreshUserStatusSchema,
  }),
})

export type RefreshTokenResponse = z.infer<typeof refreshTokenResponseSchema>
