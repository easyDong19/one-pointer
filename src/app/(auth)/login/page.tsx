"use client"

import { useState } from "react"
import { LoginForm } from "@/features/auth/sign-in/ui/login-form"
import { resolveNextPath } from "@/shared/lib/redirect"
import { AuthBrandPanel } from "@/app/(auth)/_components/auth-brand-panel"

export default function LoginPage() {
  const [nextPath] = useState(() => {
    if (typeof window === "undefined") return "/"
    const params = new URLSearchParams(window.location.search)
    return resolveNextPath(params.get("next"))
  })

  return (
    <main className="flex min-h-dvh flex-col md:flex-row">
      <AuthBrandPanel />

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 md:w-1/2 md:px-12 lg:w-[45%] lg:px-16">
        <div className="w-full max-w-sm md:max-w-md">
          <LoginForm nextPath={nextPath} />
        </div>
      </div>
    </main>
  )
}
