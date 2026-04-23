// ─── Label Maps ───────────────────────────────────────────────────────────────

export const TICKET_TYPE_LABEL: Record<string, { text: string; className: string }> = {
  ONLINE: { text: "온라인", className: "text-success-foreground bg-success/10" },
  OFFLINE: { text: "오프라인", className: "text-primary bg-primary-light" },
}

export const ACTIVITY_METHOD_LABEL: Record<string, string> = {
  OFFLINE: "오프라인",
  ONLINE: "온라인",
  BOTH: "온·오프라인",
}

// ─── Sort Options ─────────────────────────────────────────────────────────────

export const TICKET_SORT_OPTIONS = [
  { value: "LATEST", label: "최신순" },
  { value: "BUDGET_HIGH", label: "예산 높은순" },
  { value: "DEADLINE_SOON", label: "마감임박순" },
] as const

export const EXPERT_SORT_OPTIONS = [
  { value: "RATING_DESC", label: "별점순" },
  { value: "MATCH_COUNT_DESC", label: "매칭순" },
  { value: "LATEST", label: "최신순" },
] as const

// ─── Filter Options ───────────────────────────────────────────────────────────

export const TICKET_TYPE_FILTER = [
  { value: undefined, label: "전체" },
  { value: "OFFLINE" as const, label: "오프라인" },
  { value: "ONLINE" as const, label: "온라인" },
]

export const RATING_FILTER = [
  { value: undefined, label: "전체" },
  { value: 4, label: "4점 이상" },
  { value: 4.5, label: "4.5점 이상" },
]

export const ACTIVITY_METHOD_FILTER = [
  { value: undefined, label: "전체" },
  { value: "OFFLINE" as const, label: "오프라인" },
  { value: "ONLINE" as const, label: "온라인" },
  { value: "BOTH" as const, label: "온·오프라인" },
]
