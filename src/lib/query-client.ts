import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query"
import { syncAuthStateFromError } from "@/src/stores/auth-store"

function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        syncAuthStateFromError(error)
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
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
