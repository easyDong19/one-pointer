"use client"

import type { ChatBannerResponse } from "@/entities/chat/api/chat.schema"
import type { SenderType } from "@/entities/review/api/review.schema"
import type { TicketStatus } from "@/entities/ticket/api/ticket.schema"

import { AgreementNeededBanner } from "./banners/agreement-needed"
import { AgreementReproposeBanner } from "./banners/agreement-repropose"
import { DeadlineOverdueClientBanner } from "./banners/deadline-overdue-client"
import { DeadlineOverdueExpertBanner } from "./banners/deadline-overdue-expert"
import { DeliveryNeededBanner } from "./banners/delivery-needed"
import { DeliveryRevisionNeededBanner } from "./banners/delivery-revision-needed"
import { DisputeInProgressBanner } from "./banners/dispute-in-progress"
import { DisputeResolvedBanner } from "./banners/dispute-resolved"
import { OfflineCompleteNeededBanner } from "./banners/offline-complete-needed"
import { OfflineWaitingCompleteBanner } from "./banners/offline-waiting-complete"
import { PaymentPendingBanner } from "./banners/payment-pending"
import { RefundInProgressBanner } from "./banners/refund-in-progress"
import { ReviewPendingBanner } from "./banners/review-pending"
import { ServiceInProgressBanner } from "./banners/service-in-progress"

type Props = {
  banner: ChatBannerResponse | null | undefined
  /** Wave 3+ mutation 들의 invalidate 키 — chat detail */
  roomId: string
  /** ChatRoomDetail.myRole — NONE §5.4 / REFUND 분기에 사용 */
  myRole?: SenderType | null
  /** ChatRoomDetail.ticketProgress.currentStatus — NONE §5.4 안내 분기에 사용 */
  ticketStatus?: TicketStatus | null
  /**
   * ChatRoomDetail.ticketProgress.ticketId — 배너 응답의 `ticketId` 가 null 로
   * 내려올 때의 fallback. 모바일(ChatRoomController.ticketId)과 동일하게
   * 배너 액션은 배너가 아닌 ticketProgress 의 ticketId 를 신뢰한다.
   */
  fallbackTicketId?: number | null
}

/**
 * `ChatBannerResponse.type` 기반 라우팅. docs/app/chat.md §5 의 매트릭스를 그대로 따른다.
 *
 * 명세 분기:
 * - **NONE / null** — §5.4 조건부 안내 (`myRole === "CLIENT"` && ticketStatus IN_PROGRESS|PAID)
 *   에 한해 ServiceInProgressBanner 표시. 그 외엔 비표시.
 * - **AGREEMENT_WAITING / PAYMENT_WAITING / DELIVERY_SUBMITTED** — §5.2 "표시 안 함 (대기 상태)".
 *   해당 액션은 합의서/작업물 메시지 카드 탭으로 진입.
 * - **나머지 13 종** — 각 컴포넌트로 라우팅.
 *
 * default 의 `_exhaustive: never` 로 enum 추가 시 컴파일 에러로 누락을 알린다.
 */
export function BannerDispatcher({
  banner: rawBanner,
  roomId,
  myRole,
  ticketStatus,
  fallbackTicketId,
}: Props) {
  if (!rawBanner) return null
  // 배너 응답의 ticketId 가 null 이면 ticketProgress 의 ticketId 로 보정해
  // 하위 배너들이 일관되게 banner.ticketId 만 보고도 동작하도록 한다.
  const banner: ChatBannerResponse = {
    ...rawBanner,
    ticketId: rawBanner.ticketId ?? fallbackTicketId ?? null,
  }
  const type = banner.type

  if (!type || type === "NONE") {
    if (
      myRole === "CLIENT" &&
      (ticketStatus === "IN_PROGRESS" || ticketStatus === "PAID")
    ) {
      return <ServiceInProgressBanner />
    }
    return null
  }

  // 대기 상태 — 배너 미표시 (액션은 메시지 카드 탭)
  if (
    type === "AGREEMENT_WAITING" ||
    type === "PAYMENT_WAITING" ||
    type === "DELIVERY_SUBMITTED"
  ) {
    return null
  }

  switch (type) {
    case "AGREEMENT_NEEDED":
      return <AgreementNeededBanner banner={banner} />
    case "AGREEMENT_REPROPOSE":
      return <AgreementReproposeBanner banner={banner} />
    case "PAYMENT_PENDING":
      return <PaymentPendingBanner banner={banner} />
    case "DELIVERY_NEEDED":
      return <DeliveryNeededBanner banner={banner} />
    case "DELIVERY_REVISION_NEEDED":
      return <DeliveryRevisionNeededBanner banner={banner} />
    case "DEADLINE_OVERDUE_CLIENT":
      return <DeadlineOverdueClientBanner banner={banner} />
    case "DEADLINE_OVERDUE_EXPERT":
      return <DeadlineOverdueExpertBanner banner={banner} />
    case "OFFLINE_COMPLETE_NEEDED":
      return <OfflineCompleteNeededBanner banner={banner} roomId={roomId} />
    case "OFFLINE_WAITING_COMPLETE":
      return <OfflineWaitingCompleteBanner banner={banner} />
    case "REVIEW_PENDING":
      return <ReviewPendingBanner banner={banner} />
    case "REFUND_IN_PROGRESS":
      return <RefundInProgressBanner banner={banner} myRole={myRole ?? null} />
    case "DISPUTE_IN_PROGRESS":
      return <DisputeInProgressBanner banner={banner} />
    case "DISPUTE_RESOLVED":
      return <DisputeResolvedBanner banner={banner} />
    default: {
      const _exhaustive: never = type
      console.warn("[banner] unknown type", _exhaustive)
      return null
    }
  }
}
