"use client"

import { Fragment } from "react"
import { Check } from "lucide-react"

import { Text } from "@/shared/ui/text"
import { cn } from "@/shared/lib/utils"

import { STEP_LABELS, type Step } from "../lib/ticket-create.constants"
import { useStepFlow } from "../model/use-step-flow"
import { useTicketCreateForm } from "../model/use-ticket-create-form"

/**
 * 모바일 StepIndicatorWidget — 5개의 원형 + 사이를 잇는 선.
 *
 * mobile 패턴 (Row with [circle, line, circle, line, ..., circle]) — 라인은 Expanded
 * 로 남은 공간 균등 분배. circle 은 고정 크기. 헤더 아래 horizontal indicator 로 노출.
 */
export function TicketCreateMobileStepper() {
  const { steps, currentIndex, goTo } = useStepFlow()
  const completedSet = useCompletedStepSet()
  const isEdit = useTicketCreateForm((s) => s.mode === "edit")

  return (
    <div className="bg-background border-border flex items-center border-b px-6 py-4 md:hidden">
      {steps.map((step, idx) => {
        const isCompleted = completedSet.has(step) && idx < currentIndex
        const isCurrent = idx === currentIndex
        // edit 모드는 모든 스탭이 prefill 되어 있으므로 자유 점프 허용
        const canJump = isEdit || idx <= currentIndex || completedSet.has(step)

        return (
          <Fragment key={step}>
            <button
              type="button"
              disabled={!canJump}
              onClick={() => canJump && goTo(step)}
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
                isCompleted || isCurrent
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
                !canJump && "cursor-not-allowed",
              )}
              aria-label={`${idx + 1}. ${STEP_LABELS[step]}`}
            >
              {isCompleted ? (
                <Check className="size-4" strokeWidth={3} />
              ) : (
                <Text typography="caption1-bold">{idx + 1}</Text>
              )}
            </button>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "h-[2px] flex-1 transition-colors",
                  idx < currentIndex ? "bg-primary" : "bg-muted",
                )}
              />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}

/**
 * 데스크탑 좌측 sticky stepper sidebar — wave-1.5 plan §5 의 데스크탑 최적화.
 * 모바일과 동일 진행 시각화를 vertical 로.
 */
export function TicketCreateDesktopStepper() {
  const { steps, currentStep, currentIndex, totalCount, progress, goTo } =
    useStepFlow()
  const completedSet = useCompletedStepSet()
  const isEdit = useTicketCreateForm((s) => s.mode === "edit")

  return (
    <aside className="sticky top-20 hidden h-fit w-72 shrink-0 flex-col gap-6 md:flex">
      <div className="flex flex-col gap-2">
        <Text typography="caption2-medium" className="text-muted-foreground">
          STEP {currentIndex + 1} / {totalCount}
        </Text>
        <div className="bg-muted h-1 w-full overflow-hidden rounded-full">
          <div
            className="bg-primary h-full transition-[width] duration-300 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      <ol className="flex flex-col gap-1.5">
        {steps.map((step, idx) => {
          const isCurrent = step === currentStep
          const isCompleted = completedSet.has(step) && idx < currentIndex
          // edit 모드는 모든 스탭이 prefill 되어 있으므로 자유 점프 허용
          const canJump = isEdit || isCompleted || idx <= currentIndex

          return (
            <li key={step}>
              <button
                type="button"
                disabled={!canJump}
                onClick={() => canJump && goTo(step)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                  isCurrent
                    ? "bg-primary-light text-primary"
                    : canJump
                      ? "text-foreground hover:bg-accent"
                      : "text-muted-foreground/60",
                )}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full transition-colors",
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check className="size-3.5" strokeWidth={3} />
                  ) : (
                    <Text typography="caption2-bold">{idx + 1}</Text>
                  )}
                </span>
                <Text
                  typography={isCurrent ? "body2-bold" : "body2-medium"}
                  className="truncate"
                >
                  {STEP_LABELS[step]}
                </Text>
              </button>
            </li>
          )
        })}
      </ol>
    </aside>
  )
}

/**
 * step 이 완료되었는지 (입력값 충족 여부) — Stepper 의 ✓ 표시용.
 * useStepValidation 과 같은 규칙이지만 currentStep 무관.
 */
function useCompletedStepSet(): Set<Step> {
  const ticketType = useTicketCreateForm((s) => s.ticketType)
  const subCategoryId = useTicketCreateForm((s) => s.subCategoryId)
  const region = useTicketCreateForm((s) => s.region)

  const title = useTicketCreateForm((s) => s.title)
  const content = useTicketCreateForm((s) => s.content)
  const level = useTicketCreateForm((s) => s.level)

  const isNegotiableDuration = useTicketCreateForm((s) => s.isNegotiableDuration)
  const estimatedDurationValue = useTicketCreateForm(
    (s) => s.estimatedDurationValue,
  )
  const estimatedDurationUnit = useTicketCreateForm(
    (s) => s.estimatedDurationUnit,
  )
  const budgetType = useTicketCreateForm((s) => s.budgetType)
  const budgetMin = useTicketCreateForm((s) => s.budgetMin)
  const budgetMax = useTicketCreateForm((s) => s.budgetMax)

  const desiredDates = useTicketCreateForm((s) => s.desiredDates)

  const set = new Set<Step>()

  // type-category
  const typeCategoryOk =
    ticketType != null &&
    subCategoryId != null &&
    (ticketType !== "OFFLINE" || (region != null && region.length > 0))
  if (typeCategoryOk) set.add("type-category")

  // content
  if (title.trim() && content.trim() && level != null) set.add("content")

  // time-budget
  const durationOk =
    isNegotiableDuration ||
    (estimatedDurationValue != null &&
      estimatedDurationValue > 0 &&
      estimatedDurationUnit != null)
  const budgetOk =
    budgetType === "NEGOTIABLE" ||
    (budgetType === "RANGE" &&
      budgetMin != null &&
      budgetMax != null &&
      budgetMin <= budgetMax)
  if (durationOk && budgetOk) set.add("time-budget")

  // desired-date — 모든 행이 (date 없거나) (date 있고 timeSlot 도)
  if (desiredDates.every((d) => !d.date || d.timeSlot.length > 0))
    set.add("desired-date")

  return set
}
