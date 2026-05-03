import type { ChatBannerType } from "@/entities/chat/api/chat.schema"

export type BannerTone = "primary" | "destructive" | "warning" | "info"

/**
 * 18종 ChatBannerType 의 표시 톤.
 *
 * - primary: 사용자 액션을 유도 (합의서 작성·결제·작업물 제출 등)
 * - destructive: 환불/분쟁 등 부정적 분기
 * - warning: 마감 초과·환불 진행 중 등 주의 환기
 * - info: 상대방 시점 안내 / 종결 안내 (행동 불요)
 *
 * 톤 결정의 source of truth: docs/plan/wave-2-banners.md §매트릭스
 */
export const BANNER_TONE: Record<ChatBannerType, BannerTone> = {
  NONE: "info",
  // 합의서
  AGREEMENT_NEEDED: "primary",
  AGREEMENT_REPROPOSE: "primary",
  AGREEMENT_WAITING: "primary",
  // 결제
  PAYMENT_PENDING: "primary",
  PAYMENT_WAITING: "info",
  // 작업물
  DELIVERY_NEEDED: "primary",
  DELIVERY_REVISION_NEEDED: "primary",
  DELIVERY_SUBMITTED: "primary",
  // 마감 초과
  DEADLINE_OVERDUE_CLIENT: "destructive",
  DEADLINE_OVERDUE_EXPERT: "warning",
  // 오프라인
  OFFLINE_COMPLETE_NEEDED: "primary",
  OFFLINE_WAITING_COMPLETE: "info",
  // 리뷰
  REVIEW_PENDING: "primary",
  // 환불
  REFUND_IN_PROGRESS: "warning",
  // 분쟁
  DISPUTE_IN_PROGRESS: "destructive",
  DISPUTE_RESOLVED: "info",
}

/** Wave 2 stub: CTA 클릭 시 공통 메시지 (Wave 3 에서 mutation/페이지로 교체). */
export const STUB_TOAST_MESSAGE = "준비 중입니다"
