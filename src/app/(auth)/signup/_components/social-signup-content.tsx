"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/shared/ui/button"
import { Checkbox } from "@/shared/ui/checkbox"
import { Input } from "@/shared/ui/input"
import { Separator } from "@/shared/ui/separator"
import { Text } from "@/shared/ui/text"
import { checkNickname } from "@/entities/auth/api/auth.service"
import { useAuthStore } from "@/entities/auth/model/auth-store"

type SocialProvider = "kakao" | "google"

type Props = {
  provider: SocialProvider
  onSignup: (params: {
    code: string
    redirectUri: string
    nickname: string
    chatReviewAgreed: boolean
    marketingConsent: boolean
  }) => Promise<void>
}

const PROVIDER_LABEL: Record<SocialProvider, string> = {
  kakao: "카카오",
  google: "Google",
}

const TERMS_ITEMS = [
  { key: "termsOfService", label: "서비스 이용약관 동의", required: true, href: "/terms" },
  { key: "privacyPolicy", label: "개인정보 수집 및 이용 동의", required: true, href: "/privacy" },
  { key: "chatReviewAgreed", label: "채팅 내역 리뷰 활용 동의", required: true, href: "/policies/chat-review" },
  { key: "marketingConsent", label: "마케팅 정보 수신 동의", required: false, href: "/policies/marketing" },
] as const

type TermsKey = (typeof TERMS_ITEMS)[number]["key"]

export function SocialSignupContent({ provider, onSignup }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const name = searchParams.get("name") ?? ""
  const code = searchParams.get("code") ?? ""
  const redirectUri = searchParams.get("redirectUri") ?? ""

  const [nickname, setNickname] = useState("")
  const [nicknameError, setNicknameError] = useState<string | null>(null)
  const [terms, setTerms] = useState<Record<TermsKey, boolean>>({
    termsOfService: false,
    privacyPolicy: false,
    chatReviewAgreed: false,
    marketingConsent: false,
  })
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const allChecked = Object.values(terms).every(Boolean)
  const requiredChecked = TERMS_ITEMS.filter((t) => t.required).every((t) => terms[t.key])

  const handleToggleAll = () => {
    const next = !allChecked
    setTerms({
      termsOfService: next,
      privacyPolicy: next,
      chatReviewAgreed: next,
      marketingConsent: next,
    })
  }

  const handleToggleItem = (key: TermsKey) => {
    setTerms((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const validateNickname = async () => {
    if (nickname.length < 2) {
      setNicknameError("닉네임은 2자 이상이어야 합니다.")
      return false
    }
    if (nickname.length > 7) {
      setNicknameError("닉네임은 7자 이하이어야 합니다.")
      return false
    }

    try {
      const res = await checkNickname(nickname)
      const isDuplicate = Object.values(res.data)[0]
      if (isDuplicate) {
        setNicknameError("이미 사용 중인 닉네임입니다.")
        return false
      }
    } catch {
      setNicknameError("닉네임 확인 중 오류가 발생했습니다.")
      return false
    }

    setNicknameError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!code || !redirectUri) {
      setError("인증 정보가 만료되었습니다. 다시 로그인해주세요.")
      setTimeout(() => router.replace("/login"), 2000)
      return
    }

    const valid = await validateNickname()
    if (!valid) return

    setIsPending(true)
    setError(null)

    try {
      await onSignup({
        code,
        redirectUri,
        nickname,
        chatReviewAgreed: terms.chatReviewAgreed,
        marketingConsent: terms.marketingConsent,
      })

      await useAuthStore.getState().bootstrap()
      const nextPath = sessionStorage.getItem("auth_next_path") || "/"
      sessionStorage.removeItem("auth_next_path")
      router.replace(nextPath)
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입 중 오류가 발생했습니다.")
      setIsPending(false)
    }
  }

  return (
    <div className="bg-background min-h-dvh">
      {/* 헤더 */}
      <header className="sticky top-0 z-40 flex h-14 items-center border-b bg-background/80 px-4 backdrop-blur-md">
        <button type="button" onClick={() => router.replace("/login")} className="p-1">
          <ArrowLeft size={24} />
        </button>
        <Text
          as="h1"
          typography="subtitle1-bold"
          className="absolute left-1/2 -translate-x-1/2"
        >
          {PROVIDER_LABEL[provider]} 회원가입
        </Text>
      </header>

      {/* 본문 */}
      <div className="mx-auto max-w-md px-6 py-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* 인사 */}
          <div>
            <Text as="h2" typography="h2-bold">
              {name ? `${name}님, 환영합니다!` : "환영합니다!"}
            </Text>
            <Text as="p" typography="body2-regular" className="text-muted-foreground mt-1">
              닉네임을 설정하고 약관에 동의해주세요.
            </Text>
          </div>

          {/* 닉네임 */}
          <div className="flex flex-col gap-2">
            <Text as="label" typography="body2-regular" htmlFor="nickname">
              닉네임
            </Text>
            <Input
              id="nickname"
              type="text"
              placeholder="2~7자 닉네임을 입력하세요"
              className="h-14 rounded-2xl px-4 text-base"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value)
                setNicknameError(null)
              }}
              onBlur={validateNickname}
            />
            {nicknameError ? (
              <Text as="p" typography="caption1-medium" className="text-destructive">
                {nicknameError}
              </Text>
            ) : null}
          </div>

          {/* 약관 */}
          <div className="flex flex-col gap-4">
            <div
              role="button"
              tabIndex={0}
              onClick={handleToggleAll}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleToggleAll() }}
              className="bg-neutral-50 flex cursor-pointer items-center gap-3 rounded-xl px-4 py-4"
            >
              <Checkbox
                checked={allChecked}
                onCheckedChange={handleToggleAll}
                className="size-6 rounded-full"
              />
              <Text as="span" typography="subtitle1-bold">
                전체 동의
              </Text>
            </div>

            <Separator />

            <div className="flex flex-col gap-3">
              {TERMS_ITEMS.map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleToggleItem(item.key)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleToggleItem(item.key) }}
                    className="flex cursor-pointer items-center gap-3"
                  >
                    <Checkbox
                      checked={terms[item.key]}
                      onCheckedChange={() => handleToggleItem(item.key)}
                      className="size-6 rounded-full"
                    />
                    <Text as="span" typography="body2-regular">
                      {item.label}{" "}
                      <span className={item.required ? "text-primary" : "text-muted-foreground"}>
                        ({item.required ? "필수" : "선택"})
                      </span>
                    </Text>
                  </div>
                  <Link
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${item.label} 보기 (새 탭)`}
                    className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* 에러 */}
          {error ? (
            <Text
              as="p"
              typography="caption1-medium"
              className="border-destructive/25 bg-destructive/10 text-destructive rounded-md border px-3 py-2"
            >
              {error}
            </Text>
          ) : null}

          {/* 가입 버튼 */}
          <Button
            type="submit"
            className="mt-2 h-14 w-full rounded-2xl text-base font-medium"
            disabled={!requiredChecked || nickname.length < 2 || isPending}
          >
            {isPending ? "가입 중..." : "가입하기"}
          </Button>
        </form>
      </div>
    </div>
  )
}
