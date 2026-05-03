import { z } from "zod/v4"

const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  })

export const imageUploadResponseSchema = successResponseSchema(
  z.string(),
)

export const imageBulkUploadResponseSchema = successResponseSchema(
  z.array(z.string()),
)

export const fileUploadResponseSchema = successResponseSchema(
  z.string(),
)

export const fileBulkUploadResponseSchema = successResponseSchema(
  z.array(z.string()),
)

export type ImageUploadResult = string
export type ImageBulkUploadResult = string[]
export type FileUploadResult = string
export type FileBulkUploadResult = string[]
