/**
 * 1500000 → "1,500,000"
 */
export function formatPrice(value: number | string): string {
  const n = typeof value === "string" ? parsePrice(value) : value
  if (!Number.isFinite(n)) return ""
  return n.toLocaleString("ko-KR")
}

/**
 * "1,500,000" 또는 "1500000" → 1500000. 비정상 값은 0.
 */
export function parsePrice(value: string): number {
  const cleaned = value.replace(/,/g, "").trim()
  if (!cleaned) return 0
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : 0
}
