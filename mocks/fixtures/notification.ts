import type { notificationListResponseSchema } from "@/entities/notification/api/notification.schema"
import type { EnvelopeData } from "../lib/respond"
import { hoursAgo, minutesAgo } from "../lib/time"
import { SCENARIO, expertById } from "../world"

type NotificationData = EnvelopeData<typeof notificationListResponseSchema>["content"][number]

/**
 * ME 의 알림함 — 최근 일주일. 딥링크(targetType/targetId/roomId)는 모두 시나리오 ID 를 가리킨다.
 * createdAt 은 ISO-Z(절대 시각) — "12분 전" 같은 상대 표기가 브라우저 TZ 와 무관하게 맞도록.
 */
export function notifications(): NotificationData[] {
  const hero = SCENARIO.hero
  const guitar = SCENARIO.guitar
  const logo = SCENARIO.logo
  const heroExpert = expertById(hero.expertProfileId).nickname
  const [g1, g2, g3] = guitar.expertProfileIds.map((id) => expertById(id).nickname)
  const logoExpert = expertById(logo.expertProfileId).nickname
  const settledTicketId = SCENARIO.expertSide.ticketIds[2]

  return [
    {
      id: 9014,
      type: "CHAT_MESSAGE",
      targetType: "TICKET",
      targetId: hero.ticketId,
      roomId: hero.roomId,
      title: `${heroExpert}님의 새 메시지`,
      body: "수정 요청하실 부분 있으면 타임코드랑 같이 편하게 남겨주세요 :)",
      isRead: false,
      createdAt: minutesAgo(12),
    },
    {
      id: 9013,
      type: "DELIVERY_SUBMITTED",
      targetType: "TICKET",
      targetId: hero.ticketId,
      roomId: hero.roomId,
      title: "작업물이 도착했어요",
      body: `${heroExpert}님이 '브이로그 영상 편집' 의뢰의 작업물을 제출했어요. 검수 후 승인해주세요.`,
      isRead: false,
      createdAt: hoursAgo(3),
    },
    {
      id: 9012,
      type: "PROPOSAL_RECEIVED",
      targetType: "PROPOSAL",
      targetId: guitar.proposalIds[2],
      roomId: null,
      title: "새 제안서가 도착했어요",
      body: `${g3}님이 통기타 핑거스타일 원포인트 레슨 의뢰에 제안서를 보냈어요.`,
      isRead: false,
      createdAt: hoursAgo(5),
    },
    {
      id: 9011,
      type: "DIRECT_REQUEST_RECEIVED",
      targetType: "TICKET",
      targetId: SCENARIO.expertSide.directRequestTicketId,
      roomId: null,
      title: "1:1 직접 요청을 받았어요",
      body: "의뢰인이 원포인터님께 '카페 홍보 릴스 영상 편집 (30초 × 3편)'을 직접 요청했어요. 48시간 안에 응답해주세요.",
      isRead: false,
      createdAt: hoursAgo(8),
    },
    {
      id: 9010,
      type: "REVIEW_PUBLISHED",
      targetType: "REVIEW",
      targetId: logo.reviewId,
      roomId: null,
      title: "리뷰가 공개되었어요",
      body: `${logoExpert}님과의 '카페 로고 디자인 원포인트 피드백' 대화가 리뷰로 공개되었어요.`,
      isRead: false,
      createdAt: hoursAgo(26),
    },
    {
      id: 9009,
      type: "PROPOSAL_RECEIVED",
      targetType: "PROPOSAL",
      targetId: guitar.proposalIds[1],
      roomId: null,
      title: "새 제안서가 도착했어요",
      body: `${g2}님이 통기타 핑거스타일 원포인트 레슨 의뢰에 제안서를 보냈어요.`,
      isRead: false,
      createdAt: hoursAgo(30),
    },
    {
      id: 9008,
      type: "EXPERT_REPLY",
      targetType: "REVIEW",
      targetId: logo.reviewId,
      roomId: null,
      title: "전문가가 리뷰에 답변을 남겼어요",
      body: `${logoExpert}님: "카페 오픈하면 꼭 커피 마시러 들를게요! ☕"`,
      isRead: true,
      createdAt: hoursAgo(44),
    },
    {
      id: 9007,
      type: "ESCROW_PAYMENT_COMPLETED",
      targetType: "TICKET",
      targetId: hero.ticketId,
      roomId: hero.roomId,
      title: "결제가 완료되었어요",
      body: "에스크로 결제 150,000원이 완료되었어요. 작업물을 승인하기 전까지 안전하게 보관돼요.",
      isRead: true,
      createdAt: hoursAgo(52),
    },
    {
      id: 9006,
      type: "AGREEMENT_CONFIRMED",
      targetType: "TICKET",
      targetId: hero.ticketId,
      roomId: hero.roomId,
      title: "합의가 확정되었어요",
      body: `${heroExpert}님과 작업 범위 · 일정 · 금액 합의를 마쳤어요. 결제를 진행해주세요.`,
      isRead: true,
      createdAt: hoursAgo(54),
    },
    {
      id: 9005,
      type: "ESCROW_SETTLED",
      targetType: "TICKET",
      targetId: settledTicketId,
      roomId: null,
      title: "정산이 완료되었어요",
      body: "'기타 커버 영상 멀티캠 싱크 편집' 작업 대금 86,850원이 정산 계좌로 입금되었어요.",
      isRead: true,
      createdAt: hoursAgo(76),
    },
    {
      id: 9004,
      type: "TICKET_MATCHED_CLIENT",
      targetType: "TICKET",
      targetId: hero.ticketId,
      roomId: hero.roomId,
      title: "매칭이 성사되었어요",
      body: `${heroExpert}님의 제안을 선택했어요. 채팅방에서 세부 내용을 조율해보세요.`,
      isRead: true,
      createdAt: hoursAgo(98),
    },
    {
      id: 9003,
      type: "PROPOSAL_RECEIVED",
      targetType: "PROPOSAL",
      targetId: guitar.proposalIds[0],
      roomId: null,
      title: "새 제안서가 도착했어요",
      body: `${g1}님이 통기타 핑거스타일 원포인트 레슨 의뢰에 제안서를 보냈어요.`,
      isRead: true,
      createdAt: hoursAgo(110),
    },
    {
      id: 9002,
      type: "COUPON_EXPIRING",
      targetType: "NONE",
      targetId: null,
      roomId: null,
      title: "이용권이 곧 만료돼요",
      body: "첫 의뢰 10% 할인 이용권이 3일 뒤 만료돼요. 잊지 말고 사용해보세요!",
      isRead: true,
      createdAt: hoursAgo(130),
    },
    {
      id: 9001,
      type: "ADMIN_NOTICE",
      targetType: "NONE",
      targetId: null,
      roomId: null,
      title: "[공지] 원포인터 10월 업데이트 안내",
      body: "리뷰 필터링 기간이 3일로 늘어나고, 채팅에서 사진을 여러 장 한 번에 보낼 수 있게 되었어요.",
      isRead: true,
      createdAt: hoursAgo(150),
    },
  ]
}

export function unreadNotificationCount(): number {
  return notifications().filter((n) => !n.isRead).length
}
