import { clientFetch } from "@/shared/api/http/client-fetch"
import { parseSchemaOrThrow } from "@/shared/api/http/parse-schema"
import {
  expertListResponseSchema,
  expertDetailResponseSchema,
  popularExpertListResponseSchema,
  type ExpertListItem,
  type ExpertDetail,
  type PopularExpertItem,
} from "./expert.schema"

export type { ExpertListItem, ExpertDetail, PopularExpertItem }


export async function getExperts(params?: {
  cursor?: string
  size?: number
  subCategoryId?: number
  activityMethod?: string
  region?: string
  query?: string
}): Promise<{ content: ExpertListItem[]; nextCursor: string | null; hasNext: boolean }> {
  const path = "/v1/api/expert"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method, query: params })
  const parsed = parseSchemaOrThrow(expertListResponseSchema, response, {
    path,
    method,
    message: "Invalid expert list response payload",
  })
  return parsed.data
}

export async function getExpertDetail(expertProfileId: number): Promise<ExpertDetail> {
  const path = `/v1/api/expert/${expertProfileId}`
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(expertDetailResponseSchema, response, {
    path,
    method,
    message: "Invalid expert detail response payload",
  })
  return parsed.data
}

export async function getPopularExperts(): Promise<PopularExpertItem[]> {
  const path = "/v1/api/expert/popular"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(popularExpertListResponseSchema, response, {
    path,
    method,
    message: "Invalid popular experts response payload",
  })
  return parsed.data
}
