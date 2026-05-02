"use client"

import { Calendar, Check, Clock } from "lucide-react"

import type { FilteringView } from "@/entities/review/api/review.service"
import { REVIEW_STATUS_LABEL } from "@/entities/review/lib/review.constants"
import { Text } from "@/shared/ui/text"
import { formatDate } from "@/shared/lib/format"
import { cn } from "@/shared/lib/utils"

type Props = {
  view: FilteringView
}

export function FilterStatusBanner({ view }: Props) {
  const status = view.status ?? "FILTERING"
  const myDone = view.myFilteringCompleted ?? false
  const otherDone = view.otherFilteringCompleted ?? false

  return (
    <section className="border-border bg-muted/30 flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex items-center gap-2">
        <Text typography="caption1-bold" className="text-primary">
          {REVIEW_STATUS_LABEL[status]}
        </Text>
        {view.filteringDeadline && (
          <span className="text-muted-foreground inline-flex items-center gap-1 text-xs tabular-nums">
            <Calendar className="h-3 w-3" />
            <Text as="span" typography="caption2-medium">
              마감 {formatDate(view.filteringDeadline)}
            </Text>
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <CompletionPill done={myDone} label="본인" />
        <CompletionPill done={otherDone} label="상대방" />
      </div>

      {myDone && !otherDone && (
        <Text typography="caption2-medium" className="text-muted-foreground">
          상대방이 필터링을 완료해야 리뷰가 공개됩니다.
        </Text>
      )}
    </section>
  )
}

function CompletionPill({ done, label }: { done: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs",
        done
          ? "bg-primary-light text-primary"
          : "bg-background border-border text-muted-foreground border",
      )}
    >
      {done ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
      <Text as="span" typography="caption2-medium">
        {label} {done ? "완료" : "미완료"}
      </Text>
    </span>
  )
}
