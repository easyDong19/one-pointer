/**
 * 메시지 버블 시간 표시 — "오전/오후 H:MM"
 * 24시간 기준 입력을 12시간 + 오전/오후 로 변환.
 */
export function formatBubbleTime(dateString: string | null | undefined): string {
  if (!dateString) return ""
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ""

  const h = date.getHours()
  const m = String(date.getMinutes()).padStart(2, "0")
  const period = h < 12 ? "오전" : "오후"
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${period} ${h12}:${m}`
}

/** 두 날짜가 같은 calendar day 인지 — DateSeparator 삽입 판단용 */
export function isSameCalendarDay(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  if (!a || !b) return false
  const da = new Date(a)
  const db = new Date(b)
  if (Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) return false
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  )
}

const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"]

/** "2026년 5월 2일 토요일" — DateSeparator 표시용 */
export function formatDateSeparator(dateString: string | null | undefined): string {
  if (!dateString) return ""
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ""
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  const w = WEEKDAY[date.getDay()]
  return `${y}년 ${m}월 ${d}일 ${w}요일`
}
