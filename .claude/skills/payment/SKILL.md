---
name: payment
description: 결제(Payment) 도메인 프론트엔드 구현 가이드. 온라인 의뢰 에스크로 결제(PortOne V2), 결제 상태 조회, 수수료 구조 등 Payment 도메인 관련 프론트엔드 작업 시 사용. /payment 로 호출하거나 에스크로·결제 UI를 다룰 때 참고한다.
---

# Payment 도메인

온라인 의뢰의 에스크로 안전결제를 관리한다. 쿠폰 구매 일반결제는 `/coupon` 참고. 오프라인 의뢰는 플랫폼이 결제에 개입하지 않는다.

## 결제 구분

| 결제 대상 | 방식 | 비고 |
|---|---|---|
| **쿠폰 구매** | 일반 결제 (즉시) | → `/coupon` 참고 |
| **온라인 의뢰 서비스 대금** | **에스크로 결제** | 이 스킬에서 다룸 |
| 오프라인 의뢰 서비스 대금 | 플랫폼 미개입 | 당사자 간 직접 결제 |

## PG 구성

| 항목 | 내용 |
|---|---|
| 결제 연동 레이어 | **포트원 V2** (PortOne) |
| PG사 | 토스페이먼츠 |
| 결제 수단 | 카드(CARD), 간편결제(EASY_PAY), 계좌이체(TRANSFER) |
| 에스크로 | `isEscrow: true` 옵션으로 활성화 |

## 에스크로 결제 플로우

```
Agreement CONFIRMED → Ticket PAYMENT_PENDING
    │
    ▼
[프론트] PortOne V2 SDK requestPayment({ isEscrow: true }) → paymentId 수신
    │
    ▼
[프론트] POST /v1/api/payment/escrow { ticketId, paymentMethod, paymentKey }
    │
    ▼
[백엔드] 결제 검증 → EscrowPayment 생성 (ESCROW_HELD)
    → 티켓 PAID → IN_PROGRESS 자동 전이
    → 채팅 시스템 메시지 + 양쪽 알림
    │
    ▼
(전문가 서비스 진행 → 작업물 전달 → 의뢰인 승인)
    │
    ▼
[백엔드] 의뢰인 승인 → 에스크로 구매확인 → CONFIRMED
    → PG 정산 → 관리자 수동 송금 → SETTLED
```

## 에스크로 결제 상태 (EscrowPaymentStatus)

```
PENDING → ESCROW_HELD (결제 완료, 예치)
              │
              ├─ WORK_IN_PROGRESS (전문가 작업 중)
              ├─ DELIVERED (전문가 납품 완료)
              ├─ REVISION_REQUESTED (의뢰인 수정 요청)
              │
              ├→ CONFIRMED (의뢰인 완료 확인) → SETTLED (정산 완료)
              ├→ AUTO_CONFIRMED (자동 구매확인) → SETTLED
              ├→ REFUND_REQUESTED → REFUNDED (환불)
              └→ DISPUTE (분쟁 → CS 중재)
```

| 상태 | 설명 |
|---|---|
| `PENDING` | 결제 대기 |
| `ESCROW_HELD` | 결제 완료, PG가 금액 예치 중 |
| `CONFIRMED` | 의뢰인 완료 확인 → 정산 진행 |
| `AUTO_CONFIRMED` | 납품 후 7일 무응답 → 자동 구매확인 |
| `SETTLED` | 전문가 계좌 입금 완료 |
| `REFUNDED` | 환불 완료 |
| `DISPUTE` | 분쟁 발생 → CS 중재 |

## 에스크로 정책

| 규칙 | 내용 |
|---|---|
| 적용 대상 | 온라인 의뢰만 |
| 수수료 | **0%** (전액 전문가 정산). PG 수수료만 전문가 부담 |
| 결제 기한 | 합의서 확정 후 24시간 이내 |
| 자동 구매확인 | 납품 완료 후 **7일** 무응답 시 |
| 자동 환불 | 합의서 마감일 +3일 초과 + 납품 없음 시 |

## 수수료 부담 구조

| 결제 종류 | 수수료율 | 부담 주체 |
|---|---|---|
| 쿠폰 구매 | 3.4% | 플랫폼 |
| 에스크로 결제 | 0.2%~3.6% | **전문가** (정산 시 차감) |
| 오프라인 대면 결제 | 0% | 없음 |

## 정산 주기

| 결제 수단 | 정산일 |
|---|---|
| 카드 / 간편결제 | 구매확인 후 D+2 영업일 |
| 계좌이체 | 구매확인 후 D+3~5 영업일 |

전문가에게는 "구매확인 후 약 2~5 영업일 내 입금"으로 안내.

## API 엔드포인트

| Method | URL | 설명 | 인증 | Service 함수 |
|---|---|---|---|---|
| POST | `/v1/api/payment/escrow` | 에스크로 결제 | JWT | `payEscrow(input)` |
| GET | `/v1/api/payment/escrow/ticket/{ticketId}` | 결제 정보 조회 | JWT | `getEscrowPaymentByTicket(ticketId)` |

## 프론트엔드 구현 가이드

### FSD 파일 구조

```
src/
├── entities/payment/
│   ├── api/
│   │   ├── payment.schema.ts       # zod v4 스키마
│   │   └── payment.service.ts      # Service Layer
│   └── model/
│       └── payment.query-keys.ts   # Query 키 팩토리
│
├── features/payment/
│   ├── pay-escrow/                 # 에스크로 결제
│   │   ├── model/                  # usePayEscrow mutation
│   │   └── ui/                    # EscrowPaymentButton
│   └── payment-status/            # 결제 상태 조회
│       ├── model/                  # useEscrowPayment query
│       └── ui/                    # PaymentStatusCard
```

### Query Keys

```typescript
export const paymentQueryKeys = {
  all: ["payment"] as const,
  escrowByTicket: (ticketId: number) =>
    ["payment", "escrow", "ticket", ticketId] as const,
}
```

### PortOne V2 에스크로 결제 패턴

```typescript
import PortOne from "@portone/browser-sdk/v2"

// 에스크로 결제 요청
const response = await PortOne.requestPayment({
  storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
  channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!,
  paymentId: crypto.randomUUID(),
  orderName: `의뢰 결제 - ${ticketTitle}`,
  totalAmount: agreement.finalPrice,
  currency: "KRW",
  payMethod: "CARD",
  isEscrow: true,         // 에스크로 필수!
})

if (response?.code) {
  throw new Error(response.message)
}

// 백엔드 검증
await payEscrow({
  ticketId,
  paymentMethod: "CARD",
  paymentKey: response!.paymentId,
})
```

### usePayEscrow Mutation 패턴

```typescript
export function usePayEscrow(ticketId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: payEscrow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentQueryKeys.escrowByTicket(ticketId) })
      queryClient.invalidateQueries({ queryKey: ticketQueryKeys.detail(ticketId) })
    },
  })
}
```

### 결제 상태 조회

```typescript
export function useEscrowPayment(ticketId: number) {
  return useQuery({
    queryKey: paymentQueryKeys.escrowByTicket(ticketId),
    queryFn: () => getEscrowPaymentByTicket(ticketId),
    enabled: !!ticketId,
  })
}
```

### 환경변수

```env
NEXT_PUBLIC_PORTONE_STORE_ID=store-xxx
NEXT_PUBLIC_PORTONE_CHANNEL_KEY=channel-xxx
```

## 에러코드

| 코드 | ErrorCode | 설명 | 프론트 처리 |
|---|---|---|---|
| 40006 | `PAYMENT_NOT_PAID` | PortOne 상태가 PAID가 아님 | "결제 확인 실패" |
| 40007 | `PAYMENT_AMOUNT_MISMATCH` | 결제 금액 ≠ 합의서 금액 | "결제 금액 불일치" |
| 40008 | `DUPLICATE_PAYMENT_KEY` | 이미 처리된 paymentKey | "이미 처리된 결제입니다" |
| 40035 | `TICKET_NOT_PAYMENT_PENDING` | 결제 대기 상태 아님 | 에러 토스트 |
| 40036 | `ESCROW_PAYMENT_ALREADY_EXISTS` | 이미 결제 완료된 티켓 | "이미 결제가 완료되었습니다" |
| 40417 | `NOT_EXIST_ESCROW_PAYMENT` | 존재하지 않는 결제 | 에러 토스트 |
| 50002 | `PAYMENT_VERIFICATION_FAILED` | PortOne API 호출 실패 | "결제 검증 실패. 다시 시도해주세요" |

## 알림

| 이벤트 | 수신자 | NotificationType |
|---|---|---|
| 결제 완료 | 양쪽 | `ESCROW_PAYMENT_COMPLETED` |
| 정산 완료 | 전문가 | `ESCROW_SETTLED` |

## 환불/분쟁 정책

→ **[refund-policy](../refund-policy/SKILL.md)** 참고

## 기능 체크리스트

### 프론트엔드
- [x] 에스크로 결제 Service (`payEscrow`) — 구현 완료
- [x] 결제 상태 조회 Service (`getEscrowPaymentByTicket`) — 구현 완료
- [ ] PortOne V2 SDK 에스크로 결제 UI (`isEscrow: true`)
- [ ] 결제 상태 표시 UI
- [ ] Query Hook 구현 (usePayEscrow, useEscrowPayment)

## 데이터 상세

- **[payment-data.md](references/payment-data.md)** — EscrowPayment 엔티티 필드, 수수료 상세, PortOne V2 프론트 연동
