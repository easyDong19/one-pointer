import type { UpdateTicketRequest } from "@/entities/ticket/api/ticket.schema"
import type { useTicketCreateForm } from "@/features/ticket/create/model/use-ticket-create-form"

export type SubmitUpdateInput = UpdateTicketRequest & {
  ticketId: number
  /** 신규 업로드 파일 (uploadImages 호출 전) */
  localImages: File[]
  /** 사용자가 유지하기로 한 기존 이미지 URL — 신규 업로드 결과와 합쳐 최종 imageUrls 가 됨 */
  existingImageUrls: string[]
}

/**
 * store state → SubmitUpdateInput. 필수 필드 missing 시 null.
 *
 * 모바일 controller.submit (edit branch) 와 동일:
 * - 협의 가능이면 estimatedDurationValue/Unit 둘 다 null
 * - RANGE 가 아니면 budgetMin/Max 둘 다 null
 * - desiredDates 는 date·time 둘 다 채워진 행만, 없으면 undefined
 * - imageUrls 는 mutation 내부에서 existingImageUrls + 신규 업로드 URL 로 합성
 */
export function buildUpdatePayload(
  s: ReturnType<typeof useTicketCreateForm.getState>,
): SubmitUpdateInput | null {
  if (s.editingTicketId == null) return null
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
    ticketId: s.editingTicketId,
    ticketType: s.ticketType,
    subCategoryId: s.subCategoryId,
    title: s.title.trim(),
    content: s.content.trim(),
    level: s.level,
    estimatedDurationValue: s.isNegotiableDuration
      ? null
      : s.estimatedDurationValue,
    estimatedDurationUnit: s.isNegotiableDuration
      ? null
      : s.estimatedDurationUnit,
    budgetType: s.budgetType,
    budgetMin: s.budgetType === "RANGE" ? s.budgetMin : null,
    budgetMax: s.budgetType === "RANGE" ? s.budgetMax : null,
    region: s.ticketType === "OFFLINE" ? s.region : null,
    locationDetail:
      s.ticketType === "OFFLINE" && s.locationDetail.trim()
        ? s.locationDetail.trim()
        : null,
    desiredDates: filledDates.length > 0 ? filledDates : undefined,
    localImages: s.localImages,
    existingImageUrls: s.existingImageUrls,
  }
}
