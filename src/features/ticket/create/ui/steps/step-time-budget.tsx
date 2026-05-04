"use client"

import { Check } from "lucide-react"

import { Input } from "@/shared/ui/input"
import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

import {
  BUDGET_TYPE_OPTIONS,
  DURATION_UNIT_OPTIONS,
  formatEstimatedDuration,
} from "../../lib/ticket-create.constants"
import { formatBudget, parseBudget } from "../../lib/format-budget"
import { useTicketCreateForm } from "../../model/use-ticket-create-form"
import { StepCard } from "../step-card"

/**
 * Step 3 — 모바일 Step3TimeBudgetWidget 와 동일:
 * - 희망 소요 시간: 단위 segmented + 숫자 input + 미리보기 + "협의 가능" 체크박스
 * - 예산: 협의 가능 / 범위 chips → 범위일 때만 min ~ max 입력
 */
export function StepTimeBudget() {
  const durationValue = useTicketCreateForm((s) => s.estimatedDurationValue)
  const durationUnit = useTicketCreateForm((s) => s.estimatedDurationUnit)
  const isNegotiableDuration = useTicketCreateForm((s) => s.isNegotiableDuration)
  const budgetType = useTicketCreateForm((s) => s.budgetType)
  const budgetMin = useTicketCreateForm((s) => s.budgetMin)
  const budgetMax = useTicketCreateForm((s) => s.budgetMax)
  const setField = useTicketCreateForm((s) => s.setField)
  const setBudgetType = useTicketCreateForm((s) => s.setBudgetType)
  const setNegotiableDuration = useTicketCreateForm((s) => s.setNegotiableDuration)

  const currentUnitOption = DURATION_UNIT_OPTIONS.find((o) => o.value === durationUnit)

  const handleDurationValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "")
    const n = raw ? parseInt(raw, 10) : null
    if (n != null && currentUnitOption?.maxValue != null && n > currentUnitOption.maxValue) {
      setField("estimatedDurationValue", currentUnitOption.maxValue)
      return
    }
    setField("estimatedDurationValue", n)
  }

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = parseBudget(e.target.value)
    setField("budgetMin", n > 0 ? n : null)
  }

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = parseBudget(e.target.value)
    setField("budgetMax", n > 0 ? n : null)
  }

  const minText = budgetMin != null ? formatBudget(budgetMin) : ""
  const maxText = budgetMax != null ? formatBudget(budgetMax) : ""
  const isInvalidRange =
    budgetType === "RANGE" &&
    budgetMin != null &&
    budgetMax != null &&
    budgetMin > budgetMax

  return (
    <StepCard
      title="희망 시간과 예산"
      subtitle="전문가가 제안서를 작성할 때 참고합니다."
    >
      <div className="flex flex-col gap-6">
        {/* 희망 소요 시간 */}
        <div className="flex flex-col gap-3">
          <Text
            as="label"
            typography="body3-bold"
            className="flex items-baseline gap-0.5"
          >
            희망 소요 시간<span className="text-destructive">*</span>
          </Text>

          {!isNegotiableDuration && (
            <>
              {/* 단위 세그먼트 */}
              <div className="border-border flex overflow-hidden rounded-md border">
                {DURATION_UNIT_OPTIONS.map((opt, idx) => {
                  const selected = durationUnit === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setField("estimatedDurationUnit", opt.value)
                        // 새 단위의 maxValue 초과 시 클램프
                        if (
                          durationValue != null &&
                          opt.maxValue != null &&
                          durationValue > opt.maxValue
                        ) {
                          setField("estimatedDurationValue", opt.maxValue)
                        }
                      }}
                      className={cn(
                        "flex-1 py-2.5 text-center transition-colors",
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-foreground hover:bg-accent",
                        idx < DURATION_UNIT_OPTIONS.length - 1 && "border-border border-r",
                      )}
                    >
                      <Text
                        typography={selected ? "caption1-bold" : "caption1-medium"}
                      >
                        {opt.label}
                      </Text>
                    </button>
                  )
                })}
              </div>

              {/* 숫자 입력 */}
              <Input
                inputMode="numeric"
                value={durationValue?.toString() ?? ""}
                onChange={handleDurationValueChange}
                placeholder={
                  currentUnitOption
                    ? currentUnitOption.maxValue != null
                      ? `${currentUnitOption.label} 수를 입력하세요 (최대 ${currentUnitOption.maxValue})`
                      : `${currentUnitOption.label} 수를 입력하세요`
                    : "값을 입력하세요"
                }
                className="h-11 text-center tabular-nums"
              />

              {/* 미리보기 */}
              {durationValue != null && durationUnit != null && (
                <div className="bg-primary-light flex items-center justify-center rounded-md py-2">
                  <Text typography="body3-bold" className="text-primary tabular-nums">
                    {formatEstimatedDuration(durationValue, durationUnit)}
                  </Text>
                </div>
              )}
            </>
          )}

          {/* 협의 가능 체크박스 */}
          <button
            type="button"
            onClick={() => setNegotiableDuration(!isNegotiableDuration)}
            className="flex items-center gap-2 self-start"
          >
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded border-2 transition-colors",
                isNegotiableDuration
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background",
              )}
            >
              {isNegotiableDuration && <Check className="size-3" strokeWidth={3} />}
            </span>
            <Text
              typography="body3-medium"
              className={isNegotiableDuration ? "text-primary" : "text-foreground"}
            >
              협의 가능
            </Text>
          </button>
        </div>

        {/* 예산 */}
        <div className="flex flex-col gap-3">
          <Text
            as="label"
            typography="body3-bold"
            className="flex items-baseline gap-0.5"
          >
            예산<span className="text-destructive">*</span>
          </Text>
          <div className="flex flex-wrap gap-2">
            {BUDGET_TYPE_OPTIONS.map((opt) => {
              const selected = budgetType === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBudgetType(opt.value)}
                  className={cn(
                    "rounded-full border-2 px-4 py-2 transition-colors",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/40",
                  )}
                >
                  <Text typography="caption1-medium">{opt.label}</Text>
                </button>
              )
            })}
          </div>

          {budgetType === "RANGE" && (
            <>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    inputMode="numeric"
                    value={minText}
                    onChange={handleMinChange}
                    placeholder="최소 금액"
                    className="h-11 pr-9 text-center tabular-nums"
                  />
                  <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm">
                    원
                  </span>
                </div>
                <Text typography="body2-regular" className="text-muted-foreground">
                  ~
                </Text>
                <div className="relative flex-1">
                  <Input
                    inputMode="numeric"
                    value={maxText}
                    onChange={handleMaxChange}
                    placeholder="최대 금액"
                    className="h-11 pr-9 text-center tabular-nums"
                  />
                  <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-sm">
                    원
                  </span>
                </div>
              </div>
              {isInvalidRange ? (
                <Text typography="caption2-medium" className="text-destructive">
                  최대 금액이 최소 금액보다 커야 해요.
                </Text>
              ) : (
                <Text typography="caption2-medium" className="text-muted-foreground">
                  단위: 원 (예: 30,000 ~ 50,000)
                </Text>
              )}
            </>
          )}
        </div>
      </div>
    </StepCard>
  )
}
