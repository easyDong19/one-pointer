"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { resolveNextPath } from "@/src/lib/auth/redirect"
import { useAuthStore } from "@/src/stores/auth-store"

const MOCK_USER = {
  id: "mock-user",
  role: "USER",
}

export default function LoginPage() {
  const router = useRouter()
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated)

  const nextPath = useMemo(() => {
    if (typeof window === "undefined") {
      return "/"
    }

    const params = new URLSearchParams(window.location.search)
    return resolveNextPath(params.get("next"))
  }, [])

  const handleMockLoginSuccess = () => {
    setAuthenticated(MOCK_USER)
    router.replace(nextPath)
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Login</h1>
      <p>로그인 성공 시 원래 경로로 복귀합니다.</p>
      <p>next: {nextPath}</p>
      <button type="button" onClick={handleMockLoginSuccess}>
        Mock Login Success
      </button>
    </main>
  )
}
