import type { ZodType } from "zod/v4"
import { ApiError } from "./api-error"

export function parseSchemaOrThrow<T>(
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
