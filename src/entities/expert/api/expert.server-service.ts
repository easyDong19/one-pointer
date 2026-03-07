import { serverFetch } from "@/shared/api/http/server-fetch"
import { parseSchemaOrThrow } from "@/shared/api/http/parse-schema"
import {
  popularExpertListResponseSchema,
  type PopularExpertItem,
} from "./expert.schema"

export type { PopularExpertItem }

/**
 * 서버 컴포넌트 전용: 인기 전문가 목록 조회 (인증 불필요)
 * 응답: { success, message, data: PopularExpertItem[] } (페이지네이션 없음)
 */
export async function getPopularExpertsOnServer(): Promise<PopularExpertItem[]> {
  const path = "/v1/api/expert/popular"
  const method = "GET"
  const response = await serverFetch<unknown>({
    path,
    method,
    forwardCookies: false,
    skipAuthRefresh: true,
    revalidate: 300, // 5분 캐시
  })
  const parsed = parseSchemaOrThrow(popularExpertListResponseSchema, response, {
    path,
    method,
    message: "Invalid popular experts response payload",
  })
  return parsed.data
}
