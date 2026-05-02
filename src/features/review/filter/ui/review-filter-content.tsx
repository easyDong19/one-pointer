"use client"

import { Fragment, useState } from "react"

import { isSameCalendarDay } from "@/entities/chat/lib/format-bubble-time"
import { DateSeparator } from "@/entities/chat/ui/date-separator"
import type { FilteringMessage } from "@/entities/review/api/review.schema"

import { openVisibilityReasonPicker } from "../lib/open-visibility-reason-picker"
import { useCompleteFilteringMutation } from "../model/use-complete-filtering-mutation"
import { useFilteringViewQuery } from "../model/use-filtering-view-query"
import { useSubmitRatingMutation } from "../model/use-submit-rating-mutation"
import { useToggleVisibilityMutation } from "../model/use-toggle-visibility-mutation"
import { FilterMessageRow } from "./filter-message-row"
import { FilterStatusBanner } from "./filter-status-banner"
import { FilterSubmitBar } from "./filter-submit-bar"

type Props = {
  reviewId: number
}

export function ReviewFilterContent({ reviewId }: Props) {
  const view = useFilteringViewQuery(reviewId)
  const toggle = useToggleVisibilityMutation(reviewId)
  const complete = useCompleteFilteringMutation(reviewId)
  const submitRating = useSubmitRatingMutation(reviewId)

  const [togglingId, setTogglingId] = useState<number | null>(null)

  if (view.isLoading) return null
  if (view.isError || !view.data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-muted-foreground text-sm">
          필터링 정보를 불러오지 못했어요.
        </div>
      </div>
    )
  }

  const data = view.data
  const messages = data.messages ?? []

  const handleToggle = async (msg: FilteringMessage) => {
    if (msg.messageId == null) return
    if (msg.visibility !== "PUBLIC") {
      // 본 MVP 에선 unhide 미지원 (API 동작 미확정).
      return
    }
    const reason = await openVisibilityReasonPicker()
    if (!reason) return
    setTogglingId(msg.messageId)
    try {
      await toggle.mutateAsync({ messageId: msg.messageId, payload: { reason } })
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="flex flex-col">
      <FilterStatusBanner view={data} />

      <section className="mt-4 flex flex-col py-2">
        {messages.map((msg, index) => {
          const prev = index > 0 ? messages[index - 1] : null
          const showDateSep =
            !prev || !isSameCalendarDay(msg.sentAt, prev.sentAt)
          return (
            <Fragment key={msg.messageId ?? `idx-${index}`}>
              {showDateSep && <DateSeparator date={msg.sentAt} />}
              <FilterMessageRow
                message={msg}
                isToggling={togglingId === msg.messageId}
                onToggleVisibility={() => handleToggle(msg)}
              />
            </Fragment>
          )
        })}
      </section>

      <FilterSubmitBar
        view={data}
        isCompleting={complete.isPending}
        isSubmittingRating={submitRating.isPending}
        onComplete={() => complete.mutate()}
        onSubmitRating={(rating) => submitRating.mutate(rating)}
      />
    </div>
  )
}
