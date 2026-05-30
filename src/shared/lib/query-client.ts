import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query"
import { isApiError } from "@/shared/api/http/api-error"

/**
 * 캐시 에러 발생 시 호출할 부수 효과 핸들러.
 * 도메인 의존(예: auth 상태 동기화)은 shared 가 알지 못하도록 상위 계층(app)에서 주입한다.
 */
type CacheErrorHandler = (error: Error) => void

function logErrorInDev(error: Error) {
  if (process.env.NODE_ENV !== "development") return

  if (isApiError(error)) {
    console.error(
      `[API Error] ${error.method ?? "?"} ${error.path} → ${error.status}`,
      "\n  message:",
      error.message,
      "\n  details:",
      error.details,
    )
  } else {
    console.error("[Query Error]", error)
  }
}

function createQueryClient(onCacheError?: CacheErrorHandler) {
  const handleError = (error: Error) => {
    logErrorInDev(error)
    onCacheError?.(error)
  }

  return new QueryClient({
    queryCache: new QueryCache({ onError: handleError }),
    mutationCache: new MutationCache({ onError: handleError }),
  })
}

let browserQueryClient: QueryClient | null = null

export function getQueryClient(onCacheError?: CacheErrorHandler) {
  if (typeof window === "undefined") {
    return createQueryClient(onCacheError)
  }

  if (!browserQueryClient) {
    browserQueryClient = createQueryClient(onCacheError)
  }

  return browserQueryClient
}
