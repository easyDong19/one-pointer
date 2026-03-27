import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query"
import { syncAuthStateFromError } from "@/entities/auth/model/auth-store"
import { isApiError } from "@/shared/api/http/api-error"

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

function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        logErrorInDev(error)
        syncAuthStateFromError(error)
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        logErrorInDev(error)
        syncAuthStateFromError(error)
      },
    }),
  })
}

let browserQueryClient: QueryClient | null = null

export function getQueryClient() {
  if (typeof window === "undefined") {
    return createQueryClient()
  }

  if (!browserQueryClient) {
    browserQueryClient = createQueryClient()
  }

  return browserQueryClient
}
