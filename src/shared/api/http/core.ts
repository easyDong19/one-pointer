import { ApiError } from "@/shared/api/http/api-error"

export type QueryValue = string | number | boolean | null | undefined
export type QueryParams = Record<string, QueryValue | QueryValue[]>

type JsonRecord = Record<string, unknown>

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export type FetchBaseOptions<TBody = unknown> = {
  path: string
  method?: HttpMethod
  query?: QueryParams
  body?: TBody
  headers?: HeadersInit
  baseUrl?: string
}

const BODY_METHODS = new Set<HttpMethod>(["POST", "PUT", "PATCH", "DELETE"])

export function resolvePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`
}

export function withQuery(path: string, query?: QueryParams): string {
  if (!query) {
    return path
  }

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

export function buildUrl(baseUrl: string | undefined, pathWithQuery: string): string {
  if (!baseUrl) {
    return pathWithQuery
  }

  return new URL(pathWithQuery, normalizeBaseUrl(baseUrl)).toString()
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`
}

export function buildHeaders(headers?: HeadersInit): Headers {
  const finalHeaders = new Headers(headers)
  if (!finalHeaders.has("accept")) {
    finalHeaders.set("accept", "application/json")
  }
  return finalHeaders
}

export function shouldAttachJsonBody(method: HttpMethod, body: unknown): boolean {
  if (!BODY_METHODS.has(method) || body == null) {
    return false
  }

  return (
    !(body instanceof FormData) &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer) &&
    !ArrayBuffer.isView(body)
  )
}

export function buildRequestBody(body: unknown): BodyInit | undefined {
  if (body == null) {
    return undefined
  }

  if (
    typeof body === "string" ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body)
  ) {
    return body as BodyInit
  }

  return JSON.stringify(body)
}

export async function parseResponse<T>(
  response: Response,
  path: string,
  method: string,
): Promise<T> {
  const contentType = response.headers.get("content-type") ?? ""
  const isJson = contentType.includes("application/json")

  let parsedBody: unknown = null

  if (response.status !== 204) {
    if (isJson) {
      parsedBody = await response.json().catch(() => null)
    } else {
      const text = await response.text().catch(() => "")
      parsedBody = text.length > 0 ? text : null
    }
  }

  if (!response.ok) {
    throw new ApiError({
      status: response.status,
      path,
      method,
      message: extractMessage(parsedBody, response.statusText),
      details: parsedBody,
    })
  }

  return parsedBody as T
}

export function toApiError(error: unknown, path: string, method: string): ApiError {
  if (error instanceof ApiError) {
    return error
  }

  const message = error instanceof Error ? error.message : "Unexpected API error"
  return new ApiError({
    status: 0,
    path,
    method,
    message,
    details: error,
  })
}

function extractMessage(data: unknown, fallback: string): string {
  if (typeof data === "string" && data.trim().length > 0) {
    return data
  }

  if (isJsonRecord(data)) {
    for (const key of ["message", "error", "detail"]) {
      const value = data[key]
      if (typeof value === "string" && value.trim().length > 0) {
        return value
      }
    }
  }

  return fallback || "Request failed"
}

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null
}
