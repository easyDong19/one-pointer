export const STATUS_LABEL: Record<
  string,
  { text: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  DRAFT: { text: "임시저장", variant: "secondary" },
  OPEN: { text: "모집중", variant: "default" },
  IN_REVIEW: { text: "검토중", variant: "default" },
  MATCHED: { text: "매칭 완료", variant: "secondary" },
  PAYMENT_PENDING: { text: "결제 대기", variant: "outline" },
  PAID: { text: "결제 완료", variant: "secondary" },
  IN_PROGRESS: { text: "진행중", variant: "default" },
  DELIVERED: { text: "전달 완료", variant: "secondary" },
  COMPLETED: { text: "완료", variant: "secondary" },
  CANCELLED: { text: "취소됨", variant: "destructive" },
  EXPIRED: { text: "만료됨", variant: "destructive" },
}

export const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "초급",
  INTERMEDIATE: "중급",
  ADVANCED: "고급",
}

export const TICKET_TYPE_LABEL: Record<string, string> = {
  ONLINE: "온라인",
  OFFLINE: "오프라인",
}

// ─── Edit 권한 ───────────────────────────────────────────────────────────────

/**
 * 의뢰 수정 가능 여부.
 *
 * 모바일 `MyTicketDetailView._navigateToEdit()` 와 1:1:
 * - `OPEN` (모집중): 수정 가능
 * - `IN_REVIEW` (제안서 받은 상태): 버튼은 노출하되 클릭 시 차단 + 안내
 * - 그 외 (MATCHED 이후): 버튼 자체 미노출
 *
 * 즉 "버튼 노출 여부" 와 "실제 수정 가능 여부" 는 다르다.
 */
export type EditAction =
  | { kind: "editable" }
  | { kind: "blocked"; message: string }
  | { kind: "hidden" }

export function getTicketEditAction(status: string): EditAction {
  if (status === "OPEN") return { kind: "editable" }
  if (status === "IN_REVIEW") {
    return {
      kind: "blocked",
      message: "이미 제안서를 받은 의뢰는 수정할 수 없어요",
    }
  }
  return { kind: "hidden" }
}
