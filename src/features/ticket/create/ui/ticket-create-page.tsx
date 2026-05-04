"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { MobileHeader } from "@/shared/ui/mobile-header"
import { PageShell } from "@/shared/ui/page-shell"

import { useCreateTicketMutation, type SubmitTicketInput } from "../model/use-create-ticket-mutation"
import { useStepFlow } from "../model/use-step-flow"
import { useTicketCreateForm } from "../model/use-ticket-create-form"
import {
  TicketCreateDesktopStepper,
  TicketCreateMobileStepper,
} from "./ticket-create-stepper"
import { TicketCreateFooter } from "./ticket-create-footer"
import { StepConfirm } from "./steps/step-confirm"
import { StepContent } from "./steps/step-content"
import { StepDesiredDate } from "./steps/step-desired-date"
import { StepTimeBudget } from "./steps/step-time-budget"
import { StepTypeCategory } from "./steps/step-type-category"

/**
 * Wave 1.5 wizard composer — 5 step Conversational Wizard.
 *
 * - 모바일: 헤더 + 원형 stepper + 풀스크린 step + sticky footer
 * - 데스크탑: max-w-5xl split (좌측 320px sticky stepper + 우측 main panel)
 *
 * 모바일 CreateTicketView 의 PageView (5개) + StepIndicatorWidget + BottomBar 와 동치.
 */
export function TicketCreatePage() {
  const router = useRouter()
  const { currentStep } = useStepFlow()
  const mutation = useCreateTicketMutation()
  const reset = useTicketCreateForm((s) => s.reset)

  const handleSubmit = async () => {
    const input = buildSubmitInput(useTicketCreateForm.getState())
    if (!input) {
      console.warn("[ticket-create] missing required fields at submit")
      toast.error("필수 항목이 누락되었어요")
      return
    }
    try {
      const ticket = await mutation.mutateAsync(input)
      toast.success("의뢰가 등록되었어요. 매칭이 완료되면 알려드릴게요")
      reset()
      router.push(`/tickets/${ticket.id}`)
    } catch {
      // useCreateTicketMutation 의 onError 가 토스트 처리
    }
  }

  return (
    <>
      <MobileHeader>
        <MobileHeader.BackButton />
        <MobileHeader.Title>의뢰 등록</MobileHeader.Title>
        <MobileHeader.Spacer />
      </MobileHeader>
      <TicketCreateMobileStepper />
      <PageShell tier="content">
        <PageShell.Content>
          <div className="flex gap-12">
            <TicketCreateDesktopStepper />
            <main className="flex min-w-0 flex-1 flex-col">
              <div
                key={currentStep}
                className="animate-in fade-in slide-in-from-bottom-2 flex flex-col gap-3 duration-200"
              >
                {currentStep === "type-category" && <StepTypeCategory />}
                {currentStep === "content" && <StepContent />}
                {currentStep === "time-budget" && <StepTimeBudget />}
                {currentStep === "desired-date" && <StepDesiredDate />}
                {currentStep === "confirm" && <StepConfirm />}
              </div>
              <TicketCreateFooter
                onSubmit={handleSubmit}
                isSubmitting={mutation.isPending}
              />
            </main>
          </div>
        </PageShell.Content>
      </PageShell>
    </>
  )
}

/**
 * store state → SubmitTicketInput. 필수 필드 missing 시 null.
 *
 * 모바일 controller.submit 과 동일:
 * - 협의 가능이면 estimatedDurationValue/Unit 둘 다 null
 * - RANGE 가 아니면 budgetMin/Max 둘 다 null
 * - desiredDates 는 date 가 채워진 행만, 없으면 undefined
 */
function buildSubmitInput(
  s: ReturnType<typeof useTicketCreateForm.getState>,
): SubmitTicketInput | null {
  if (
    s.ticketType == null ||
    s.subCategoryId == null ||
    !s.title.trim() ||
    !s.content.trim() ||
    s.level == null ||
    s.budgetType == null
  ) {
    return null
  }

  if (s.ticketType === "OFFLINE" && !s.region) return null

  const filledDates = s.desiredDates.filter((d) => d.date && d.timeSlot)

  return {
    ticketType: s.ticketType,
    subCategoryId: s.subCategoryId,
    title: s.title.trim(),
    content: s.content.trim(),
    level: s.level,
    estimatedDurationValue: s.isNegotiableDuration ? null : s.estimatedDurationValue,
    estimatedDurationUnit: s.isNegotiableDuration ? null : s.estimatedDurationUnit,
    budgetType: s.budgetType,
    budgetMin: s.budgetType === "RANGE" ? s.budgetMin : null,
    budgetMax: s.budgetType === "RANGE" ? s.budgetMax : null,
    region: s.ticketType === "OFFLINE" ? s.region : null,
    locationDetail:
      s.ticketType === "OFFLINE" && s.locationDetail.trim()
        ? s.locationDetail.trim()
        : null,
    desiredDates: filledDates.length > 0 ? filledDates : undefined,
    targetExpertId: s.targetExpertId ?? null,
    directRequest: s.directRequest || undefined,
    localImages: s.localImages,
  }
}
