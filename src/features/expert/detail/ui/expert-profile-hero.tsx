"use client"

import Image from "next/image"
import { useState } from "react"
import { cn } from "@/shared/lib/utils"
import { Text } from "@/shared/ui/text"
import type { ExpertDetail } from "@/entities/expert/api/expert.schema"

type Props = {
  expert: ExpertDetail
  className?: string
}

type Status = "loading" | "loaded" | "error"

export function ExpertProfileHero({ expert, className }: Props) {
  const [status, setStatus] = useState<Status>(expert.bannerImageUrl ? "loading" : "error")
  const [avatarError, setAvatarError] = useState(false)

  const showFallback = !expert.bannerImageUrl || status === "error"
  const initial = expert.nickname.charAt(0)

  return (
    <section className={cn("w-full", className)}>
      {/* ── Hero banner ─────────────────────────────────────────── */}
      <div
        className={cn(
          "bg-muted relative overflow-hidden",
          "aspect-video",
          // 모바일: PageShell.Content 의 px-4 를 뚫어 풀블리드
          // w-full 제거 — auto width 에서만 negative margin 이 폭을 확장한다
          "-mx-4 lg:mx-0",
          "rounded-none lg:rounded-2xl",
          "animate-in fade-in-0 duration-500",
        )}
      >
        {!showFallback && (
          <Image
            src={expert.bannerImageUrl!}
            alt={`${expert.nickname} 전문가 프로필 배너`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 760px"
            unoptimized
            onLoad={() => setStatus("loaded")}
            onError={() => setStatus("error")}
            className={cn(
              "object-cover transition-opacity duration-500",
              status === "loaded" ? "opacity-100" : "opacity-0",
            )}
          />
        )}

        {!showFallback && status === "loading" && (
          <div aria-hidden className="bg-muted absolute inset-0 animate-pulse" />
        )}
      </div>

      {/* ── Header block (avatar + nickname) ────────────────────── */}
      <header
        className={cn(
          "relative flex flex-col items-center text-center",
          "-mt-12 lg:-mt-16 lg:flex-row lg:items-end lg:gap-6 lg:text-left",
        )}
      >
        <div
          className="animate-in fade-in-0 zoom-in-90 relative z-10 duration-500"
          style={{ animationDelay: "200ms", animationFillMode: "backwards" }}
        >
          {expert.profileImageUrl && !avatarError ? (
            <Image
              src={expert.profileImageUrl}
              alt={expert.nickname}
              width={128}
              height={128}
              unoptimized
              onError={() => setAvatarError(true)}
              className={cn(
                "ring-background rounded-full object-cover shadow-xl ring-4",
                "h-24 w-24 lg:h-32 lg:w-32",
              )}
            />
          ) : (
            <div
              aria-label={expert.nickname}
              role="img"
              className={cn(
                "ring-background bg-muted flex items-center justify-center rounded-full shadow-xl ring-4",
                "h-24 w-24 lg:h-32 lg:w-32",
              )}
            >
              <Text as="span" typography="h1-bold" className="text-muted-foreground" aria-hidden>
                {initial}
              </Text>
            </div>
          )}
        </div>

        <div
          className="animate-in fade-in-0 slide-in-from-bottom-2 mt-4 duration-500 lg:mt-0 lg:pb-2"
          style={{ animationDelay: "350ms", animationFillMode: "backwards" }}
        >
          <Text as="h1" typography="h1-bold" className="text-foreground tracking-tight">
            {expert.nickname}
          </Text>
        </div>
      </header>
    </section>
  )
}
