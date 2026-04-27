"use client"

import { QueryClientProvider } from "@tanstack/react-query"
import { OverlayProvider } from "overlay-kit"
import { useEffect, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { getQueryClient } from "@/shared/lib/query-client"
import { useAuthStore } from "@/entities/auth/model/auth-store"
import { authQueryKeys } from "@/entities/auth/model/auth.query-keys"
import type { AuthUser } from "@/entities/auth/api/auth.schema"
import { setOnRefreshSuccess } from "@/shared/api/http/client-fetch"
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

  // refresh 성공 시 auth store + me 쿼리 동기화 (UI stale 버그 수정)
  // 명세: docs/bug-fix/auth-refresh-stale-user.md
  useEffect(() => {
    setOnRefreshSuccess((data) => {
      const current = useAuthStore.getState().user
      // 현재 user 위에 refresh 응답 필드 덮어씌움 — phone, profileImageUrl 등 refresh
      // 응답에 없는 필드는 보존. 정확한 최신값은 me 쿼리 invalidate 로 보강.
      const next: AuthUser = {
        ...(current ?? {}),
        id: typeof data.id === "string" ? Number(data.id) : data.id,
        email: data.email,
        name: data.name,
        nickname: data.nickname,
        role: data.role,
        status: data.status,
      } as AuthUser

      useAuthStore.getState().setAuthenticated(next)
      queryClient.invalidateQueries({ queryKey: authQueryKeys.me })
    })

    return () => setOnRefreshSuccess(null)
  }, [queryClient])

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
