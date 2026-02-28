"use client"

import { useMemo } from "react"
import { LoginForm } from "@/features/auth/sign-in/ui/login-form"
import { resolveNextPath } from "@/shared/lib/redirect"

export default function LoginPage() {
  const nextPath = useMemo(() => {
    if (typeof window === "undefined") {
      return "/"
    }

    const params = new URLSearchParams(window.location.search)
    return resolveNextPath(params.get("next"))
  }, [])

  return (
    <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-12">
      <LoginForm nextPath={nextPath} />
    </main>
  )
}
