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
