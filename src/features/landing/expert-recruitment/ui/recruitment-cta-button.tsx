"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { useAuthStore } from "@/entities/auth/model/auth-store"
import { checkExpertProfileExists } from "@/entities/user/api/user.service"
import { buildLoginRedirectPath } from "@/shared/lib/redirect"
import { Text } from "@/shared/ui/text"

/**
 * 전문가 모집 랜딩의 CTA 버튼.
 *
 * 모바일 `ExpertRecruitmentDetailView._onRegisterTap` 와 동일한 3-step 가드:
 * 1. 미로그인 → 로그인 페이지 (복귀 경로 포함)
 * 2. 로그인 + 이미 전문가 → 토스트 + /mypage
 * 3. 로그인 + 비전문가 → /mypage/expert-register
 *
 * 정책: docs/detail/landing-expert-recruitment.md §6
 */
export function RecruitmentCtaButton() {
  const router = useRouter()
  const status = useAuthStore((s) => s.status)
  const [pending, setPending] = useState(false)

  async function handleClick() {
    if (pending) return

    if (status === "unauthenticated") {
      router.push(buildLoginRedirectPath("/landing/expert-recruitment"))
      return
    }
    if (status !== "authenticated") {
      return
    }

    setPending(true)
    try {
      const exists = await checkExpertProfileExists()
      if (exists) {
        toast.info("전문가 프로필이 이미 등록되어 있습니다")
        router.push("/mypage")
        return
      }
      router.push("/mypage/expert-register")
    } catch {
      toast.error("잠시 후 다시 시도해주세요")
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="group inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-primary px-6 py-3.5 transition-all hover:shadow-xl disabled:opacity-70 md:px-8 md:py-4"
    >
      <Text as="span" typography="body1-bold" className="text-primary-foreground">
        전문가 프로필 등록
      </Text>
      {pending ? (
        <Loader2 className="h-5 w-5 animate-spin text-primary-foreground" strokeWidth={2.5} />
      ) : (
        <ArrowRight
          className="h-5 w-5 text-primary-foreground transition-transform group-hover:translate-x-1"
          strokeWidth={2.5}
        />
      )}
    </button>
  )
}
