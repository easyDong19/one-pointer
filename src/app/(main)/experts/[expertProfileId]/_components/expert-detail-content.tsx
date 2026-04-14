"use client"

import { Loader2 } from "lucide-react"
import { Text } from "@/shared/ui/text"
import { Separator } from "@/shared/ui/separator"
import { useExpertDetailQuery } from "@/features/expert/detail/model/use-expert-detail-query"
import { ExpertDetailHeader } from "@/features/expert/detail/ui/expert-detail-header"
import { ExpertProfileCard } from "@/features/expert/detail/ui/expert-profile-card"
import { ExpertStatsBar } from "@/features/expert/detail/ui/expert-stats-bar"
import { ExpertTabContent } from "@/features/expert/detail/ui/expert-tab-content"
import { ExpertDesktopSidebar } from "@/features/expert/detail/ui/expert-desktop-sidebar"
import { ExpertMobileBottomBar } from "@/features/expert/detail/ui/expert-mobile-bottom-bar"

export function ExpertDetailContent({ expertProfileId }: { expertProfileId: number }) {
  const { data: expert, isLoading, isError, error } = useExpertDetailQuery(expertProfileId)

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-dvh items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (isError) {
    console.error("Expert detail query error:", error)
  }

  if (!expert) {
    return (
      <div className="bg-background flex min-h-dvh flex-col items-center justify-center gap-3">
        <Text as="p" typography="body1-medium" className="text-muted-foreground">
          {isError ? "데이터를 불러오는 중 오류가 발생했습니다" : "전문가를 찾을 수 없습니다"}
        </Text>
        {isError && (
          <Text
            as="p"
            typography="caption1-medium"
            className="text-destructive max-w-sm text-center"
          >
            {error?.message}
          </Text>
        )}
      </div>
    )
  }

  return (
    <div className="bg-background min-h-dvh pb-24">
      {/* Mobile header */}
      <ExpertDetailHeader />

      {/* Desktop: 2-column / Mobile: 1-column */}
      <div className="mx-auto max-w-5xl lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:gap-8 lg:px-6 lg:py-8">
        {/* Left: Main content */}
        <div>
          <div className="px-4 pt-5 lg:px-0 lg:pt-0">
            <ExpertProfileCard expert={expert} />
          </div>

          <div className="px-4 py-4 lg:px-0">
            <ExpertStatsBar expert={expert} />
          </div>

          <Separator className="lg:hidden" />

          <ExpertTabContent expert={expert} />
        </div>

        {/* Right: Desktop sidebar */}
        <div className="hidden lg:block">
          <ExpertDesktopSidebar expert={expert} />
        </div>
      </div>

      {/* Mobile: Bottom CTA */}
      <ExpertMobileBottomBar />
    </div>
  )
}
