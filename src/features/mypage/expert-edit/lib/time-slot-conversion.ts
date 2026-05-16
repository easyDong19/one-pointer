/**
 * 등록·수정 폼은 시간 슬롯을 "MORNING/AFTERNOON/EVENING" 키로 다루지만
 * 백엔드는 `{ startTime, endTime }` 형태로 받는다. 양방향 변환.
 */

export type SlotKey = "MORNING" | "AFTERNOON" | "EVENING"

const SLOT_TIMES: Record<SlotKey, { startTime: string; endTime: string }> = {
  MORNING: { startTime: "09:00", endTime: "12:00" },
  AFTERNOON: { startTime: "12:00", endTime: "18:00" },
  EVENING: { startTime: "18:00", endTime: "22:00" },
}

export function slotKeyToTimes(key: string): { startTime: string; endTime: string } | null {
  return SLOT_TIMES[key as SlotKey] ?? null
}

export function timesToSlotKey(startTime: string, endTime: string): SlotKey | null {
  for (const [key, range] of Object.entries(SLOT_TIMES) as [SlotKey, { startTime: string; endTime: string }][]) {
    if (range.startTime === startTime && range.endTime === endTime) return key
  }
  return null
}

export type FormSlot = { dayOfWeek: string; timeSlot: string }
export type ApiSlot = { dayOfWeek: string; startTime: string; endTime: string }

export function formSlotsToApi(slots: FormSlot[]): ApiSlot[] {
  return slots.flatMap((s) => {
    const t = slotKeyToTimes(s.timeSlot)
    return t ? [{ dayOfWeek: s.dayOfWeek, ...t }] : []
  })
}

export function apiSlotsToForm(slots: ApiSlot[]): FormSlot[] {
  return slots.flatMap((s) => {
    const k = timesToSlotKey(s.startTime, s.endTime)
    return k ? [{ dayOfWeek: s.dayOfWeek, timeSlot: k }] : []
  })
}
