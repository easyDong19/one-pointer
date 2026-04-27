import Image from "next/image"
import { cn } from "@/shared/lib/utils"
import { Text } from "@/shared/ui/text"
import type { ExpertDetail } from "@/entities/expert/api/expert.schema"

type Props = {
  expert: ExpertDetail
  className?: string
}

export function ExpertProfileHero({ expert, className }: Props) {
  const initial = expert.nickname.charAt(0)

  return (
    <section className={cn("w-full", className)}>
      {/* ── Hero banner ─────────────────────────────────────────── */}
      <div
        className={cn(
          "bg-muted relative overflow-hidden",
          "aspect-video",
          "-mx-4 lg:mx-0",
          "rounded-none lg:rounded-2xl",
        )}
      >
        {expert.bannerImageUrl && (
          <Image
            src={expert.bannerImageUrl}
            alt={`${expert.nickname} 전문가 프로필 배너`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 760px"
            unoptimized
            className="object-cover"
          />
        )}
      </div>

      {/* ── Header block (avatar + nickname) ────────────────────── */}
      <header
        className={cn(
          "relative flex flex-col items-center text-center",
          "-mt-12 lg:-mt-16 lg:flex-row lg:items-end lg:gap-6 lg:text-left",
        )}
      >
        <div className="relative z-10">
          {expert.profileImageUrl ? (
            <Image
              src={expert.profileImageUrl}
              alt={expert.nickname}
              width={128}
              height={128}
              unoptimized
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

        <div className="mt-4 lg:mt-0 lg:pb-2">
          <Text as="h1" typography="h1-bold" className="text-foreground tracking-tight">
            {expert.nickname}
          </Text>
        </div>
      </header>
    </section>
  )
}
