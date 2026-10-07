import { http, HttpResponse, type RequestHandler } from "msw"

import { agreementResponseSchema } from "@/entities/agreement/api/agreement.schema"
import {
  chatRoomDetailResponseSchema,
  chatRoomIdByTicketResponseSchema,
  chatRoomListResponseSchema,
  readMessagesResponseSchema,
} from "@/entities/chat/api/chat.schema"
import { deliveryResponseSchema } from "@/entities/delivery/api/delivery.schema"
import {
  disputeDetailResponseSchema,
  disputeListResponseSchema,
  disputeResponseSchema,
  eligibleTransactionListResponseSchema,
} from "@/entities/dispute/api/dispute.schema"
import {
  escrowPaymentResponseSchema,
  escrowRefundResponseSchema,
} from "@/entities/payment/api/payment.schema"

import { chatRoomDetail, chatRoomList, roomIdByTicket } from "../fixtures/chat"
import { DEALS, deadlineAt } from "../fixtures/chat-scenario"
import {
  agreementById,
  agreementByTicket,
  deliveryById,
  deliveryByTicket,
  disputeByTicket,
  disputeDetailById,
  eligibleTransactions,
  myDisputes,
  newRefund,
  paymentAfterPay,
  paymentByTicket,
  refundByTicket,
  type Agreement,
  type Delivery,
  type Dispute,
  type EscrowPayment,
  type EscrowRefund,
} from "../fixtures/transaction"
import { apiPath, mock } from "../lib/respond"
import { minutesAgo } from "../lib/time"
import { ME } from "../world"

// ─── helpers ────────────────────────────────────────────────────────────────

type Method = "get" | "post" | "put" | "patch" | "delete"

/**
 * 데이터가 없는 리소스는 실제 백엔드처럼 404 envelope 을 돌려준다.
 * `lookup` 이 null 이면 404, 아니면 undefined 를 반환해 바로 뒤의 `mock(...)` 핸들러로 넘긴다.
 */
function notFoundUnless(
  method: Method,
  path: string,
  exists: (params: Record<string, string>) => boolean,
  message: string,
) {
  return http[method](apiPath(path), ({ params }) =>
    exists(params as Record<string, string>)
      ? undefined
      : HttpResponse.json({ success: false, message, data: null }, { status: 404 }),
  )
}

const num = (value: unknown) => Number(value)

async function readJson<T>(request: Request): Promise<Partial<T>> {
  try {
    return (await request.json()) as Partial<T>
  } catch {
    return {}
  }
}

/** 목업 파일 다운로드 — 채팅 FILE 버블 / 작업물 첨부 / 분쟁 증빙 클릭 시 */
const MINI_PDF = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj
4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
5 0 obj<</Length 44>>stream
BT /F1 24 Tf 72 760 Td (One Pointer mock) Tj ET
endstream endobj
trailer<</Root 1 0 R>>
%%EOF`

// ─── chat ───────────────────────────────────────────────────────────────────

const chatHandlers = [
  mock("get", "/v1/api/chat/rooms", chatRoomListResponseSchema, () => ({
    rooms: chatRoomList(),
    nextCursor: null,
    hasNext: false,
  })),

  // 고정 세그먼트(by-ticket) 를 :roomId 보다 먼저
  notFoundUnless(
    "get",
    "/v1/api/chat/rooms/by-ticket/:ticketId",
    (p) => roomIdByTicket(num(p.ticketId)) != null,
    "채팅방을 찾을 수 없습니다.",
  ),
  mock(
    "get",
    "/v1/api/chat/rooms/by-ticket/:ticketId",
    chatRoomIdByTicketResponseSchema,
    ({ params }) => roomIdByTicket(num(params.ticketId))!,
  ),

  notFoundUnless(
    "get",
    "/v1/api/chat/rooms/:roomId/messages",
    (p) => chatRoomDetail(p.roomId) != null,
    "채팅방을 찾을 수 없습니다.",
  ),
  mock(
    "get",
    "/v1/api/chat/rooms/:roomId/messages",
    chatRoomDetailResponseSchema,
    ({ params }) => chatRoomDetail(String(params.roomId))!,
  ),

  mock("post", "/v1/api/chat/rooms/:roomId/read", readMessagesResponseSchema, () => true),
]

// ─── agreement ──────────────────────────────────────────────────────────────

const agreementHandlers = [
  notFoundUnless(
    "get",
    "/v1/api/agreement/ticket/:ticketId",
    (p) => agreementByTicket(num(p.ticketId)) != null,
    "합의서가 존재하지 않습니다.",
  ),
  mock(
    "get",
    "/v1/api/agreement/ticket/:ticketId",
    agreementResponseSchema,
    ({ params }) => agreementByTicket(num(params.ticketId))!,
  ),

  mock(
    "post",
    "/v1/api/agreement",
    agreementResponseSchema,
    async ({ request }): Promise<Agreement> => {
      const body = await readJson<Agreement>(request)
      const ticketId = body.ticketId ?? DEALS.expertSide.ticketId
      return {
        id: 520 + (ticketId % 100),
        ticketId,
        finalPrice: body.finalPrice ?? 0,
        workDeadline: body.workDeadline ?? deadlineAt(3),
        scope: body.scope ?? null,
        maxRevisions: body.maxRevisions ?? null,
        deliveryFormat: body.deliveryFormat ?? null,
        status: "PROPOSED",
        proposedBy: ME.userId,
        proposedAt: minutesAgo(0),
        confirmedAt: null,
        createdAt: minutesAgo(0),
      }
    },
  ),

  mock(
    "put",
    "/v1/api/agreement/:id/repropose",
    agreementResponseSchema,
    async ({ params, request }): Promise<Agreement> => {
      const base = agreementById(num(params.id)) ?? agreementByTicket(DEALS.hero.ticketId)!
      const body = await readJson<Agreement>(request)
      return {
        ...base,
        ...body,
        status: "PROPOSED",
        proposedBy: ME.userId,
        proposedAt: minutesAgo(0),
        confirmedAt: null,
      }
    },
  ),

  mock("post", "/v1/api/agreement/:id/reject", agreementResponseSchema, ({ params }): Agreement => {
    const base = agreementById(num(params.id)) ?? agreementByTicket(DEALS.hero.ticketId)!
    return { ...base, status: "REJECTED", confirmedAt: null }
  }),

  mock(
    "post",
    "/v1/api/agreement/:id/confirm",
    agreementResponseSchema,
    ({ params }): Agreement => {
      const base = agreementById(num(params.id)) ?? agreementByTicket(DEALS.hero.ticketId)!
      return { ...base, status: "CONFIRMED", confirmedAt: minutesAgo(0) }
    },
  ),

  mock(
    "patch",
    "/v1/api/agreement/:id/deadline",
    agreementResponseSchema,
    async ({ params, request }): Promise<Agreement> => {
      const base = agreementById(num(params.id)) ?? agreementByTicket(DEALS.hero.ticketId)!
      const body = await readJson<{ workDeadline: string }>(request)
      return {
        ...base,
        workDeadline: body.workDeadline ?? base.workDeadline,
        updatedAt: minutesAgo(0),
      }
    },
  ),
]

// ─── payment / refund ───────────────────────────────────────────────────────

const paymentHandlers = [
  // refund — 고정 세그먼트 먼저
  notFoundUnless(
    "get",
    "/v1/api/payment/escrow/refund/ticket/:ticketId",
    (p) => refundByTicket(num(p.ticketId)) != null,
    "환불 요청 내역이 없습니다.",
  ),
  mock(
    "get",
    "/v1/api/payment/escrow/refund/ticket/:ticketId",
    escrowRefundResponseSchema,
    ({ params }) => refundByTicket(num(params.ticketId))!,
  ),

  mock(
    "post",
    "/v1/api/payment/escrow/refund",
    escrowRefundResponseSchema,
    async ({ request }): Promise<EscrowRefund> => {
      const body = await readJson<{ ticketId: number; reason: string }>(request)
      return newRefund(
        body.ticketId ?? DEALS.hero.ticketId,
        body.reason ?? "작업 진행이 어려워 환불을 요청합니다.",
      )
    },
  ),

  mock(
    "post",
    "/v1/api/payment/escrow/refund/:refundRequestId/respond",
    escrowRefundResponseSchema,
    async ({ params, request }): Promise<EscrowRefund> => {
      const body = await readJson<{ accept: boolean; rejectReason?: string | null }>(request)
      const base = newRefund(DEALS.expertSide.ticketId, "일정상 진행이 어려워 환불을 요청드려요.")
      return {
        ...base,
        id: num(params.refundRequestId),
        status: body.accept ? "EXPERT_ACCEPTED" : "EXPERT_REJECTED",
        expertRespondedAt: minutesAgo(0),
        expertRejectReason: body.accept ? null : (body.rejectReason ?? null),
        refundedAt: body.accept ? minutesAgo(0) : null,
      }
    },
  ),

  notFoundUnless(
    "get",
    "/v1/api/payment/escrow/ticket/:ticketId",
    (p) => paymentByTicket(num(p.ticketId)) != null,
    "결제 내역이 없습니다.",
  ),
  mock(
    "get",
    "/v1/api/payment/escrow/ticket/:ticketId",
    escrowPaymentResponseSchema,
    ({ params }) => paymentByTicket(num(params.ticketId))!,
  ),

  mock(
    "post",
    "/v1/api/payment/escrow",
    escrowPaymentResponseSchema,
    async ({ request }): Promise<EscrowPayment> => {
      const body = await readJson<{ ticketId: number; paymentKey: string }>(request)
      return paymentAfterPay(body.ticketId ?? DEALS.hero.ticketId, body.paymentKey ?? "pay_mock")
    },
  ),
]

// ─── delivery ───────────────────────────────────────────────────────────────

const heroDelivery = () => deliveryById(DEALS.hero.deliveryId)!

const deliveryHandlers = [
  notFoundUnless(
    "get",
    "/v1/api/delivery/ticket/:ticketId",
    (p) => deliveryByTicket(num(p.ticketId)) != null,
    "제출된 작업물이 없습니다.",
  ),
  mock(
    "get",
    "/v1/api/delivery/ticket/:ticketId",
    deliveryResponseSchema,
    ({ params }) => deliveryByTicket(num(params.ticketId))!,
  ),

  mock(
    "post",
    "/v1/api/delivery",
    deliveryResponseSchema,
    async ({ request }): Promise<Delivery> => {
      const body = await readJson<Delivery>(request)
      const ticketId = body.ticketId ?? DEALS.expertSide.ticketId
      return {
        id: 710 + (ticketId % 100),
        ticketId,
        expertId: ME.expertProfileId,
        deliveryType: body.deliveryType ?? "FILE_DELIVERY",
        memo: body.memo ?? "",
        status: "SUBMITTED",
        revisionCount: 0,
        revisionMessage: null,
        submittedAt: minutesAgo(0),
        approvedAt: null,
        attachments: (body.attachments ?? []).map((att, index) => ({ ...att, id: 7100 + index })),
        // 실측: 제출 직후 응답은 합의 기반 값이 null
        maxRevisions: null,
        remainingRevisions: null,
        workDeadline: null,
      }
    },
  ),

  mock(
    "post",
    "/v1/api/delivery/:deliveryId/revision",
    deliveryResponseSchema,
    async ({ params, request }): Promise<Delivery> => {
      const base = deliveryById(num(params.deliveryId)) ?? heroDelivery()
      const body = await readJson<{ revisionMessage: string }>(request)
      return {
        ...base,
        status: "REVISION_REQUESTED",
        revisionCount: base.revisionCount + 1,
        revisionMessage: body.revisionMessage ?? null,
        remainingRevisions:
          base.remainingRevisions != null ? Math.max(0, base.remainingRevisions - 1) : null,
      }
    },
  ),

  mock(
    "post",
    "/v1/api/delivery/:deliveryId/resubmit",
    deliveryResponseSchema,
    async ({ params, request }): Promise<Delivery> => {
      const base = deliveryById(num(params.deliveryId)) ?? heroDelivery()
      const body = await readJson<Delivery>(request)
      return {
        ...base,
        memo: body.memo ?? base.memo,
        status: "SUBMITTED",
        submittedAt: minutesAgo(0),
      }
    },
  ),

  mock(
    "post",
    "/v1/api/delivery/:deliveryId/approve",
    deliveryResponseSchema,
    ({ params }): Delivery => {
      const base = deliveryById(num(params.deliveryId)) ?? heroDelivery()
      return { ...base, status: "APPROVED", approvedAt: minutesAgo(0) }
    },
  ),

  mock(
    "post",
    "/v1/api/delivery/:deliveryId/reject",
    deliveryResponseSchema,
    ({ params }): Delivery => {
      const base = deliveryById(num(params.deliveryId)) ?? heroDelivery()
      return { ...base, status: "REJECTED" }
    },
  ),
]

// ─── dispute ────────────────────────────────────────────────────────────────

const disputeAction = (disputeId: number, status: Dispute["status"]): Dispute => {
  const base = disputeDetailById(disputeId)
  return {
    disputeId,
    ticketId: base?.ticketId ?? DEALS.hero.ticketId,
    reason: base?.reason ?? "작업 품질 문제",
    status,
    appliedAt: base?.appliedAt ?? minutesAgo(0),
  }
}

const disputeHandlers = [
  // 고정 경로 먼저
  mock("get", "/v1/api/disputes/my", disputeListResponseSchema, () => ({
    content: myDisputes(),
    nextCursor: null,
    hasNext: false,
  })),

  mock("get", "/v1/api/disputes/eligible-transactions", eligibleTransactionListResponseSchema, () =>
    eligibleTransactions(),
  ),

  notFoundUnless(
    "get",
    "/v1/api/disputes/ticket/:ticketId",
    (p) => disputeByTicket(num(p.ticketId)) != null,
    "분쟁 내역이 없습니다.",
  ),
  mock(
    "get",
    "/v1/api/disputes/ticket/:ticketId",
    disputeResponseSchema,
    ({ params }) => disputeByTicket(num(params.ticketId))!,
  ),

  mock("post", "/v1/api/disputes", disputeResponseSchema, async ({ request }): Promise<Dispute> => {
    const body = await readJson<{ escrowPaymentId: number; description: string }>(request)
    const ticketId =
      eligibleTransactions().find((t) => t.escrowPaymentId === body.escrowPaymentId)?.ticketId ??
      DEALS.hero.ticketId
    return {
      disputeId: 902,
      ticketId,
      reason: body.description ?? "작업 품질 문제",
      status: "SUBMITTED",
      appliedAt: minutesAgo(0),
    }
  }),

  mock(
    "post",
    "/v1/api/disputes/:disputeId/respond",
    disputeResponseSchema,
    ({ params }): Dispute => disputeAction(num(params.disputeId), "UNDER_REVIEW"),
  ),
  mock(
    "post",
    "/v1/api/disputes/:disputeId/evidences",
    disputeResponseSchema,
    ({ params }): Dispute => disputeAction(num(params.disputeId), "UNDER_REVIEW"),
  ),
  mock(
    "post",
    "/v1/api/disputes/:disputeId/cancel",
    disputeResponseSchema,
    ({ params }): Dispute => disputeAction(num(params.disputeId), "CANCELLED"),
  ),

  notFoundUnless(
    "get",
    "/v1/api/disputes/:disputeId",
    (p) => disputeDetailById(num(p.disputeId)) != null,
    "분쟁을 찾을 수 없습니다.",
  ),
  mock(
    "get",
    "/v1/api/disputes/:disputeId",
    disputeDetailResponseSchema,
    ({ params }) => disputeDetailById(num(params.disputeId))!,
  ),
]

// ─── 목업 파일 ───────────────────────────────────────────────────────────────

const fileHandlers = [
  http.get(apiPath("/mock-files/:file"), ({ params }) => {
    const name = decodeURIComponent(String(params.file))
    const isPdf = name.toLowerCase().endsWith(".pdf")
    return new HttpResponse(isPdf ? MINI_PDF : `원포인터 목업 파일: ${name}\n`, {
      headers: {
        "content-type": isPdf ? "application/pdf" : "text/plain; charset=utf-8",
        "content-disposition": `inline; filename*=UTF-8''${encodeURIComponent(name)}`,
      },
    })
  }),
]

export const chatGroupHandlers: RequestHandler[] = [
  ...chatHandlers,
  ...agreementHandlers,
  ...paymentHandlers,
  ...deliveryHandlers,
  ...disputeHandlers,
  ...fileHandlers,
]
