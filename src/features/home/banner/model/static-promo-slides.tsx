import type { ReactNode } from "react"
import { Wallet, MessageSquareQuote, Sparkles } from "lucide-react"

/**
 * 정적 프로모 슬라이드 정의 (동적 배너가 0개일 때 fallback).
 *
 * docs/detail/home-banner.md §3-B 참조.
 * 모바일 PromoBannerWidget 3종을 미러링.
 */

export type PromoSlide = {
  key: string
  href: string
  label: string
  headline: string
  body: string
  icon: ReactNode
  /** Tailwind gradient classes (from-... to-...) */
  gradient: string
  /** 데코 요소 색상 (white/x 의 alpha 수치, 톤별로 분리해서 슬라이드마다 다르게) */
  decoTone: "warm" | "cool" | "violet"
}

export const PROMO_SLIDES: PromoSlide[] = [
  {
    key: "hidden-fee",
    href: "/landing/hidden-fee",
    label: "수수료 0%",
    headline: "숨은 수수료 ZERO",
    body: "전문가 책정가 그대로 결제. 중개 수수료 0%, 합리적인 가격으로 시작하세요.",
    icon: <Wallet className="h-full w-full" strokeWidth={1.5} />,
    gradient: "from-emerald-600 via-emerald-500 to-teal-500",
    decoTone: "cool",
  },
  {
    key: "chat-review",
    href: "/landing/chat-review",
    label: "투명한 리뷰",
    headline: "채팅이 곧 리뷰입니다",
    body: "별점이 아닌 실제 대화로 전문가의 진짜 실력을 확인하세요. 조작 불가, 자동 보호.",
    icon: <MessageSquareQuote className="h-full w-full" strokeWidth={1.5} />,
    gradient: "from-primary via-primary to-primary-hover",
    decoTone: "violet",
  },
  {
    key: "expert-recruitment",
    href: "/landing/expert-recruitment",
    label: "전문가 모집",
    headline: "일한 만큼 다 가져가세요",
    body: "중개 수수료 무료, 제안서 무료, 프로필 등록 무료. 실력으로만 승부하는 곳.",
    icon: <Sparkles className="h-full w-full" strokeWidth={1.5} />,
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    decoTone: "warm",
  },
]
