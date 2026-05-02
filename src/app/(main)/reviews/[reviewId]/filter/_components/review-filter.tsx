"use client"

import { Loader2 } from "lucide-react"

import { AuthGuard } from "@/features/auth/guard/ui/auth-guard"
import { ReviewFilterContent } from "@/features/review/filter/ui/review-filter-content"
import { useFilteringViewQuery } from "@/features/review/filter/model/use-filtering-view-query"
import { MobileHeader } from "@/shared/ui/mobile-header"
import { PageShell } from "@/shared/ui/page-shell"
import { Text } from "@/shared/ui/text"

type Props = {
  reviewId: number
}

export function ReviewFilter({ reviewId }: Props) {
  const view = useFilteringViewQuery(reviewId)

  return (
    <AuthGuard>
      <PageShell tier="content">
        <PageShell.Header>
          <MobileHeader>
            <MobileHeader.BackButton />
            <MobileHeader.Title>리뷰 필터링</MobileHeader.Title>
            <MobileHeader.Spacer />
          </MobileHeader>
        </PageShell.Header>
        <PageShell.Content>
          {view.isLoading ? (
            <CenteredState>
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </CenteredState>
          ) : view.isError || !view.data ? (
            <CenteredState>
              <div className="text-center">
                <Text typography="body1-bold" className="text-foreground mb-1">
                  필터링 정보를 불러오지 못했어요
                </Text>
                <Text
                  typography="caption1-medium"
                  className="text-muted-foreground"
                >
                  잠시 후 다시 시도해주세요.
                </Text>
              </div>
            </CenteredState>
          ) : (
            <ReviewFilterContent reviewId={reviewId} />
          )}
        </PageShell.Content>
      </PageShell>
    </AuthGuard>
  )
}

function CenteredState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      {children}
    </div>
  )
}
