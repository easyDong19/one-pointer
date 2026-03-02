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

type ClientFetchOptions<TBody = unknown> = FetchBaseOptions<TBody> &
  Omit<RequestInit, "method" | "body" | "headers" | "credentials"> & {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
    query?: QueryParams
    skipAuthRefresh?: boolean
  }

let refreshLock: Promise<void> | null = null
const REFRESH_ENDPOINT_PATH = "/v1/api/auth/refresh"

function shouldTryAuthRefresh(status: number): boolean {
  return status === 401 || status === 403
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
    refreshLock = refreshAccessToken(baseUrl).then(() => undefined).finally(() => {
      refreshLock = null
    })
  }

  await refreshLock
}
