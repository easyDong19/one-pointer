/**
 * 픽스처 시각은 "요청 시점 기준 상대값" 으로 만든다.
 * 그래야 언제 캡처해도 "3분 전", "D-2" 같은 상대 표기가 자연스럽게 나온다.
 */
const MINUTE = 60_000

function at(offsetMinutes: number): Date {
  return new Date(Date.now() + offsetMinutes * MINUTE)
}

/** ISO-8601 (UTC, `Z` 포함) */
export const minutesAgo = (m: number) => at(-m).toISOString()
export const hoursAgo = (h: number) => minutesAgo(h * 60)
export const daysAgo = (d: number) => minutesAgo(d * 60 * 24)
export const daysLater = (d: number) => at(d * 60 * 24).toISOString()

/** Spring LocalDateTime 형태 (`2026-10-07T13:20:00`, KST, 오프셋 없음) */
export function localDateTime(offsetMinutes: number): string {
  const kst = new Date(at(offsetMinutes).getTime() + 9 * 60 * MINUTE)
  return kst.toISOString().slice(0, 19)
}

/** `YYYY-MM-DD` (KST) */
export function localDate(offsetDays: number): string {
  return localDateTime(offsetDays * 60 * 24).slice(0, 10)
}
