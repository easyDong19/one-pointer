import { z } from "zod/v4"

/** SubCategoryResponse */
export const subCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  iconUrl: z.string().optional(),
  availableType: z.string().optional(),
})

/** CategoryResponse */
export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  iconUrl: z.string(),
  subCategories: z.array(subCategorySchema),
})

export type SubCategory = z.infer<typeof subCategorySchema>
export type Category = z.infer<typeof categorySchema>

const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  })

export const categoryListResponseSchema = successResponseSchema(z.array(categorySchema))
