import { unstable_noStore as noStore } from "next/cache"
import { cookies } from "next/headers"
import { env } from "@/shared/config/env"
import { ApiError } from "@/shared/api/http/api-error"
import {
  buildHeaders,
  buildRequestBody,
  buildUrl,
  parseResponse,
  resolvePath,
  shouldAttachJsonBody,
  toApiError,
  type FetchBaseOptions,
  type QueryParams,
} from "@/shared/api/http/core"
import { refreshAccessTokenOnServer } from "@/shared/api/http/refresh-token"

type ServerFetchOptions<TBody = unknown> = FetchBaseOptions<TBody> &
  Omit<RequestInit, "method" | "body" | "headers"> & {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
    query?: QueryParams
    revalidate?: number | false
    tags?: string[]
    noStore?: boolean
    forwardCookies?: boolean
    skipAuthRefresh?: boolean
  }

const REFRESH_ENDPOINT_PATH = "/v1/api/auth/refresh"

export async function serverFetch<TResponse, TBody = unknown>(
  options: ServerFetchOptions<TBody>,
): Promise<TResponse> {
  const method = options.method ?? (options.body == null ? "GET" : "POST")
  const path = resolvePath(options.path)
  const finalPath = options.query ? appendQuery(path, options.query) : path
  const url = buildUrl(options.baseUrl ?? env.BASE_URL, finalPath)

  const headers = buildHeaders(options.headers)

  const shouldSerializeAsJson = shouldAttachJsonBody(method, options.body)
  if (shouldSerializeAsJson && !headers.has("content-type")) {
    headers.set("content-type", "application/json")
  }

  if ((options.forwardCookies ?? true) && !headers.has("cookie")) {
    const cookieHeader = await getCookieHeader()
    if (cookieHeader) {
      headers.set("cookie", cookieHeader)
    }
  }

  const nextOptions: { revalidate?: number | false; tags?: string[] } = {}

  if (typeof options.revalidate !== "undefined") {
    nextOptions.revalidate = options.revalidate
  }

  if (options.tags && options.tags.length > 0) {
    nextOptions.tags = options.tags
  }

  if (options.noStore) {
    noStore()
  }

  const requestInit: RequestInit &
    Record<string, unknown> & { next?: { revalidate?: number | false; tags?: string[] } } = {
    ...options,
    method,
    headers,
    body: buildRequestBody(options.body),
  }

  delete requestInit.baseUrl
  delete requestInit.path
  delete requestInit.query
  delete requestInit.revalidate
  delete requestInit.tags
  delete requestInit.noStore
  delete requestInit.forwardCookies

  if (options.noStore && typeof requestInit.cache === "undefined") {
    requestInit.cache = "no-store"
  }

  if (Object.keys(nextOptions).length > 0) {
    requestInit.next = nextOptions
  }

  try {
    const response = await fetch(url, requestInit)

    if (
      response.status === 401 &&
      !options.skipAuthRefresh &&
      path !== REFRESH_ENDPOINT_PATH
    ) {
      const cookieHeader = await getCookieHeader()
      await refreshAccessTokenOnServer(cookieHeader, options.baseUrl ?? env.BASE_URL)

      // refresh 후 새 쿠키로 다시 포워딩
      const retryHeaders = buildHeaders(options.headers)
      const shouldJson = shouldAttachJsonBody(method, options.body)
      if (shouldJson && !retryHeaders.has("content-type")) {
        retryHeaders.set("content-type", "application/json")
      }
      const freshCookieHeader = await getCookieHeader()
      if (freshCookieHeader) {
        retryHeaders.set("cookie", freshCookieHeader)
      }

      const retryInit: RequestInit & Record<string, unknown> = {
        ...requestInit,
        headers: retryHeaders,
      }

      const retryResponse = await fetch(url, retryInit)
      return await parseResponse<TResponse>(retryResponse, finalPath, method)
    }

    return await parseResponse<TResponse>(response, finalPath, method)
  } catch (error) {
    throw toApiError(error, finalPath, method)
  }
}

function appendQuery(path: string, query: QueryParams): string {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value == null) {
      continue
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item != null) {
          params.append(key, String(item))
        }
      }
      continue
    }

    params.set(key, String(value))
  }

  const queryString = params.toString()
  return queryString ? `${path}?${queryString}` : path
}

async function getCookieHeader(): Promise<string> {
  try {
    const cookieStore = await cookies()
    return cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ")
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    return ""
  }
}
