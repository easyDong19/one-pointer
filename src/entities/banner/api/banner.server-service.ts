import { serverFetch } from "@/shared/api/http/server-fetch"
import { parseSchemaOrThrow } from "@/shared/api/http/parse-schema"
import { bannerListResponseSchema, type Banner } from "./banner.schema"

export type { Banner }

/**
 * 서버 컴포넌트 전용: 웹 홈 배너 조회 (인증 불필요)
 *
 * docs/detail/home-banner.md §5 참조.
 */
export async function getHomeBannersOnServer(): Promise<Banner[]> {
  const path = "/v1/api/banner?platform=WEB"
  const method = "GET"
  const response = await serverFetch<unknown>({
    path,
    method,
    forwardCookies: false,
    skipAuthRefresh: true,
    revalidate: 600,
  })
  const parsed = parseSchemaOrThrow(bannerListResponseSchema, response, {
    path,
    method,
    message: "Invalid home banner list response payload",
  })
  return parsed.data
}
