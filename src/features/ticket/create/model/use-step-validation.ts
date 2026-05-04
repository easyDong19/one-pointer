"use client"

import { useTicketCreateForm } from "./use-ticket-create-form"
import { useStepFlow } from "./use-step-flow"

/**
 * 모바일 CreateTicketController.canGoNext 와 동일 로직.
 * 각 step 의 필수 입력이 충족되었는지를 단일 지점에서 판단.
 */
export function useStepValidation(): boolean {
  const { currentStep } = useStepFlow()

  const ticketType = useTicketCreateForm((s) => s.ticketType)
  const subCategoryId = useTicketCreateForm((s) => s.subCategoryId)
  const region = useTicketCreateForm((s) => s.region)

  const title = useTicketCreateForm((s) => s.title)
  const content = useTicketCreateForm((s) => s.content)
  const level = useTicketCreateForm((s) => s.level)

  const estimatedDurationValue = useTicketCreateForm(
    (s) => s.estimatedDurationValue,
  )
  const estimatedDurationUnit = useTicketCreateForm(
    (s) => s.estimatedDurationUnit,
  )
  const isNegotiableDuration = useTicketCreateForm((s) => s.isNegotiableDuration)
  const budgetType = useTicketCreateForm((s) => s.budgetType)
  const budgetMin = useTicketCreateForm((s) => s.budgetMin)
  const budgetMax = useTicketCreateForm((s) => s.budgetMax)

  const desiredDates = useTicketCreateForm((s) => s.desiredDates)

  switch (currentStep) {
    case "type-category": {
      if (ticketType == null || subCategoryId == null) return false
      if (ticketType === "OFFLINE") return region != null && region.length > 0
      return true
    }
    case "content":
      return title.trim().length > 0 && content.trim().length > 0 && level != null
    case "time-budget": {
      // 시간: 협의 가능이거나 (단위+값) 모두 있어야
      const durationOk =
        isNegotiableDuration ||
        (estimatedDurationValue != null &&
          estimatedDurationValue > 0 &&
          estimatedDurationUnit != null)
      if (!durationOk) return false
      if (budgetType == null) return false
      if (budgetType === "NEGOTIABLE") return true
      // RANGE — min/max 모두 입력 + min ≤ max
      return (
        budgetMin != null &&
        budgetMax != null &&
        budgetMin >= 0 &&
        budgetMin <= budgetMax
      )
    }
    case "desired-date":
      // 모바일: "날짜를 선택한 항목이 있으면 시간도 반드시 선택해야 함"
      return desiredDates.every((d) => !d.date || d.timeSlot.length > 0)
    case "confirm":
      return true
    default:
      return false
  }
}
