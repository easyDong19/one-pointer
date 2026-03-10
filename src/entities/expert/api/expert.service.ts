import { clientFetch } from "@/shared/api/http/client-fetch"
import { parseSchemaOrThrow } from "@/shared/api/http/parse-schema"
import {
  expertListResponseSchema,
  expertDetailResponseSchema,
  popularExpertListResponseSchema,
  type ExpertSummary,
  type ExpertListItem,
  type ExpertDetail,
  type PopularExpertItem,
  type ExpertListParams,
} from "./expert.schema"

export type { ExpertSummary, ExpertListItem, ExpertDetail, PopularExpertItem, ExpertListParams }


export async function getExperts(
  params?: ExpertListParams,
): Promise<{ content: ExpertSummary[]; nextCursor: string | null; hasNext: boolean }> {
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

export async function getPopularExperts(): Promise<ExpertSummary[]> {
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

export async function getPopularExpertsBySubCategory(subCategoryId: number): Promise<ExpertSummary[]> {
  const path = `/v1/api/expert/popular/subcategory/${subCategoryId}`
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(popularExpertListResponseSchema, response, {
    path,
    method,
    message: "Invalid popular experts by subcategory response payload",
  })
  return parsed.data
}
