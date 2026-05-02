/**
 * 채팅방 목록의 lastMessageAt 표시용 시간 포맷.
 * shared/lib/format.ts 의 formatRelativeTime 과 다른 단계 — 채팅 UX 에 최적화된
 * 6단계 분기 (docs/app/chat.md 3.5).
 *
 * | 조건 | 표시 |
 * |------|------|
 * | 1분 이내 | "방금" |
 * | 1시간 이내 | "N분 전" |
 * | 오늘 | "오전/오후 H:MM" |
 * | 어제 | "어제" |
 * | 올해 | "M/D" |
 * | 작년 이전 | "YYYY/M/D" |
 */
export function formatChatTime(dateString: string): string {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ""

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return "방금"
  if (diffMin < 60) return `${diffMin}분 전`

  const isSameDay = isSameCalendarDay(date, now)
  if (isSameDay) return formatTimeOfDay(date)

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (isSameCalendarDay(date, yesterday)) return "어제"

  if (date.getFullYear() === now.getFullYear()) {
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatTimeOfDay(date: Date): string {
  const h = date.getHours()
  const m = String(date.getMinutes()).padStart(2, "0")
  const period = h < 12 ? "오전" : "오후"
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${period} ${h12}:${m}`
}
