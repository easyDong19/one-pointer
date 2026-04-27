import {
  buildHeaders,
  buildRequestBody,
  buildUrl,
  parseResponse,
  resolvePath,
  shouldAttachJsonBody,
  toApiError,
  withQuery,
  type FetchBaseOptions,
  type QueryParams,
} from "@/shared/api/http/core"
import { refreshAccessToken } from "@/shared/api/http/refresh-token"
import type { RefreshTokenResponse } from "@/shared/api/http/refresh-token.schema"

type ClientFetchOptions<TBody = unknown> = FetchBaseOptions<TBody> &
  Omit<RequestInit, "method" | "body" | "headers" | "credentials"> & {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
    query?: QueryParams
    skipAuthRefresh?: boolean
  }

let refreshLock: Promise<void> | null = null
const REFRESH_ENDPOINT_PATH = "/v1/api/auth/refresh"

function shouldTryAuthRefresh(status: number): boolean {
  return status === 401
}

/**
 * refresh 성공 시 호출되는 콜백.
 * shared 레이어가 entities/auth · queryClient 를 직접 import 하지 않도록 의존성 역전.
 * `providers.tsx` 등 상위 레이어에서 `setOnRefreshSuccess()` 로 wire-up.
 *
 * 명세: docs/bug-fix/auth-refresh-stale-user.md
 */
type RefreshSuccessHandler = (data: RefreshTokenResponse["data"]) => void
let onRefreshSuccess: RefreshSuccessHandler | null = null

export function setOnRefreshSuccess(handler: RefreshSuccessHandler | null): void {
  onRefreshSuccess = handler
}

export async function clientFetch<TResponse, TBody = unknown>(
  options: ClientFetchOptions<TBody>,
): Promise<TResponse> {
  const method = options.method ?? (options.body == null ? "GET" : "POST")
  const path = resolvePath(options.path)
  const finalPath = withQuery(path, options.query)
  const baseUrl = options.baseUrl ?? process.env.NEXT_PUBLIC_BASE_URL
  const url = buildUrl(baseUrl, finalPath)

  const requestInit = buildClientRequestInit(options, method)

  try {
    const response = await fetch(url, requestInit)

    if (
      shouldTryAuthRefresh(response.status) &&
      !options.skipAuthRefresh &&
      path !== REFRESH_ENDPOINT_PATH
    ) {
      await refreshWithLock(baseUrl)

      const retryResponse = await fetch(url, requestInit)
      return await parseResponse<TResponse>(retryResponse, finalPath, method)
    }

    return await parseResponse<TResponse>(response, finalPath, method)
  } catch (error) {
    throw toApiError(error, finalPath, method)
  }
}

function buildClientRequestInit(
  options: ClientFetchOptions<unknown>,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
): RequestInit {
  const headers = buildHeaders(options.headers)

  const shouldSerializeAsJson = shouldAttachJsonBody(method, options.body)
  if (shouldSerializeAsJson && !headers.has("content-type")) {
    headers.set("content-type", "application/json")
  }

  const requestInit: RequestInit & Record<string, unknown> = {
    ...options,
    method,
    headers,
    body: buildRequestBody(options.body),
    credentials: "include",
  }

  delete requestInit.baseUrl
  delete requestInit.path
  delete requestInit.query
  delete requestInit.skipAuthRefresh

  return requestInit
}

async function refreshWithLock(baseUrl?: string): Promise<void> {
  if (!refreshLock) {
    refreshLock = refreshAccessToken(baseUrl)
      .then((res) => {
        // refresh 응답의 user 정보를 상위 레이어로 전달 → store 동기화 + 쿼리 invalidate
        // 이전: `.then(() => undefined)` 로 응답을 버려 auth store 가 stale 해지는 버그
        try {
          onRefreshSuccess?.(res.data)
        } catch (callbackError) {
          // 콜백 내부 에러가 fetch 흐름을 막지 않도록 격리
          console.error("[clientFetch] onRefreshSuccess handler threw:", callbackError)
        }
      })
      .finally(() => {
        refreshLock = null
      })
  }

  await refreshLock
}
