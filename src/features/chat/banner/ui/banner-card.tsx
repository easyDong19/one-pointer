"use client"

import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/shared/lib/utils"
import { Text } from "@/shared/ui/text"

import type { BannerTone } from "../lib/banner.constants"

type Props = {
  tone: BannerTone
  /** 좌측 아이콘 — 모바일은 미사용 (dot), 데스크탑(md+) 에서 원형 영역에 노출. */
  icon: LucideIcon
  title: string
  description?: ReactNode
  /** 우측 액션 영역 — BannerActionButton 또는 안내만일 때 생략. */
  action?: ReactNode
}

/**
 * 채팅방 상단 배너의 공용 셸.
 *
 * 모바일: 컴팩트 (dot + 본문 + CTA 한 줄).
 * 데스크탑(md+): 좌측 4px 색 strip + 원형 톤 배경 안의 도메인 아이콘 + 큰 호흡.
 *
 * tone 매핑은 `lib/banner.constants.ts` 의 BANNER_TONE 과 동기화 — 색은 모두
 * 디자인 시스템 토큰 (primary/destructive/warning/muted) 만 사용.
 */
export function BannerCard({ tone, icon: Icon, title, description, action }: Props) {
  return (
    <section
      className={cn(
        "relative border-y border-border px-4 py-3 md:px-8 md:py-5 lg:py-6",
        TONE_BG[tone],
      )}
      aria-live="polite"
    >
      {/* 데스크탑 전용: 좌측 색 strip — 데스크탑 화면에서 배너의 무드 강화 */}
      <span
        aria-hidden
        className={cn(
          "absolute top-0 bottom-0 left-0 hidden w-1 md:block",
          TONE_STRIP[tone],
        )}
      />

      <div className="flex w-full items-center gap-3 md:gap-5">
        {/* 모바일: dot */}
        <span
          aria-hidden
          className={cn(
            "mt-1 h-2 w-2 shrink-0 rounded-full md:hidden",
            TONE_DOT[tone],
          )}
        />
        {/* 데스크탑: 원형 톤 배경 안의 도메인 아이콘 */}
        <span
          aria-hidden
          className={cn(
            "hidden shrink-0 rounded-full md:flex md:h-11 md:w-11 md:items-center md:justify-center",
            TONE_ICON_BG[tone],
          )}
        >
          <Icon className={cn("h-5 w-5", TONE_ICON_COLOR[tone])} />
        </span>

        <div className="min-w-0 flex-1">
          <Text
            typography="body1-bold"
            className="text-foreground"
          >
            {title}
          </Text>
          {description && (
            <Text
              as="p"
              typography="caption1-medium"
              className="text-muted-foreground mt-0.5 line-clamp-3 md:mt-1.5"
            >
              {description}
            </Text>
          )}
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>
    </section>
  )
}

const TONE_BG: Record<BannerTone, string> = {
  primary: "bg-primary-light/40",
  destructive: "bg-destructive/10",
  warning: "bg-warning/10",
  info: "bg-muted/40",
}

const TONE_STRIP: Record<BannerTone, string> = {
  primary: "bg-primary",
  destructive: "bg-destructive",
  warning: "bg-warning",
  info: "bg-muted-foreground/40",
}

const TONE_DOT: Record<BannerTone, string> = {
  primary: "bg-primary",
  destructive: "bg-destructive",
  warning: "bg-warning",
  info: "bg-muted-foreground",
}

const TONE_ICON_BG: Record<BannerTone, string> = {
  primary: "bg-primary-light",
  destructive: "bg-destructive/15",
  warning: "bg-warning/15",
  info: "bg-muted",
}

const TONE_ICON_COLOR: Record<BannerTone, string> = {
  primary: "text-primary",
  destructive: "text-destructive",
  warning: "text-warning",
  info: "text-muted-foreground",
}
