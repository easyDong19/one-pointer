"use client"

import { useState } from "react"
import { CalendarIcon, Clock, Plus, X } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { Calendar } from "@/shared/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

import { useTicketCreateForm } from "../../model/use-ticket-create-form"
import { StepCard } from "../step-card"

/**
 * Step 4 — 모바일 Step4DesiredDateWidget 대응.
 *
 * 다중 행 (date + time + remove). 모두 선택 사항.
 * - 날짜: shadcn Calendar (single, ko-KR locale, 오늘 이전 비활성)
 * - 시간: 30분 간격 슬롯 그리드 (06:00 ~ 23:30)
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
          <DateRow
            key={idx}
            date={entry.date}
            timeSlot={entry.timeSlot}
            onDateChange={(v) => updateDesiredDate(idx, { date: v })}
            onTimeChange={(v) => updateDesiredDate(idx, { timeSlot: v })}
            onRemove={
              desiredDates.length > 1 ? () => removeDesiredDate(idx) : undefined
            }
          />
        ))}

        <button
          type="button"
          onClick={addDesiredDate}
          className="border-border text-muted-foreground hover:border-primary hover:text-primary mt-1 inline-flex items-center gap-1.5 self-start rounded-full border px-3.5 py-2 transition-colors"
        >
          <Plus className="size-3.5" />
          <Text typography="caption1-medium">날짜 추가</Text>
        </button>
      </div>
    </StepCard>
  )
}

function DateRow({
  date,
  timeSlot,
  onDateChange,
  onTimeChange,
  onRemove,
}: {
  date: string
  timeSlot: string
  onDateChange: (v: string) => void
  onTimeChange: (v: string) => void
  onRemove?: () => void
}) {
  return (
    <div className="border-border bg-card flex flex-col gap-2 rounded-xl border p-2.5 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <DateTrigger value={date} onChange={onDateChange} />
      </div>
      <div className="min-w-0 flex-1">
        <TimeTrigger value={timeSlot} onChange={onTimeChange} />
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="삭제"
          className="border-border text-muted-foreground hover:border-destructive hover:text-destructive flex size-9 shrink-0 items-center justify-center rounded-full border bg-white transition-colors self-end sm:self-auto"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}

// ─── Date Trigger ──────────────────────────────────────────────────────────

function DateTrigger({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = parseISODate(value)
  const today = startOfDay(new Date())

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-11 w-full justify-start gap-2 border-border bg-white px-3 font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="text-primary size-4 shrink-0" />
          <span className="truncate">
            {value ? formatDateChip(selected) : "날짜 선택"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected ?? undefined}
          onSelect={(d) => {
            if (!d) return
            onChange(toISODate(d))
            setOpen(false)
          }}
          disabled={(d) => d < today}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}

// ─── Time Trigger ──────────────────────────────────────────────────────────

function TimeTrigger({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-11 w-full justify-start gap-2 border-border bg-white px-3 font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <Clock className="text-primary size-4 shrink-0" />
          <span className="truncate">
            {value ? formatTimeChip(value) : "시간 선택"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[18rem] p-0">
        <TimeSlotGrid
          value={value}
          onSelect={(v) => {
            onChange(v)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

const TIME_SECTIONS: { label: string; slots: string[] }[] = [
  { label: "오전", slots: buildSlots(6, 11) },
  { label: "오후", slots: buildSlots(12, 17) },
  { label: "저녁", slots: buildSlots(18, 23) },
]

function TimeSlotGrid({
  value,
  onSelect,
}: {
  value: string
  onSelect: (slot: string) => void
}) {
  return (
    <div className="max-h-[20rem] overflow-y-auto p-3">
      {TIME_SECTIONS.map((section) => (
        <div key={section.label} className="mb-3 last:mb-0">
          <Text
            typography="caption2-bold"
            className="text-muted-foreground mb-1.5 block px-1"
          >
            {section.label}
          </Text>
          <div className="grid grid-cols-4 gap-1.5">
            {section.slots.map((slot) => {
              const active = slot === value
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onSelect(slot)}
                  className={cn(
                    "rounded-md py-1.5 text-sm tabular-nums transition-colors",
                    active
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  {slot}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function buildSlots(startHour: number, endHour: number): string[] {
  const out: string[] = []
  for (let h = startHour; h <= endHour; h++) {
    out.push(`${String(h).padStart(2, "0")}:00`)
    out.push(`${String(h).padStart(2, "0")}:30`)
  }
  return out
}

function startOfDay(d: Date): Date {
  const c = new Date(d)
  c.setHours(0, 0, 0, 0)
  return c
}

function parseISODate(s: string): Date | null {
  if (!s) return null
  const d = new Date(`${s}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

function toISODate(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function formatDateChip(d: Date | null): string {
  if (!d) return ""
  return d.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  })
}

function formatTimeChip(slot: string): string {
  const [hStr, mStr] = slot.split(":")
  const h = Number(hStr)
  const m = Number(mStr)
  if (Number.isNaN(h) || Number.isNaN(m)) return slot
  const ampm = h < 12 ? "오전" : "오후"
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${ampm} ${h12}:${String(m).padStart(2, "0")}`
}
