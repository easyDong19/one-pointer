export function formatBudget(min: number, max: number): string {
  const fmt = (n: number) => n.toLocaleString("ko-KR")
  if (min === max) return `${fmt(min)}원`
  return `${fmt(min)} ~ ${fmt(max)}원`
}

/** "2026.03.20" 형식 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}.${m}.${d}`
}

/** "2026-03-20" 형식 */
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/** 마감일까지 남은 일수 계산 (D-day) */
export function getDaysUntilDeadline(deadlineString: string): number {
  const deadline = new Date(deadlineString)
  const now = new Date()
  const diffMs = deadline.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export function formatRelativeTime(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "방금 전"
  if (diffMin < 60) return `${diffMin}분 전`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}시간 전`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay < 30) return `${diffDay}일 전`
  const diffMonth = Math.floor(diffDay / 30)
  if (diffMonth < 12) return `${diffMonth}개월 전`
  return `${Math.floor(diffMonth / 12)}년 전`
}
