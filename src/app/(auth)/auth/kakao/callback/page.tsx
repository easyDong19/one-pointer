"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Text } from "@/shared/ui/text"
import { kakaoLogin } from "@/entities/auth/api/auth.service"
import { useAuthStore } from "@/entities/auth/model/auth-store"
import { resolveNextPath } from "@/shared/lib/redirect"
import { saveSocialAuth } from "@/features/auth/social/lib/social-auth-storage"
import { resolveSocialErrorMessage } from "@/features/auth/social/lib/resolve-social-error"

export default function KakaoCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const processedRef = useRef(false)

  useEffect(() => {
    if (processedRef.current) return
    processedRef.current = true

    const code = searchParams.get("code")
    const errorParam = searchParams.get("error")

    if (errorParam) {
      setError("카카오 로그인이 취소되었습니다.")
      setTimeout(() => router.replace("/login"), 2000)
      return
    }

    if (!code) {
      setError("카카오 인가 코드가 없습니다.")
      setTimeout(() => router.replace("/login"), 2000)
      return
    }

    handleKakaoCallback(code)
  }, [searchParams, router])

  async function handleKakaoCallback(code: string) {
    try {
      const redirectUri = `${window.location.origin}/auth/kakao/callback`
      const response = await kakaoLogin({ code, redirectUri })

      if (response.data.newUser) {
        // 신규 유저: kakaoAccessToken 을 sessionStorage 에 저장 후 가입 페이지로
        // (인가 code 는 1회용이므로 회원가입 API 호출 시 accessToken 을 사용해야 함)
        const kakaoAccessToken = response.data.kakaoAccessToken
        if (!kakaoAccessToken) {
          setError("카카오 인증 정보를 받지 못했어요. 다시 시도해주세요.")
          setTimeout(() => router.replace("/login"), 2000)
          return
        }

        const kakaoInfo = response.data.kakaoUserInfo
        saveSocialAuth("kakao", kakaoAccessToken, kakaoInfo)
        router.replace("/signup/kakao")
      } else {
        await useAuthStore.getState().reload()
        const nextPath = sessionStorage.getItem("auth_next_path") || "/"
        sessionStorage.removeItem("auth_next_path")
        router.replace(resolveNextPath(nextPath))
      }
    } catch (err) {
      setError(resolveSocialErrorMessage(err))
      setTimeout(() => router.replace("/login"), 3000)
    }
  }

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
              카카오 로그인 처리 중...
            </Text>
          </>
        )}
      </div>
    </main>
  )
}
