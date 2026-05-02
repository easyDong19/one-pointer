"use client"

import type { ReviewDetail } from "@/entities/review/api/review.service"
import { Separator } from "@/shared/ui/separator"

import { ReviewHeader } from "./review-header"
import { ReviewReply } from "./review-reply"
import { ReviewSnapshotList } from "./review-snapshot-list"

type Props = {
  review: ReviewDetail
}

/**
 * 리뷰 상세 본문 컴포저.
 *
 * - **모바일/태블릿 (<lg)**: 단일 컬럼 stack — 헤더 → 스냅샷 → (있으면) 답변
 * - **데스크탑 (≥lg)**: 2 컬럼 grid — 좌측 sticky sidebar (메타데이터 + 답변) +
 *   우측 본문 (`max-w-2xl` 채팅 스냅샷)
 *
 * 정책: docs/design/LAYOUT.md §6.1 사이드바 sticky 패턴 (외곽 height 강제 X,
 * body window 스크롤). sidebar 가 viewport 보다 길어지면 자체 스크롤.
 */
export function ReviewDetailContent({ review }: Props) {
  return (
    <article className="flex flex-col gap-6 lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
      <aside
        className="flex flex-col gap-6 lg:scrollbar-none lg:sticky lg:top-14 lg:max-h-[calc(100dvh-3.5rem)] lg:self-start lg:overflow-y-auto lg:py-6"
      >
        <ReviewHeader review={review} />
        {review.expertReply && (
          <>
            <Separator />
            <ReviewReply reply={review.expertReply} />
          </>
        )}
      </aside>

      <main className="flex flex-col gap-6 lg:max-w-2xl lg:gap-0 lg:py-6">
        <Separator className="lg:hidden" />
        <ReviewSnapshotList messages={review.messages} />
      </main>
    </article>
  )
}
