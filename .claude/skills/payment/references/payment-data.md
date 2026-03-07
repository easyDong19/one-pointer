# Payment 데이터 상세

## 목차
1. [EscrowPayment 엔티티](#1-escrowpayment-엔티티)
2. [Enum 정의](#2-enum-정의)
3. [Repository](#3-repository)
4. [PaymentGenerator](#4-paymentgenerator)
5. [DTO](#5-dto)
6. [PortOnePaymentClient](#6-portonepaymentclient)
7. [결제 수단별 수수료](#7-결제-수단별-수수료)
8. [DB 스키마](#8-db-스키마)
9. [프론트 연동 (PortOne V2)](#9-프론트-연동-portone-v2)
10. [환경 설정](#10-환경-설정)
11. [사전 준비 체크리스트](#11-사전-준비-체크리스트)

---

## 1. EscrowPayment 엔티티

엔티티: `one_pointer.domain.payment.entity.EscrowPayment`
테이블: `escrow_payment`
- 인덱스: `idx_escrow_payment_ticket` on `ticket_id`
- Unique: `uk_escrow_payment_order_id` on `order_id`, `uk_escrow_payment_payment_key` on `payment_key`

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|---|---|---|---|---|
| `id` | `escrow_payment_id` | Long (PK, IDENTITY) | 자동 | 결제 고유 식별자 |
| `orderId` | `order_id` | String (unique) | 자동 | 플랫폼 주문번호. `"OP_{ticketId}_{timestamp}"` 형식 자동 생성 |
| `paymentKey` | `payment_key` | String (unique) | ✅ | PortOne paymentId (프론트에서 전달). 에스크로 구매확인 시 이 값으로 API 호출 |
| `ticketId` | `ticket_id` | Long | ✅ | Ticket PK (다른 도메인) |
| `clientId` | `client_id` | Long | ✅ | 결제자 User PK (다른 도메인) |
| `expertId` | `expert_id` | Long | ✅ | 수신자 User PK (다른 도메인). `ticket.matchedExpertId`에서 가져옴 |
| `amount` | `amount` | Integer | ✅ | 결제 금액 (합의서 `Agreement.finalPrice` 기준) |
| `pgFee` | `pg_fee` | Integer | ⬜ | PG 수수료 (정산 시 계산) |
| `expertSettlementAmount` | `expert_settlement_amount` | Integer | ⬜ | 전문가 정산액 = amount - pgFee |
| `paymentMethod` | `payment_method` | Enum(`EscrowPaymentMethod`) | ✅ | 결제 수단 |
| `status` | `status` | Enum(`EscrowPaymentStatus`) | ✅ | 결제 상태. Builder 기본값: `PENDING` |
| `paidAt` | `paid_at` | LocalDateTime | ⬜ | 결제 완료 시점 |
| `confirmedAt` | `confirmed_at` | LocalDateTime | ⬜ | 구매확인 시점 |
| `releasedAt` | `released_at` | LocalDateTime | ⬜ | 에스크로 해제 시점 |
| `settledAt` | `settled_at` | LocalDateTime | ⬜ | 정산 완료 시점 |
| `refundedAt` | `refunded_at` | LocalDateTime | ⬜ | 환불 시점 |
| `createDateTime` | `create_date_time` | LocalDateTime | 자동 | 생성일시 (BaseTimeEntity) |
| `modifiedDateTime` | `modified_date_time` | LocalDateTime | 자동 | 수정일시 (BaseTimeEntity) |

### 비즈니스 메서드

| 메서드 | 상태 전이 | 시점 기록 |
|---|---|---|
| `escrowHeld()` | → `ESCROW_HELD` | `paidAt = now()` |
| `confirm()` | → `CONFIRMED` | `confirmedAt = now()` |
| `autoConfirm()` | → `AUTO_CONFIRMED` | `confirmedAt = now()` |
| `settle()` | → `SETTLED` | `settledAt = now()` |
| `refund()` | → `REFUNDED` | `refundedAt = now()` |
| `fail()` | → `FAILED` | — |

### 엔티티 관계

```
Ticket (1) ──── (1) EscrowPayment
```

- `EscrowPayment.ticketId` → Ticket PK (다른 도메인, Long)
- `EscrowPayment.clientId` → User PK (다른 도메인, Long)
- `EscrowPayment.expertId` → User PK (다른 도메인, Long)

---

## 2. Enum 정의

| Enum | 패키지 | 값 |
|---|---|---|
| `EscrowPaymentStatus` | `common.enums` | `PENDING`, `ESCROW_HELD`, `WORK_IN_PROGRESS`, `DELIVERED`, `REVISION_REQUESTED`, `CONFIRMED`, `AUTO_CONFIRMED`, `SETTLED`, `REFUND_REQUESTED`, `REFUNDED`, `DISPUTE`, `CANCELLED`, `FAILED` |
| `EscrowPaymentMethod` | `common.enums` | `CARD`, `EASY_PAY`, `TRANSFER` |

---

## 3. Repository

`EscrowPaymentRepository extends JpaRepository<EscrowPayment, Long>`

| 메서드 | 반환 | 용도 |
|---|---|---|
| `findByTicketId(Long ticketId)` | `Optional<EscrowPayment>` | 티켓별 결제 조회 |
| `existsByPaymentKey(String paymentKey)` | `boolean` | 중복 결제 방지 |
| `findByStatusIn(List<EscrowPaymentStatus> statuses)` | `List<EscrowPayment>` | 상태별 결제 목록 조회 (관리자 정산 대기) |

---

## 4. PaymentGenerator

`one_pointer.domain.payment.service.PaymentGenerator` — `public final class`, private 생성자

| 메서드 | 설명 |
|---|---|
| `createEscrowPayment(ticketId, clientId, expertId, amount, paymentMethod, paymentKey)` | EscrowPayment 정적 팩토리. orderId 자동 생성 (`"OP_{ticketId}_{timestamp}"`), status=`ESCROW_HELD`, paidAt=`now()` |

---

## 5. DTO

### EscrowPaymentRequest

| 필드 | 타입 | 설명 |
|---|---|---|
| `ticketId` | Long | PAYMENT_PENDING 상태의 티켓 ID |
| `paymentMethod` | EscrowPaymentMethod | 결제 수단 |
| `paymentKey` | String | PortOne paymentId (프론트에서 결제 완료 후 받은 값) |

### EscrowPaymentResponse

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | Long | 결제 PK |
| `orderId` | String | 플랫폼 주문번호 |
| `ticketId` | Long | 티켓 PK |
| `amount` | Integer | 결제 금액 |
| `paymentMethod` | EscrowPaymentMethod | 결제 수단 |
| `status` | EscrowPaymentStatus | 결제 상태 |
| `paidAt` | LocalDateTime | 결제 완료 시점 |

---

## 6. PortOnePaymentClient

`one_pointer.utils.payment.PortOnePaymentClient` — `@Component`, RestClient 기반

### 생성자

```java
public PortOnePaymentClient(
    @Value("${portone.api-secret:test_portone_api_secret}") String apiSecret,
    @Value("${portone.base-url:https://api.portone.io}") String baseUrl)
```

- `Authorization: PortOne {apiSecret}` 헤더 자동 설정

### 메서드

| 메서드 | PortOne V2 API | 역할 | 에러 |
|---|---|---|---|
| `verifyPayment(paymentId, expectedAmount)` | `GET /payments/{paymentId}` | 결제 상태 `PAID` 확인 + `amount.total` == expectedAmount 검증 | `PAYMENT_VERIFICATION_FAILED` (50002), `PAYMENT_NOT_PAID` (40006), `PAYMENT_AMOUNT_MISMATCH` (40007) |
| `confirmEscrow(paymentId)` | `POST /payments/{paymentId}/escrow/complete` | 에스크로 구매확인 → PG 정산 진행 | `ESCROW_CONFIRM_FAILED` (50003) |

### paymentKey (paymentId) 흐름

```
[프론트] PortOne.requestPayment() → response.paymentId
    │
    ▼
[프론트] POST /v1/api/payment/escrow { paymentKey: response.paymentId }
    │
    ▼
[백엔드] EscrowPaymentService.pay()
    → portOnePaymentClient.verifyPayment(paymentKey, amount)  // 검증
    → PaymentGenerator.createEscrowPayment(..., paymentKey)   // DB 저장
    │
    ▼
[이후] DeliveryService.approve() → EscrowPaymentService.confirmEscrow(ticketId)
    → escrowPaymentRepository.findByTicketId(ticketId)
    → payment.getPaymentKey()                                 // DB에서 조회
    → portOnePaymentClient.confirmEscrow(paymentKey)          // PortOne API 호출
```

---

## 7. 결제 수단별 수수료 (평균 거래액 ₩120,000 기준)

| 결제 수단 | 기본 수수료 | 에스크로 추가 | 12만원 시 수수료 | 전문가 수령액 |
|---|---|---|---|---|
| 계좌이체 (TRANSFER) | 2.0% | 0.2% | **₩2,640** | ₩117,360 |
| 신용카드 (CARD) | 3.4% | 0.2% | **₩4,320** | ₩115,680 |
| 간편결제 (EASY_PAY) | 3.4%+α | 0.2% | **₩4,500+** | ₩115,500 이하 |

> 영세사업자 (연매출 3억 이하) 적용 시 카드 수수료 3.4% → ~1.5%로 자동 인하.

### 수수료 최소화 전략

1. **계좌이체를 수수료 최저 수단으로 안내** — "수수료가 가장 낮은 결제 수단" 표시
2. **결제 수단별 수수료 투명 고지** — 전문가 수령액 차이를 의뢰인에게 표시
3. **영세사업자 자동 적용** — 연매출 3억 이하면 PG사에서 자동 분류

---

## 8. DB 스키마

```sql
escrow_payment
├─ escrow_payment_id (PK, BIGINT, AUTO_INCREMENT)
├─ order_id (VARCHAR, UNIQUE — uk_escrow_payment_order_id)
├─ payment_key (VARCHAR, UNIQUE — uk_escrow_payment_payment_key)
├─ ticket_id (BIGINT, INDEX — idx_escrow_payment_ticket)
├─ client_id (BIGINT)
├─ expert_id (BIGINT)
├─ amount (INT, NOT NULL)
├─ pg_fee (INT, nullable)
├─ expert_settlement_amount (INT, nullable)
├─ payment_method (VARCHAR, NOT NULL — EscrowPaymentMethod enum)
├─ status (VARCHAR, NOT NULL — EscrowPaymentStatus enum)
├─ paid_at (DATETIME, nullable)
├─ confirmed_at (DATETIME, nullable)
├─ released_at (DATETIME, nullable)
├─ settled_at (DATETIME, nullable)
├─ refunded_at (DATETIME, nullable)
├─ create_date_time (DATETIME)
└─ modified_date_time (DATETIME)
```

---

## 9. 프론트 연동 (PortOne V2)

**PortOne V2 신모듈 SDK** 사용. 구 `IMP.request_pay()` (V1) 아님에 주의.

### 에스크로 결제 (온라인 의뢰)

```javascript
const response = await PortOne.requestPayment({
    storeId: STORE_ID,
    channelKey: CHANNEL_KEY,
    paymentId: `payment-${crypto.randomUUID()}`,
    orderName: '원포인트 온라인 의뢰 결제',
    totalAmount: agreementAmount,     // 합의서 금액
    currency: 'CURRENCY_KRW',
    payMethod: 'CARD',                // 또는 TRANSFER, EASY_PAY 등
    isEscrow: true                    // ← 에스크로 활성화 (별도 채널 불필요)
});

if (response.code != null) {
    // 결제 실패 처리
    return;
}

// 결제 성공 → 백엔드 검증 요청
await fetch('/v1/api/payment/escrow', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        ticketId: ticketId,
        paymentMethod: 'CARD',
        paymentKey: response.paymentId   // PortOne paymentId → 백엔드 paymentKey
    })
});
```

### 쿠폰 구매 (일반 결제)

```javascript
const response = await PortOne.requestPayment({
    storeId: STORE_ID,
    channelKey: CHANNEL_KEY,
    paymentId: `payment-${crypto.randomUUID()}`,
    orderName: `원포인트 쿠폰 ${packageType} 패키지`,
    totalAmount: packagePrice,
    currency: 'CURRENCY_KRW',
    payMethod: 'CARD'
    // isEscrow 없음 (일반 결제)
});

if (response.code != null) return;

await fetch('/v1/api/coupon/purchase', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        packageType: 'BASIC',
        paymentMethod: 'CARD',
        paymentKey: response.paymentId
    })
});
```

### 테스트 HTML 파일

| 파일 | 용도 |
|---|---|
| `test-escrow-payment.html` | 에스크로 결제 테스트 (로그인 → 티켓 선택 → 합의서 금액 조회 → 결제 → 검증) |
| `test-payment.html` | 쿠폰 구매 결제 테스트 |

---

## 10. 환경 설정

```yaml
# application.yml
portone:
  api-secret: ${PORTONE_API_SECRET:test_portone_api_secret}
  base-url: https://api.portone.io
```

| 환경 | PORTONE_API_SECRET |
|---|---|
| 로컬/개발 | PortOne 콘솔 > API & Webhook > V2 API Secret (`test_` 접두사) |
| 운영 | 라이브 V2 API Secret |

> **참고**: PortOne 테스트/샌드박스 환경에서는 실제 에스크로 보관이 작동하지 않음 (`useEscrow: false`). 운영 환경에서만 실제 에스크로 플로우 동작.

---

## 11. 사전 준비 체크리스트

- [x] 사업자등록 (세무서/홈택스, 무료, 당일)
- [ ] 통신판매업 신고 (구청/정부24, ~₩4만)
- [ ] 보증보험 가입 (서울보증보험, ₩3~10만/년)
- [x] 포트원 가입 후 토스페이먼츠 연동 신청
- [x] 포트원 테스트 환경에서 에스크로 결제 테스트 (test-escrow-payment.html)
- [ ] 웹훅 수신 엔드포인트 개발
- [x] 결제 검증 API 개발 (PortOnePaymentClient.verifyPayment)
- [x] 에스크로 구매확인 API 개발 (PortOnePaymentClient.confirmEscrow)
- [ ] 환불 API 개발
- [ ] 자동 구매확인 스케줄러 개발
- [ ] 정산 내역 조회 화면 (전문가용)
- [x] 결제 상태 조회 API (GET /v1/api/payment/escrow/ticket/{ticketId})

## 월간 비용 시뮬레이션

의뢰인 500명, 온라인 매칭 월 210건, 평균 12만원 기준.
카드/간편결제 70% + 계좌이체 30% 비율:

| 항목 | 계산 | 금액 |
|---|---|---|
| 카드/간편결제 147건 | 147 × ₩4,320 | ₩635,040 |
| 계좌이체 63건 | 63 × ₩2,640 | ₩166,320 |
| 합계 (PG 수수료) | | **₩801,360** |
| → 전문가 부담 | | 플랫폼 비용 아님 |
| 플랫폼 부담 | 보증보험 월할 | **~₩8,000/월** |
