"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/shared/ui/button"
import { Checkbox } from "@/shared/ui/checkbox"
import { Input } from "@/shared/ui/input"
import { Separator } from "@/shared/ui/separator"
import { Text } from "@/shared/ui/text"
import { checkNickname } from "@/entities/auth/api/auth.service"
import { useAuthStore } from "@/entities/auth/model/auth-store"
import {
  clearSocialAuth,
  loadSocialAuth,
  type SocialProvider,
  type SocialUserInfo,
} from "@/features/auth/social/lib/social-auth-storage"
import { resolveSocialErrorMessage } from "@/features/auth/social/lib/resolve-social-error"
import { SignupBrandPanel } from "@/app/(auth)/_components/signup-brand-panel"

type Props = {
  provider: SocialProvider
  onSignup: (params: {
    accessToken: string
    nickname: string
    phone: string
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

function normalizePhone(value: string) {
  return value.replace(/[^0-9]/g, "")
}

function isValidPhone(value: string) {
  return /^01[016789]\d{7,8}$/.test(value)
}

export function SocialSignupContent({ provider, onSignup }: Props) {
  const router = useRouter()

  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<SocialUserInfo | null>(null)
  const [bootError, setBootError] = useState<string | null>(null)

  const [nickname, setNickname] = useState("")
  const [phone, setPhone] = useState("")
  const [nicknameError, setNicknameError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [terms, setTerms] = useState<Record<TermsKey, boolean>>({
    termsOfService: false,
    privacyPolicy: false,
    chatReviewAgreed: false,
    marketingConsent: false,
  })
  const [isPending, setIsPending] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    const saved = loadSocialAuth(provider)
    if (!saved) {
      setBootError("인증 정보가 만료되었어요. 다시 로그인해주세요.")
      setTimeout(() => router.replace("/login"), 2000)
      return
    }
    setAccessToken(saved.accessToken)
    setUserInfo(saved.userInfo)
  }, [provider, router])

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
        setNicknameError("이미 사용 중인 닉네임이에요.")
        return false
      }
    } catch {
      setNicknameError("닉네임 확인 중 오류가 발생했어요.")
      return false
    }

    setNicknameError(null)
    return true
  }

  const validatePhone = () => {
    const normalized = normalizePhone(phone)
    if (!normalized) {
      setPhoneError("휴대폰 번호를 입력해주세요.")
      return false
    }
    if (!isValidPhone(normalized)) {
      setPhoneError("올바른 휴대폰 번호를 입력해주세요. (예: 01012345678)")
      return false
    }
    setPhoneError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!accessToken) {
      setSubmitError("인증 정보가 만료되었어요. 다시 로그인해주세요.")
      setTimeout(() => router.replace("/login"), 2000)
      return
    }

    const [nicknameOk, phoneOk] = [await validateNickname(), validatePhone()]
    if (!nicknameOk || !phoneOk) return

    setIsPending(true)
    setSubmitError(null)

    try {
      await onSignup({
        accessToken,
        nickname,
        phone: normalizePhone(phone),
        chatReviewAgreed: terms.chatReviewAgreed,
        marketingConsent: terms.marketingConsent,
      })

      clearSocialAuth()
      await useAuthStore.getState().reload()
      const nextPath = sessionStorage.getItem("auth_next_path") || "/"
      sessionStorage.removeItem("auth_next_path")
      router.replace(nextPath)
    } catch (err) {
      setSubmitError(resolveSocialErrorMessage(err))
      setIsPending(false)
    }
  }

  if (bootError) {
    return (
      <main className="bg-background flex min-h-dvh items-center justify-center">
        <div className="gap-op-lg flex flex-col items-center px-6 text-center">
          <Text as="p" typography="body1-medium" className="text-destructive">
            {bootError}
          </Text>
          <Text as="p" typography="body3-regular" className="text-muted-foreground">
            잠시 후 로그인 페이지로 이동합니다...
          </Text>
        </div>
      </main>
    )
  }

  if (!accessToken) {
    return (
      <main className="bg-background flex min-h-dvh items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
      </main>
    )
  }

  return (
    <main className="flex min-h-dvh flex-col md:flex-row">
      <SignupBrandPanel
        eyebrow="ALMOST THERE"
        headline={
          <>
            거의 다 왔어요,
            <br />
            마지막 한 걸음.
          </>
        }
        subline={
          <>
            {PROVIDER_LABEL[provider]} 계정 인증이 완료됐어요.
            <br />
            추가 정보만 입력하면 가입이 끝나요.
          </>
        }
      />

      <div className="flex flex-1 flex-col md:w-1/2 lg:w-[45%]">
        {/* 모바일 헤더 */}
        <header className="bg-background/80 sticky top-0 z-40 flex h-14 items-center border-b px-4 backdrop-blur-md md:hidden">
          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="p-1"
            aria-label="로그인으로 돌아가기"
          >
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

        <div className="flex-1 px-6 py-8 md:px-12 md:py-12 lg:px-16">
          <div className="mx-auto flex w-full max-w-md flex-col gap-8">
            {/* 데스크탑 뒤로가기 */}
            <button
              type="button"
              onClick={() => router.replace("/login")}
              className="text-muted-foreground hover:text-foreground -ml-1 hidden items-center gap-1.5 self-start transition-colors md:flex"
            >
              <ArrowLeft size={18} />
              <Text as="span" typography="body3-medium">
                로그인으로
              </Text>
            </button>

            {/* 인사 + 메타 */}
            <div className="flex flex-col gap-2">
              <Text as="h2" typography="h2-bold">
                {userInfo?.name ? `${userInfo.name}님,` : "거의 다 됐어요"}
              </Text>
              <Text as="p" typography="body2-regular" className="text-muted-foreground">
                추가 정보를 입력하고 약관에 동의해주세요.
              </Text>
              {userInfo?.email ? (
                <div className="bg-primary-light text-primary mt-2 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1">
                  <Text as="span" typography="caption1-medium">
                    {PROVIDER_LABEL[provider]} · {userInfo.email}
                  </Text>
                </div>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* 닉네임 */}
              <div className="flex flex-col gap-2">
                <Text as="label" typography="body2-medium" htmlFor="nickname">
                  닉네임 <span className="text-destructive">*</span>
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

              {/* 휴대폰 번호 */}
              <div className="flex flex-col gap-2">
                <Text as="label" typography="body2-medium" htmlFor="phone">
                  휴대폰 번호 <span className="text-destructive">*</span>
                </Text>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="예) 01012345678"
                  className="h-14 rounded-2xl px-4 text-base tabular-nums"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    setPhoneError(null)
                  }}
                  onBlur={validatePhone}
                />
                {phoneError ? (
                  <Text as="p" typography="caption1-medium" className="text-destructive">
                    {phoneError}
                  </Text>
                ) : null}
              </div>

              {/* 약관 */}
              <div className="flex flex-col gap-4">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={handleToggleAll}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleToggleAll()
                  }}
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
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") handleToggleItem(item.key)
                        }}
                        className="flex cursor-pointer items-center gap-3"
                      >
                        <Checkbox
                          checked={terms[item.key]}
                          onCheckedChange={() => handleToggleItem(item.key)}
                          className="size-6 rounded-full"
                        />
                        <Text as="span" typography="body2-regular">
                          {item.label}{" "}
                          <span
                            className={
                              item.required ? "text-primary" : "text-muted-foreground"
                            }
                          >
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
              {submitError ? (
                <Text
                  as="p"
                  typography="caption1-medium"
                  className="border-destructive/25 bg-destructive/10 text-destructive rounded-md border px-3 py-2"
                >
                  {submitError}
                </Text>
              ) : null}

              {/* 가입 버튼 */}
              <Button
                type="submit"
                className="mt-2 h-14 w-full rounded-2xl text-base font-medium"
                disabled={!requiredChecked || nickname.length < 2 || !phone || isPending}
              >
                {isPending ? "가입 중..." : "가입하기"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
