import { z } from "zod/v4"

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

/** BannerResponse */
export const bannerSchema = z.object({
  id: z.number(),
  imageUrl: z.string(),
  linkUrl: z.string().nullable(),
  sortOrder: z.number().nullable(),
})

export type Banner = z.infer<typeof bannerSchema>

// ─── Response Schemas ─────────────────────────────────────────────────────────

const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  })

export const bannerListResponseSchema = successResponseSchema(z.array(bannerSchema))
