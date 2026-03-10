"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ZodError } from "zod/v4"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { PasswordInput } from "@/shared/ui/password-input"
import { SocialLoginButton } from "@/shared/ui/social-login-button"
import { Text } from "@/shared/ui/text"
import { ApiError } from "@/shared/api/http/api-error"
import { loginRequestSchema, type LoginRequest } from "@/entities/auth/api/auth.schema"
import { getKakaoAuthorizeUrl } from "@/entities/auth/api/auth.service"
import { useLoginMutation } from "@/features/auth/sign-in/model/use-login-mutation"

type LoginFormProps = {
  nextPath: string
}

export function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter()
  const loginMutation = useLoginMutation()
  const [socialLoading, setSocialLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema as never),
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = handleSubmit(async (values) => {
    const response = await loginMutation.mutateAsync(values)
    if (response.success) {
      router.replace(nextPath)
    }
  })

  const handleKakaoLogin = async () => {
    try {
      setSocialLoading(true)
      const redirectUri = `${window.location.origin}/auth/kakao/callback`
      const res = await getKakaoAuthorizeUrl(redirectUri)
      // data: { authorizeUrl: "https://kauth.kakao.com/oauth/authorize?..." }
      const authorizeUrl = Object.values(res.data)[0]
      if (authorizeUrl) {
        // nextPath를 sessionStorage에 저장하여 콜백에서 사용
        sessionStorage.setItem("auth_next_path", nextPath)
        window.location.href = authorizeUrl
      }
    } catch (error) {
      setSocialLoading(false)
      loginMutation.reset()
    }
  }

  const errorMessage = resolveLoginErrorMessage(loginMutation.error)
  const isPending = loginMutation.isPending || isSubmitting || socialLoading

  return (
    <div className="flex w-full flex-col gap-8">
      {/* 슬로건: 모바일 중앙 / 데스크탑 좌측 */}
      <div>
        <Text as="h1" typography="h2-bold" className="text-primary text-center md:text-left">
          다시 만나서 반가워요 👋
        </Text>
        <Text as="p" typography="body2-regular" className="text-muted-foreground mt-1 text-center md:text-left">
          계정에 로그인하세요
        </Text>
      </div>

      {/* 폼 */}
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        {/* 이메일 */}
        <div className="flex flex-col gap-2">
          <Text as="label" typography="body2-regular" htmlFor="email">
            이메일
          </Text>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="이메일을 입력하세요"
            className="h-14 rounded-2xl px-4 text-base"
            {...register("email")}
          />
          {errors.email ? (
            <Text as="p" typography="caption1-medium" className="text-destructive">
              {errors.email.message}
            </Text>
          ) : null}
        </div>

        {/* 비밀번호 */}
        <div className="flex flex-col gap-2">
          <Text as="label" typography="body2-regular" htmlFor="password">
            비밀번호
          </Text>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="비밀번호를 입력하세요"
            className="h-14 rounded-2xl px-4 text-base"
            {...register("password")}
          />
          {errors.password ? (
            <Text as="p" typography="caption1-medium" className="text-destructive">
              {errors.password.message}
            </Text>
          ) : null}
        </div>

        {/* 비밀번호 찾기 */}
        <div className="flex justify-end">
          <Link href="/forgot-password">
            <Text as="span" typography="body3-medium" className="text-primary">
              비밀번호 찾기
            </Text>
          </Link>
        </div>

        {/* 에러 메시지 */}
        {errorMessage ? (
          <Text
            as="p"
            typography="caption1-medium"
            className="border-destructive/25 bg-destructive/10 text-destructive rounded-md border px-3 py-2"
          >
            {errorMessage}
          </Text>
        ) : null}

        {/* 로그인 버튼 */}
        <Button
          type="submit"
          disabled={isPending}
          className="h-14 w-full rounded-2xl text-base font-medium"
        >
          {isPending ? "로그인 중..." : "로그인"}
        </Button>
      </form>

      {/* 구분선 */}
      <div className="flex items-center gap-3">
        <div className="bg-border h-px flex-1" />
        <Text as="span" typography="body3-regular" className="text-muted-foreground">
          또는
        </Text>
        <div className="bg-border h-px flex-1" />
      </div>

      {/* 소셜 로그인 */}
      <div className="flex flex-col gap-3">
        <SocialLoginButton provider="kakao" onClick={handleKakaoLogin} disabled={isPending} />
        <SocialLoginButton provider="google" disabled={isPending} />
        <SocialLoginButton provider="apple" disabled={isPending} />
      </div>

      {/* 회원가입 링크 */}
      <div className="text-center">
        <Text as="span" typography="body3-regular" className="text-muted-foreground">
          아직 계정이 없으신가요?{" "}
        </Text>
        <Link href="/signup">
          <Text as="span" typography="body3-medium" className="text-primary">
            회원가입
          </Text>
        </Link>
      </div>
    </div>
  )
}

function resolveLoginErrorMessage(error: unknown): string | null {
  if (!error) return null
  if (error instanceof ApiError) return error.message
  if (error instanceof ZodError) return "응답 데이터 형식이 올바르지 않습니다."
  if (error instanceof Error) return error.message
  return "로그인 중 알 수 없는 오류가 발생했습니다."
}
