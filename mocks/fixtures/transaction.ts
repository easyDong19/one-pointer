import type { z } from "zod/v4"

import type { agreementSchema } from "@/entities/agreement/api/agreement.schema"
import type { deliverySchema } from "@/entities/delivery/api/delivery.schema"
import type {
  disputeSchema,
  eligibleTransactionSchema,
  myDisputeDetailSchema,
  myDisputeListItemSchema,
} from "@/entities/dispute/api/dispute.schema"
import type { escrowPaymentSchema, escrowRefundSchema } from "@/entities/payment/api/payment.schema"

import { asset } from "../lib/assets"
import { minutesAgo } from "../lib/time"
import { ME } from "../world"
import {
  DEALS,
  JUN_HO,
  SEO_YEON,
  SU_A,
  WEEKEND_VLOGGER,
  deadlineAt,
  kstAt,
  kstDateCompact,
  mockFile,
} from "./chat-scenario"

export type Agreement = z.input<typeof agreementSchema>
export type EscrowPayment = z.input<typeof escrowPaymentSchema>
export type EscrowRefund = z.input<typeof escrowRefundSchema>
export type Delivery = z.input<typeof deliverySchema>
export type Dispute = z.input<typeof disputeSchema>
export type MyDisputeDetail = z.input<typeof myDisputeDetailSchema>
export type MyDisputeListItem = z.input<typeof myDisputeListItemSchema>
export type EligibleTransaction = z.input<typeof eligibleTransactionSchema>

// ─── 합의서 ──────────────────────────────────────────────────────────────────

function agreements(): Agreement[] {
  return [
    {
      id: DEALS.hero.agreementId,
      ticketId: DEALS.hero.ticketId,
      finalPrice: DEALS.hero.price,
      workDeadline: deadlineAt(DEALS.hero.deadlineDayOffset),
      scope:
        "제주 여행 브이로그 원본(약 80분) → 10분 내외 편집\n" +
        "· 컷편집 및 장면 전환\n" +
        "· 한글 자막 + 오프닝 타이틀\n" +
        "· 색보정 · 저작권 프리 BGM\n" +
        "· 썸네일 시안 2종",
      maxRevisions: DEALS.hero.maxRevisions,
      deliveryFormat: "MP4 (1080p, 30fps) + 썸네일 PNG",
      status: "CONFIRMED",
      proposedBy: SEO_YEON.userId,
      proposedAt: kstAt(-3, 15, 5),
      confirmedAt: kstAt(-3, 15, 31),
      createdAt: kstAt(-3, 15, 5),
      expertProfileId: SEO_YEON.expertProfileId,
      clientId: ME.userId,
      updatedAt: kstAt(-3, 15, 31),
    },
    {
      id: DEALS.expertSide.agreementId,
      ticketId: DEALS.expertSide.ticketId,
      finalPrice: DEALS.expertSide.price,
      workDeadline: deadlineAt(DEALS.expertSide.deadlineDayOffset),
      scope:
        "가평 캠핑 원본(약 50분) → 15분 내외 편집\n" +
        "· 컷편집 · 불멍 장면 롱테이크 유지\n" +
        "· 한글 자막 · 감성 BGM",
      maxRevisions: DEALS.expertSide.maxRevisions,
      deliveryFormat: "MP4 (4K, 30fps)",
      status: "CONFIRMED",
      proposedBy: ME.userId,
      proposedAt: kstAt(-2, 10, 40),
      confirmedAt: kstAt(-2, 11, 2),
      createdAt: kstAt(-2, 10, 40),
      expertProfileId: ME.expertProfileId,
      clientId: WEEKEND_VLOGGER.userId,
      updatedAt: kstAt(-2, 11, 2),
    },
    {
      id: DEALS.logo.agreementId,
      ticketId: DEALS.logo.ticketId,
      finalPrice: DEALS.logo.price,
      workDeadline: deadlineAt(-9),
      scope:
        "카페 '오후세시' 로고 시안 3종 → 1종 확정 후 디테일 수정\n· 최종 AI 원본 · 투명 PNG · 컬러 가이드",
      maxRevisions: 3,
      deliveryFormat: "AI · PNG · PDF 컬러 가이드",
      status: "CONFIRMED",
      proposedBy: JUN_HO.userId,
      proposedAt: kstAt(-16, 14, 20),
      confirmedAt: kstAt(-16, 15, 1),
      createdAt: kstAt(-16, 14, 20),
      expertProfileId: JUN_HO.expertProfileId,
      clientId: ME.userId,
      updatedAt: kstAt(-16, 15, 1),
    },
    {
      id: DEALS.dispute.agreementId,
      ticketId: DEALS.dispute.ticketId,
      finalPrice: DEALS.dispute.price,
      workDeadline: deadlineAt(-33),
      scope: "마카롱 3종(얼그레이 · 피스타치오 · 솔티캐러멜) 레시피 + 원가 계산표",
      maxRevisions: 1,
      deliveryFormat: "PDF 레시피북",
      status: "CONFIRMED",
      proposedBy: SU_A.userId,
      proposedAt: kstAt(-40, 11, 0),
      confirmedAt: kstAt(-40, 11, 20),
      createdAt: kstAt(-40, 11, 0),
      expertProfileId: SU_A.expertProfileId,
      clientId: ME.userId,
      updatedAt: kstAt(-40, 11, 20),
    },
  ]
}

export const agreementByTicket = (ticketId: number) =>
  agreements().find((a) => a.ticketId === ticketId) ?? null

export const agreementById = (id: number) => agreements().find((a) => a.id === id) ?? null

// ─── 에스크로 결제 ────────────────────────────────────────────────────────────

function payments(): EscrowPayment[] {
  return [
    {
      id: DEALS.hero.paymentId,
      orderId: `op_${DEALS.hero.ticketId}_${kstDateCompact(-3)}1538`,
      ticketId: DEALS.hero.ticketId,
      amount: DEALS.hero.price,
      paymentMethod: "CARD",
      status: "DELIVERED",
      paidAt: kstAt(-3, 15, 38),
      paymentKey: `pay_${DEALS.hero.ticketId}_a7f3c2`,
      createdAt: kstAt(-3, 15, 36),
    },
    {
      id: DEALS.expertSide.paymentId,
      orderId: `op_${DEALS.expertSide.ticketId}_${kstDateCompact(-2)}1109`,
      ticketId: DEALS.expertSide.ticketId,
      amount: DEALS.expertSide.price,
      paymentMethod: "EASY_PAY",
      status: "WORK_IN_PROGRESS",
      paidAt: kstAt(-2, 11, 9),
      paymentKey: `pay_${DEALS.expertSide.ticketId}_d91e04`,
      createdAt: kstAt(-2, 11, 7),
    },
    {
      id: DEALS.logo.paymentId,
      orderId: `op_${DEALS.logo.ticketId}_${kstDateCompact(-16)}1506`,
      ticketId: DEALS.logo.ticketId,
      amount: DEALS.logo.price,
      paymentMethod: "CARD",
      status: "SETTLED",
      paidAt: kstAt(-16, 15, 6),
      paymentKey: `pay_${DEALS.logo.ticketId}_5b8e17`,
      createdAt: kstAt(-16, 15, 4),
    },
    {
      id: DEALS.dispute.paymentId,
      orderId: `op_${DEALS.dispute.ticketId}_${kstDateCompact(-40)}1130`,
      ticketId: DEALS.dispute.ticketId,
      amount: DEALS.dispute.price,
      paymentMethod: "TRANSFER",
      status: "REFUNDED",
      paidAt: kstAt(-40, 11, 30),
      paymentKey: `pay_${DEALS.dispute.ticketId}_0c42aa`,
      createdAt: kstAt(-40, 11, 28),
    },
  ]
}

export const paymentByTicket = (ticketId: number) =>
  payments().find((p) => p.ticketId === ticketId) ?? null

/** POST /v1/api/payment/escrow (portone-result 페이지) — 결제 직후 응답 */
export function paymentAfterPay(ticketId: number, paymentKey: string): EscrowPayment {
  const base = paymentByTicket(ticketId)
  return {
    id: base?.id ?? 600 + (ticketId % 100),
    orderId: base?.orderId ?? `op_${ticketId}_${kstDateCompact(0)}`,
    ticketId,
    amount: base?.amount ?? DEALS.hero.price,
    paymentMethod: "CARD",
    status: "ESCROW_HELD",
    paidAt: minutesAgo(0),
    paymentKey,
    createdAt: minutesAgo(1),
  }
}

// ─── 환불 ────────────────────────────────────────────────────────────────────

function refunds(): EscrowRefund[] {
  return [
    {
      id: DEALS.dispute.refundId,
      ticketId: DEALS.dispute.ticketId,
      zone: "DEADLINE_WAIT",
      reason: "마감일이 지났는데 작업물을 받지 못했고, 연락도 닿지 않아 환불을 요청합니다.",
      status: "DISPUTE_FULL_REFUND",
      requestedAt: kstAt(-30, 14, 0),
      expertResponseDeadline: kstAt(-27, 14, 0),
      expertRespondedAt: kstAt(-29, 18, 0),
      expertRejectReason: "레시피 초안은 거의 완성된 상태라 일부라도 전달드리고 싶어요.",
      refundedAt: kstAt(-25, 15, 0),
      disputeId: DEALS.dispute.disputeId,
    },
  ]
}

export const refundByTicket = (ticketId: number) =>
  refunds().find((r) => r.ticketId === ticketId) ?? null

/** POST /v1/api/payment/escrow/refund — 새 환불 요청 */
export function newRefund(ticketId: number, reason: string): EscrowRefund {
  return {
    id: 960 + (ticketId % 100),
    ticketId,
    zone: "WORK_IN_PROGRESS",
    reason,
    status: "REQUESTED",
    requestedAt: minutesAgo(0),
    expertResponseDeadline: kstAt(3, 23, 59),
    expertRespondedAt: null,
    expertRejectReason: null,
    refundedAt: null,
    disputeId: null,
  }
}

// ─── 작업물 ──────────────────────────────────────────────────────────────────

function deliveries(): Delivery[] {
  return [
    {
      id: DEALS.hero.deliveryId,
      ticketId: DEALS.hero.ticketId,
      expertId: SEO_YEON.expertProfileId,
      deliveryType: "FILE_DELIVERY",
      memo:
        "1차 완성본 전달드립니다 🎬\n\n" +
        "· 러닝타임 10분 32초 (1080p)\n" +
        "· 오프닝: 공항 도착 → 타이틀, 밝은 어쿠스틱 BGM 적용\n" +
        "· 자막 폰트는 프리텐다드 / 볼드로 통일했어요\n" +
        "· 썸네일 시안 A(풍경형) · B(인물형) 2종 첨부\n\n" +
        "수정 원하시는 구간은 타임코드로 알려주시면 빠르게 반영할게요!",
      status: "SUBMITTED",
      revisionCount: 0,
      revisionMessage: null,
      submittedAt: minutesAgo(170),
      approvedAt: null,
      attachments: [
        {
          id: 7011,
          fileType: "IMAGE",
          fileUrl: asset("cover", "hero-thumb-a", "썸네일 A · 제주의 오후"),
          originalFileName: "썸네일_시안A.png",
          fileSize: 1_284_311,
        },
        {
          id: 7012,
          fileType: "IMAGE",
          fileUrl: asset("cover", "hero-thumb-b", "썸네일 B · 3박 4일 제주"),
          originalFileName: "썸네일_시안B.png",
          fileSize: 1_402_870,
        },
        {
          id: 7013,
          fileType: "VIDEO",
          fileUrl: mockFile("제주_브이로그_1차완성본.mp4"),
          originalFileName: "제주_브이로그_1차완성본.mp4",
          fileSize: 486_539_264,
        },
        {
          id: 7014,
          fileType: "FILE",
          fileUrl: mockFile("편집노트_타임코드.pdf"),
          originalFileName: "편집노트_타임코드.pdf",
          fileSize: 218_734,
        },
      ],
      maxRevisions: DEALS.hero.maxRevisions,
      remainingRevisions: DEALS.hero.maxRevisions,
      workDeadline: deadlineAt(DEALS.hero.deadlineDayOffset),
      updatedAt: minutesAgo(170),
    },
    {
      id: DEALS.logo.deliveryId,
      ticketId: DEALS.logo.ticketId,
      expertId: JUN_HO.expertProfileId,
      deliveryType: "FILE_DELIVERY",
      memo: "최종 로고 파일 전달드립니다.\n· AI 원본 · 투명 PNG(가로/세로형) · 컬러 가이드 PDF\n간판·컵홀더 시안도 덤으로 넣어뒀어요!",
      status: "APPROVED",
      revisionCount: 1,
      revisionMessage: "커피잔 아이콘을 조금 더 단순하게 해주세요.",
      submittedAt: kstAt(-11, 10, 30),
      approvedAt: kstAt(-11, 13, 2),
      attachments: [
        {
          id: 7031,
          fileType: "IMAGE",
          fileUrl: asset("cover", "logo-final", "오후세시 최종 로고"),
          originalFileName: "오후세시_로고_최종.png",
          fileSize: 842_115,
        },
        {
          id: 7032,
          fileType: "FILE",
          fileUrl: mockFile("오후세시_로고_원본.ai"),
          originalFileName: "오후세시_로고_원본.ai",
          fileSize: 6_310_552,
        },
        {
          id: 7033,
          fileType: "FILE",
          fileUrl: mockFile("오후세시_컬러가이드.pdf"),
          originalFileName: "오후세시_컬러가이드.pdf",
          fileSize: 1_105_920,
        },
      ],
      maxRevisions: 3,
      remainingRevisions: 2,
      workDeadline: deadlineAt(-9),
      updatedAt: kstAt(-11, 13, 2),
    },
  ]
}

export const deliveryByTicket = (ticketId: number) =>
  deliveries().find((d) => d.ticketId === ticketId) ?? null

export const deliveryById = (id: number) => deliveries().find((d) => d.id === id) ?? null

// ─── 분쟁 ────────────────────────────────────────────────────────────────────

export function disputeDetailById(disputeId: number): MyDisputeDetail | null {
  if (disputeId !== DEALS.dispute.disputeId) return null
  const deal = DEALS.dispute
  return {
    disputeId: deal.disputeId,
    ticketId: deal.ticketId,
    ticketTitle: deal.title,
    ticketType: "ONLINE",
    applicantId: ME.userId,
    applicantNickname: ME.nickname,
    respondentId: SU_A.userId,
    respondentNickname: SU_A.nickname,
    reason: "마감 초과 — 합의한 마감일로부터 3일이 지나도록 작업물을 받지 못했어요.",
    applicantStatement:
      "합의서상 마감일까지 레시피를 받기로 했는데, 마감 이후 두 차례 진행 상황을 문의했지만 답변을 받지 못했습니다.\n" +
      "신메뉴 출시 일정이 있어 더 기다리기 어려워 환불을 요청했고, 거절되어 분쟁을 신청합니다.",
    respondentStatement:
      "개인 사정으로 작업이 늦어진 점 죄송합니다. 레시피 초안은 80% 정도 완성된 상태였고 일부라도 전달드리고 싶었습니다.\n" +
      "다만 연락이 늦었던 부분은 제 책임이 맞습니다.",
    status: "RESOLVED",
    appliedAt: kstAt(-29, 18, 30),
    respondedAt: kstAt(-28, 11, 0),
    resolvedAt: kstAt(-25, 15, 0),
    adminRemark:
      "양측 진술과 채팅 기록을 검토한 결과, 합의된 마감일까지 작업물이 전달되지 않았고 의뢰인의 문의에 응답이 없었던 것으로 확인되었습니다.\n" +
      `환불 정책에 따라 결제 금액 ${DEALS.dispute.price.toLocaleString("ko-KR")}원 전액을 의뢰인에게 환불합니다.`,
    applicantEvidences: [
      {
        fileUrl: asset("cover", "dispute-901-chat", "마감 후 문의 기록"),
        fileName: "마감후_문의_채팅캡처.png",
      },
      { fileUrl: mockFile("신메뉴_출시일정.pdf"), fileName: "신메뉴_출시일정.pdf" },
    ],
    respondentEvidences: [
      {
        fileUrl: asset("cover", "dispute-901-draft", "레시피 초안"),
        fileName: "마카롱_레시피_초안.jpg",
      },
    ],
  }
}

export function disputeByTicket(ticketId: number): Dispute | null {
  if (ticketId !== DEALS.dispute.ticketId) return null
  const detail = disputeDetailById(DEALS.dispute.disputeId)!
  return {
    disputeId: detail.disputeId,
    ticketId: detail.ticketId,
    reason: detail.reason,
    status: detail.status,
    appliedAt: detail.appliedAt,
  }
}

export function myDisputes(): MyDisputeListItem[] {
  const detail = disputeDetailById(DEALS.dispute.disputeId)!
  return [
    {
      disputeId: detail.disputeId,
      ticketTitle: detail.ticketTitle,
      ticketType: detail.ticketType,
      applicantId: detail.applicantId,
      applicantNickname: detail.applicantNickname,
      respondentId: detail.respondentId,
      respondentNickname: detail.respondentNickname,
      status: detail.status,
      appliedAt: detail.appliedAt,
    },
  ]
}

/** 분쟁 신청 가능 거래 — 진행중인 에스크로 (HERO 의뢰인 · EXPERT SIDE 전문가) */
export function eligibleTransactions(): EligibleTransaction[] {
  return [DEALS.hero, DEALS.expertSide].map((deal) => {
    const payment = paymentByTicket(deal.ticketId)!
    return {
      escrowPaymentId: payment.id,
      ticketId: deal.ticketId,
      ticketTitle: deal.title,
      amount: payment.amount,
      paidAt: payment.paidAt,
    }
  })
}
