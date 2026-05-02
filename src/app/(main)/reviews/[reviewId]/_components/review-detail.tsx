"use client"

import { Loader2 } from "lucide-react"

import { ReviewDetailContent } from "@/features/review/detail/ui/review-detail-content"
import { useReviewDetailQuery } from "@/features/review/detail/model/use-review-detail-query"
import { MobileHeader } from "@/shared/ui/mobile-header"
import { PageShell } from "@/shared/ui/page-shell"
import { Text } from "@/shared/ui/text"

type Props = {
  reviewId: number
}

export function ReviewDetail({ reviewId }: Props) {
  const { data, isLoading, isError } = useReviewDetailQuery(reviewId)

  return (
    <PageShell tier="content">
      <PageShell.Header>
        <MobileHeader>
          <MobileHeader.BackButton />
          <MobileHeader.Title>리뷰</MobileHeader.Title>
          <MobileHeader.Spacer />
        </MobileHeader>
      </PageShell.Header>
      <PageShell.Content>
        {isLoading ? (
          <CenteredState>
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
          </CenteredState>
        ) : isError || !data ? (
          <CenteredState>
            <div className="text-center">
              <Text typography="body1-bold" className="text-foreground mb-1">
                리뷰를 불러오지 못했어요
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
          <ReviewDetailContent review={data} />
        )}
      </PageShell.Content>
    </PageShell>
  )
}

function CenteredState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      {children}
    </div>
  )
}
