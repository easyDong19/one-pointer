"use client"

import { CalendarIcon, Clock, Plus, X } from "lucide-react"

import { Input } from "@/shared/ui/input"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

import { useTicketCreateForm } from "../../model/use-ticket-create-form"
import { StepCard } from "../step-card"

const todayStr = () => new Date().toISOString().slice(0, 10)

/**
 * Step 4 — 모바일 Step4DesiredDateWidget 와 동일.
 * 다중 행 (date + time + remove). 모두 선택 사항.
 *
 * 모바일은 bottom sheet 캘린더 + 휠 picker — web 에선 native HTML5
 * date / time input 사용 (데스크탑·모바일 모두 OS native picker).
 */
export function StepDesiredDate() {
  const desiredDates = useTicketCreateForm((s) => s.desiredDates)
  const updateDesiredDate = useTicketCreateForm((s) => s.updateDesiredDate)
  const removeDesiredDate = useTicketCreateForm((s) => s.removeDesiredDate)
  const addDesiredDate = useTicketCreateForm((s) => s.addDesiredDate)

  return (
    <StepCard
      title="희망 일시를 추가하세요"
      subtitle="가능한 날짜와 시간대를 추가하면 전문가 매칭이 빨라져요. (선택사항)"
    >
      <div className="flex flex-col gap-3">
        {desiredDates.map((entry, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-2 sm:flex-row sm:items-center"
          >
            <div className="border-border bg-card relative flex-1 rounded-md border">
              <Input
                type="date"
                value={entry.date}
                min={todayStr()}
                onChange={(e) =>
                  updateDesiredDate(idx, { date: e.target.value })
                }
                className="h-11 border-0 bg-transparent pr-9 shadow-none focus-visible:ring-0"
              />
              <CalendarIcon className="text-primary pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
            </div>

            <div className="border-border bg-card relative flex-1 rounded-md border">
              <Input
                type="time"
                value={entry.timeSlot}
                onChange={(e) =>
                  updateDesiredDate(idx, { timeSlot: e.target.value })
                }
                className="h-11 border-0 bg-transparent pr-9 shadow-none focus-visible:ring-0"
              />
              <Clock className="text-primary pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
            </div>

            {desiredDates.length > 1 && (
              <button
                type="button"
                onClick={() => removeDesiredDate(idx)}
                aria-label="삭제"
                className={cn(
                  "border-border text-muted-foreground hover:text-destructive flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors self-end sm:self-auto",
                )}
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addDesiredDate}
          className="border-border text-muted-foreground hover:border-primary hover:text-primary mt-1 inline-flex items-center gap-1 self-start rounded-md border px-3 py-2 transition-colors"
        >
          <Plus className="size-4" />
          <Text typography="caption1-medium">날짜 추가</Text>
        </button>
      </div>
    </StepCard>
  )
}
