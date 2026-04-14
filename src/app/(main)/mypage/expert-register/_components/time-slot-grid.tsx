"use client"

import { Check } from "lucide-react"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

type TimeSlot = {
  dayOfWeek: string
  timeSlot: string
}

type TimeSlotGridProps = {
  selectedSlots: TimeSlot[]
  onChange: (slots: TimeSlot[]) => void
}

const DAYS = [
  { key: "MONDAY", label: "월" },
  { key: "TUESDAY", label: "화" },
  { key: "WEDNESDAY", label: "수" },
  { key: "THURSDAY", label: "목" },
  { key: "FRIDAY", label: "금" },
  { key: "SATURDAY", label: "토" },
  { key: "SUNDAY", label: "일" },
]

const TIME_SLOTS = [
  { key: "MORNING", label: "오전", sub: "09-12" },
  { key: "AFTERNOON", label: "오후", sub: "12-18" },
  { key: "EVENING", label: "저녁", sub: "18-22" },
]

export function TimeSlotGrid({ selectedSlots, onChange }: TimeSlotGridProps) {
  const isSelected = (dayOfWeek: string, timeSlot: string) =>
    selectedSlots.some((s) => s.dayOfWeek === dayOfWeek && s.timeSlot === timeSlot)

  const handleToggle = (dayOfWeek: string, timeSlot: string) => {
    if (isSelected(dayOfWeek, timeSlot)) {
      onChange(
        selectedSlots.filter((s) => !(s.dayOfWeek === dayOfWeek && s.timeSlot === timeSlot)),
      )
    } else {
      onChange([...selectedSlots, { dayOfWeek, timeSlot }])
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="w-14 p-1" />
            {TIME_SLOTS.map((slot) => (
              <th key={slot.key} className="p-1 text-center">
                <Text as="span" typography="caption1-medium" className="text-muted-foreground">
                  {slot.label}
                </Text>
                <br />
                <Text as="span" typography="caption2-medium" className="text-muted-foreground/60">
                  {slot.sub}
                </Text>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS.map((day) => (
            <tr key={day.key}>
              <td className="p-1 text-center">
                <Text as="span" typography="caption1-medium">
                  {day.label}
                </Text>
              </td>
              {TIME_SLOTS.map((slot) => {
                const selected = isSelected(day.key, slot.key)
                return (
                  <td key={slot.key} className="p-1">
                    <button
                      type="button"
                      onClick={() => handleToggle(day.key, slot.key)}
                      className={cn(
                        "flex h-9 w-full items-center justify-center rounded-md transition-colors",
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80",
                      )}
                    >
                      {selected && <Check className="size-4" />}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
