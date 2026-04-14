import { clientFetch } from "@/shared/api/http/client-fetch"
import { parseSchemaOrThrow } from "@/shared/api/http/parse-schema"
import { bannerListResponseSchema, type Banner } from "./banner.schema"

export type { Banner }


export async function getBanners(): Promise<Banner[]> {
  const path = "/v1/api/banner?platform=APP"
  const method = "GET"
  const response = await clientFetch<unknown>({ path, method })
  const parsed = parseSchemaOrThrow(bannerListResponseSchema, response, {
    path,
    method,
    message: "Invalid banner list response payload",
  })
  return parsed.data
}
