/**
 * 1500000 → "1,500,000". features/agreement/lib/format-price 와 동일 동작 — 추후 shared 추출 검토.
 */
export function formatBudget(value: number | string): string {
  const n = typeof value === "string" ? parseBudget(value) : value
  if (!Number.isFinite(n)) return ""
  return n.toLocaleString("ko-KR")
}

/**
 * "1,500,000" 또는 "1500000" → 1500000. 비정상은 0.
 */
export function parseBudget(value: string): number {
  const cleaned = value.replace(/,/g, "").trim()
  if (!cleaned) return 0
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}
