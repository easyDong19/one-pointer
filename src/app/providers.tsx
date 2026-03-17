"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { OverlayProvider } from "overlay-kit"
import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { getQueryClient } from "@/shared/lib/query-client"
import { useAuthStore } from "@/entities/auth/model/auth-store"
import { buildLoginRedirectPath } from "@/shared/lib/redirect"

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [queryClient] = useState(() => getQueryClient())

  useEffect(() => {
    useAuthStore.getState().bootstrap().catch(console.error)
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <OverlayProvider>
        <AuthRedirectWatcher />
        {children}
      </OverlayProvider>
    </QueryClientProvider>
  )
}

function AuthRedirectWatcher() {
  const status = useAuthStore((s) => s.status)
  const pathname = usePathname()
  const router = useRouter()
  const prevStatusRef = useRef(status)

  useEffect(() => {
    const wasAuth = prevStatusRef.current === "authenticated"
    const isUnauth = status === "unauthenticated"
    prevStatusRef.current = status

    if (wasAuth && isUnauth) {
      router.replace(buildLoginRedirectPath(pathname))
    }
  }, [status, pathname, router])

  return null
}
