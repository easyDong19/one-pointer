import { clientFetch } from "@/shared/api/http/client-fetch"
import { parseSchemaOrThrow } from "@/shared/api/http/parse-schema"
import { categoryListResponseSchema, type Category } from "./category.schema"

export type { Category }


export async function getCategories(): Promise<Category[]> {
  const path = "/v1/api/category"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(categoryListResponseSchema, response, {
    path,
    method,
    message: "Invalid categories response payload",
  })
  return parsed.data
}
