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

type ClientFetchOptions<TBody = unknown> = FetchBaseOptions<TBody> &
  Omit<RequestInit, "method" | "body" | "headers" | "credentials"> & {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
    query?: QueryParams
    skipAuthRefresh?: boolean
  }

let refreshLock: Promise<void> | null = null

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

    if (response.status === 401 && !options.skipAuthRefresh && finalPath !== "/auth/refresh") {
      const refreshed = await refreshWithLock(baseUrl)
      if (refreshed) {
        const retryResponse = await fetch(url, requestInit)
        return await parseResponse<TResponse>(retryResponse, finalPath, method)
      }
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

async function refreshWithLock(baseUrl?: string): Promise<boolean> {
  if (!refreshLock) {
    refreshLock = refreshAccessToken(baseUrl).finally(() => {
      refreshLock = null
    })
  }

  try {
    await refreshLock
    return true
  } catch {
    return false
  }
}

async function refreshAccessToken(baseUrl?: string): Promise<void> {
  const path = "/auth/refresh"
  const url = buildUrl(baseUrl, path)

  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      accept: "application/json",
    },
  })

  await parseResponse<unknown>(response, path, "POST")
}
