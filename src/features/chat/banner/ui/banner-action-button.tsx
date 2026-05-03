"use client"

import { toast } from "sonner"

import { cn } from "@/shared/lib/utils"

import { STUB_TOAST_MESSAGE, type BannerTone } from "../lib/banner.constants"

type Props = {
  tone: BannerTone
  children: React.ReactNode
  /**
   * Wave 2 에선 미지정 시 stub toast.info 호출 — Wave 3 에서 도메인 mutation/
   * 페이지 이동으로 한 줄 교체.
   */
  onClick?: () => void
}

/**
 * 배너 우측 CTA 버튼. tone 별로 색·hover 만 다르고 모양은 동일.
 */
export function BannerActionButton({ tone, children, onClick }: Props) {
  const handleClick = onClick ?? (() => toast.info(STUB_TOAST_MESSAGE))

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md font-semibold transition-colors",
        // 모바일은 컴팩트, 데스크탑은 한 단계 큼
        "h-8 px-3 text-xs md:h-10 md:px-5 md:text-sm",
        TONE_CLASSES[tone],
      )}
    >
      {children}
    </button>
  )
}

const TONE_CLASSES: Record<BannerTone, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
  warning: "bg-warning text-warning-foreground hover:opacity-90",
  info: "bg-muted text-muted-foreground hover:bg-muted/80",
}
