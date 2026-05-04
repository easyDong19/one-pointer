import type {
  BudgetType,
  EstimatedDurationUnit,
  TicketLevel,
  TicketType,
} from "@/entities/ticket/api/ticket.schema"

/**
 * Wave 1.5 wizard 단계 — 모바일 CreateTicketView 와 동일.
 *
 * 1. type-category : 유형 + 카테고리 (+오프라인 위치)
 * 2. content       : 제목/설명/이미지/실력
 * 3. time-budget   : 시간 + 예산
 * 4. desired-date  : 희망 일시 (선택)
 * 5. confirm       : 최종 확인
 */
export type Step =
  | "type-category"
  | "content"
  | "time-budget"
  | "desired-date"
  | "confirm"

export const ALL_STEPS: ReadonlyArray<Step> = [
  "type-category",
  "content",
  "time-budget",
  "desired-date",
  "confirm",
]

export const STEP_LABELS: Record<Step, string> = {
  "type-category": "유형 & 카테고리",
  content: "의뢰 내용",
  "time-budget": "시간 & 예산",
  "desired-date": "희망 일시",
  confirm: "최종 확인",
}

// ─── Type options (Step 1) ──────────────────────────────────────────────

export const TICKET_TYPE_OPTIONS: ReadonlyArray<{
  value: TicketType
  label: string
  description: string
}> = [
  {
    value: "ONLINE",
    label: "온라인",
    description: "작업물을 전송하세요. 결제 대금은 에스크로 안전결제로 보호됩니다.",
  },
  {
    value: "OFFLINE",
    label: "오프라인",
    description: "직접 만나서 서비스를 받아요. 결제는 당사자 간 자유롭게 협의합니다.",
  },
]

// ─── Level chips (Step 2) ───────────────────────────────────────────────

export const LEVEL_OPTIONS: ReadonlyArray<{
  value: TicketLevel
  label: string
}> = [
  { value: "BEGINNER", label: "초급 (처음이에요)" },
  { value: "INTERMEDIATE", label: "중급 (기본은 알아요)" },
  { value: "ADVANCED", label: "고급 (실력 향상 목적)" },
]

// ─── Duration unit segments (Step 3) ────────────────────────────────────

export const DURATION_UNIT_OPTIONS: ReadonlyArray<{
  value: EstimatedDurationUnit
  label: string
  /** 모바일 DurationUnit.maxValue */
  maxValue: number | null
}> = [
  { value: "MINUTE", label: "분", maxValue: 60 },
  { value: "HOUR", label: "시간", maxValue: 24 },
  { value: "DAY", label: "일", maxValue: 31 },
  { value: "WEEK", label: "주", maxValue: 52 },
  { value: "MONTH", label: "개월", maxValue: 12 },
]

export function durationUnitLabel(unit: EstimatedDurationUnit): string {
  return DURATION_UNIT_OPTIONS.find((o) => o.value === unit)?.label ?? "-"
}

/**
 * 모바일 DurationUnit.format — "3시간", "30분" 등.
 */
export function formatEstimatedDuration(
  value: number | null,
  unit: EstimatedDurationUnit | null,
): string {
  if (value == null || unit == null) return "-"
  return `${value.toLocaleString("ko-KR")}${durationUnitLabel(unit)}`
}

// ─── Budget chips (Step 3) ──────────────────────────────────────────────

export const BUDGET_TYPE_OPTIONS: ReadonlyArray<{
  value: BudgetType
  label: string
}> = [
  { value: "RANGE", label: "범위 지정" },
  { value: "NEGOTIABLE", label: "협의 가능" },
]
