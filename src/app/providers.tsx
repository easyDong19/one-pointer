"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { buildLoginRedirectPath } from "@/shared/lib/redirect"
import { getQueryClient } from "@/shared/lib/query-client"
import { useAuthStore } from "@/entities/auth/model/auth-store"

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const router = useRouter()
  const queryClient = useMemo(() => getQueryClient(), [])

  useEffect(() => {
    void useAuthStore.getState().bootstrap()
  }, [])

  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe((state, prevState) => {
      const status = state.status

      if (status !== "unauthenticated") {
        return
      }

      if (prevState.status === "unauthenticated") {
        return
      }

      if (typeof window === "undefined") {
        return
      }

      const currentPathname = window.location.pathname
      if (!currentPathname || currentPathname.startsWith("/login")) {
        return
      }

      const query = window.location.search
      const currentPath = query ? `${currentPathname}${query}` : currentPathname

      router.replace(buildLoginRedirectPath(currentPath))
    })

    return unsubscribe
  }, [router])

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
