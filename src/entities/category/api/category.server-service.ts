import { serverFetch } from "@/shared/api/http/server-fetch"
import { parseSchemaOrThrow } from "@/shared/api/http/parse-schema"
import { categoryListResponseSchema, type Category } from "./category.schema"

export type { Category }

/**
 * 서버 컴포넌트 전용: 전체 카테고리 조회 (인증 불필요)
 */
export async function getCategoriesOnServer(): Promise<Category[]> {
  const path = "/v1/api/category"
  const method = "GET"
  const response = await serverFetch<unknown>({
    path,
    method,
    forwardCookies: false,
    skipAuthRefresh: true,
    revalidate: 3600, // 카테고리는 자주 바뀌지 않으므로 1시간 캐시
  })
  const parsed = parseSchemaOrThrow(categoryListResponseSchema, response, {
    path,
    method,
    message: "Invalid categories response payload",
  })
  return parsed.data
}
