/**
 * Date → "YYYY-MM-DDT23:59:00" (로컬 KST 기준 — 모바일과 동일).
 * docs/app/chat.md §9.9.
 */
export function toServerDeadline(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}T23:59:00`
}

/**
 * "YYYY-MM-DDT..." → Date. 잘못된 입력은 Invalid Date 가 그대로 반환됨.
 */
export function parseServerDeadline(value: string): Date {
  return new Date(value)
}

/**
 * Date → "2026년 5월 10일".
 */
export function formatDeadlineKR(date: Date): string {
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
