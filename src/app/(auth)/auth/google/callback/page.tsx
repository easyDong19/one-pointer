"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Text } from "@/shared/ui/text"
import { googleLogin } from "@/entities/auth/api/auth.service"
import { useAuthStore } from "@/entities/auth/model/auth-store"
import { resolveNextPath } from "@/shared/lib/redirect"
import { saveSocialAuth } from "@/features/auth/social/lib/social-auth-storage"
import { resolveSocialErrorMessage } from "@/features/auth/social/lib/resolve-social-error"

function GoogleCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [asyncError, setAsyncError] = useState<string | null>(null)
  const processedRef = useRef(false)

  // 파라미터 검증 에러는 searchParams 로부터 렌더 중 파생 (effect 에서 동기 setState 회피)
  const code = searchParams.get("code")
  const errorParam = searchParams.get("error")
  const paramError = errorParam
    ? "Google 로그인이 취소되었습니다."
    : !code
      ? "Google 인가 코드가 없습니다."
      : null
  const error = paramError ?? asyncError

  useEffect(() => {
    if (processedRef.current) return
    processedRef.current = true

    if (paramError) {
      setTimeout(() => router.replace("/login"), 2000)
      return
    }
    if (!code) return // paramError 로 이미 보장됨 — 타입 좁히기용

    const handleGoogleCallback = async (authCode: string) => {
      try {
        const redirectUri = `${window.location.origin}/auth/google/callback`
        const response = await googleLogin({ code: authCode, redirectUri })

        if (response.data.newUser) {
          // 신규 유저: googleAccessToken 을 sessionStorage 에 저장 후 가입 페이지로
          // (인가 code 는 1회용이므로 회원가입 API 호출 시 accessToken 을 사용해야 함)
          const googleAccessToken = response.data.googleAccessToken
          if (!googleAccessToken) {
            setAsyncError("Google 인증 정보를 받지 못했어요. 다시 시도해주세요.")
            setTimeout(() => router.replace("/login"), 2000)
            return
          }

          const googleInfo = response.data.googleUserInfo
          saveSocialAuth("google", googleAccessToken, googleInfo)
          router.replace("/signup/google")
        } else {
          await useAuthStore.getState().reload()
          const nextPath = sessionStorage.getItem("auth_next_path") || "/"
          sessionStorage.removeItem("auth_next_path")
          router.replace(resolveNextPath(nextPath))
        }
      } catch (err) {
        setAsyncError(resolveSocialErrorMessage(err))
        setTimeout(() => router.replace("/login"), 3000)
      }
    }

    handleGoogleCallback(code)
  }, [paramError, code, router])

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-op-lg">
        {error ? (
          <>
            <Text as="p" typography="body1-medium" className="text-destructive">
              {error}
            </Text>
            <Text as="p" typography="body3-regular" className="text-muted-foreground">
              잠시 후 로그인 페이지로 이동합니다...
            </Text>
          </>
        ) : (
          <>
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <Text as="p" typography="body2-medium" className="text-foreground">
              Google 로그인 처리 중...
            </Text>
          </>
        )}
      </div>
    </main>
  )
}

function GoogleCallbackFallback() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-op-lg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <Text as="p" typography="body2-medium" className="text-foreground">
          Google 로그인 처리 중...
        </Text>
      </div>
    </main>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<GoogleCallbackFallback />}>
      <GoogleCallbackContent />
    </Suspense>
  )
}
