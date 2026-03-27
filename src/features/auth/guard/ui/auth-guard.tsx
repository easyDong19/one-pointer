"use client"

import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/entities/auth/model/auth-store"
import { buildLoginRedirectPath } from "@/shared/lib/redirect"
import { LoginPromptModal } from "./login-prompt-modal"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((s) => s.status)

  if (status === "idle" || status === "loading") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    return <AuthGuardRedirect />
  }

  return <>{children}</>
}

function AuthGuardRedirect() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <LoginPromptModal
      isOpen={true}
      onLogin={() => router.replace(buildLoginRedirectPath(pathname))}
      onGoHome={() => router.replace("/")}
    />
  )
}
