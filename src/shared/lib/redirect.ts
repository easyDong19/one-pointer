const LOGIN_PATH = "/login"

export function buildLoginRedirectPath(pathWithQuery: string): string {
  const safePath = normalizeCurrentPath(pathWithQuery)
  const next = encodeURIComponent(safePath)
  return `${LOGIN_PATH}?next=${next}`
}

export function resolveNextPath(nextPath: string | null | undefined, fallback = "/"): string {
  if (!nextPath) {
    return fallback
  }

  // 백슬래시 거부: WHATWG URL 파서는 `\` 를 `/` 로 정규화하므로
  // `/\evil.com` 이 `//evil.com`(protocol-relative 외부 origin)으로 새는 것을 차단.
  if (nextPath.includes("\\")) {
    return fallback
  }

  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return fallback
  }

  if (nextPath.startsWith(LOGIN_PATH)) {
    return fallback
  }

  return nextPath
}

function normalizeCurrentPath(pathWithQuery: string): string {
  if (!pathWithQuery || pathWithQuery === LOGIN_PATH) {
    return "/"
  }

  return pathWithQuery.startsWith("/") ? pathWithQuery : `/${pathWithQuery}`
}
