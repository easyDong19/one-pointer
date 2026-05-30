"use client"

import { CalendarDays } from "lucide-react"

import type { ProposalDetail } from "@/entities/proposal/api/proposal.schema"
import { Text } from "@/shared/ui/text"
import { formatDate } from "@/shared/lib/format"

type Props = {
  dates: NonNullable<ProposalDetail["availableDates"]>
}

/** 가능 일정 섹션. 모바일 앱은 팝업으로 표시하나, 웹에서는 목록으로 인라인 표시. */
export function ProposalSchedule({ dates }: Props) {
  return (
    <section className="bg-card border-border rounded-2xl border p-5 shadow-sm md:p-6">
      <div className="flex items-center gap-2">
        <CalendarDays className="text-muted-foreground h-4 w-4" />
        <Text as="h2" typography="body3-bold" className="text-foreground">
          가능 일정
        </Text>
        <Text typography="caption1-medium" className="text-muted-foreground">
          {dates.length}건
        </Text>
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {dates.map((d, i) => (
          <li
            key={`${d.availableDate}-${i}`}
            className="bg-muted flex items-center justify-between rounded-lg px-3.5 py-2.5"
          >
            <Text typography="body3-medium" className="text-foreground tabular-nums">
              {formatDate(d.availableDate)}
            </Text>
            {d.timeSlot && (
              <Text
                typography="caption1-medium"
                className="text-muted-foreground tabular-nums"
              >
                {d.timeSlot}
              </Text>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
