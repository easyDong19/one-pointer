import type { z } from "zod/v4"

import type {
  reviewStatusSchema,
  ticketTypeSchema,
  visibilityReasonSchema,
} from "@/entities/review/api/review.schema"

type ReviewStatus = z.infer<typeof reviewStatusSchema>
type TicketType = z.infer<typeof ticketTypeSchema>
type VisibilityReason = z.infer<typeof visibilityReasonSchema>

export const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  SNAPSHOT_CREATED: "스냅샷 생성됨",
  FILTERING: "필터링 진행중",
  WAITING_RATING: "별점 대기",
  PUBLISHED: "공개됨",
  PUBLISHED_NO_RATING: "공개됨 (별점 없음)",
  HIDDEN: "비공개",
}

export const TICKET_TYPE_LABEL: Record<TicketType, string> = {
  ONLINE: "온라인",
  OFFLINE: "오프라인",
}

export const VISIBILITY_REASON_LABEL: Record<VisibilityReason, string> = {
  PERSONAL: "개인정보",
  SENSITIVE: "민감한 내용",
  OTHER: "기타",
}
