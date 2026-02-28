---
name: fe-payment
description: 프론트엔드 결제(Payment) 도메인 가이드. 온라인 의뢰 에스크로 결제(PortOne V2 + 토스페이먼츠), 결제 상태 조회 등 Payment 관련 프론트엔드 구현 시 참고한다. 쿠폰 구매 결제는 /fe-coupon 참고.
---

# Payment 프론트엔드 가이드

## 개요

**온라인 의뢰 전용** 에스크로 안전결제. 합의서(Agreement) 확정 후 의뢰인이 결제.
- PG: **PortOne V2** + 토스페이먼츠
- 에스크로 방식: 결제 금액을 PG가 보관 → 거래 완료 시 전문가에게 정산
- 오프라인 의뢰: 플랫폼 미개입 (당사자 직접 결제)

## 결제 구분

| 결제 대상 | 방식 | 참고 스킬 |
|-----------|------|-----------|
| 쿠폰 구매 | 일반 결제 | `/fe-coupon` |
| 온라인 의뢰 서비스 대금 | **에스크로 결제** | 이 스킬 |
| 오프라인 서비스 대금 | 플랫폼 미개입 | — |

## 에스크로 결제 흐름

```
합의서 CONFIRMED → 티켓 PAYMENT_PENDING
    │
    ▼
[프론트] PortOne V2 SDK requestPayment({ isEscrow: true })
    │ → 결제창 → 결제 완료 → paymentId 수신
    ▼
[프론트] POST /v1/api/payment/escrow { ticketId, paymentMethod, paymentKey }
    │
    ▼
[백엔드] 결제 검증 + EscrowPayment 생성
    → 티켓 PAID → IN_PROGRESS
    → 채팅 시스템 메시지: "결제 완료"
    → 양쪽 알림
    │
    ▼
(전문가 서비스 진행 → 작업물 전달 → 의뢰인 승인)
    │
    ▼
[백엔드] 에스크로 구매확인 → 전문가 정산
```

---

## TypeScript 타입 정의

```typescript
// ========== Enums ==========

type EscrowPaymentStatus =
  | 'PENDING'
  | 'ESCROW_HELD'
  | 'WORK_IN_PROGRESS'
  | 'DELIVERED'
  | 'REVISION_REQUESTED'
  | 'CONFIRMED'
  | 'AUTO_CONFIRMED'
  | 'SETTLED'
  | 'REFUND_REQUESTED'
  | 'REFUNDED'
  | 'DISPUTE'
  | 'CANCELLED'
  | 'FAILED';

type EscrowPaymentMethod = 'CARD' | 'EASY_PAY' | 'TRANSFER';

// ========== Request/Response ==========

interface EscrowPaymentRequest {
  ticketId: number;
  paymentMethod: EscrowPaymentMethod;
  paymentKey: string;          // PortOne에서 받은 paymentId
}

interface EscrowPaymentResponse {
  id: number;
  orderId: string;
  ticketId: number;
  amount: number;
  paymentMethod: EscrowPaymentMethod;
  status: EscrowPaymentStatus;
  paidAt: string;
}
```

---

## API 엔드포인트

| Method | URL | 설명 | 인증 |
|--------|-----|------|------|
| POST | `/v1/api/payment/escrow` | 에스크로 결제 | JWT (Client) |
| GET | `/v1/api/payment/escrow/ticket/{ticketId}` | 결제 정보 조회 | JWT |

---

## 에러 코드

| 코드 | 설명 | UI 처리 |
|------|------|---------|
| 40035 | PAYMENT_PENDING이 아닌 티켓 | "결제 대기 상태에서만 결제할 수 있습니다" |
| 40036 | 이미 결제 완료된 티켓 | "이미 결제가 완료된 의뢰입니다" |
| 40006 | PortOne 상태 오류 | "결제가 완료되지 않았습니다" |
| 40007 | 결제 금액 불일치 | "결제 금액이 일치하지 않습니다" |
| 40008 | 중복 결제 키 | "이미 처리된 결제입니다" |
| 50002 | 결제 검증 실패 | "결제 검증 실패. 고객센터에 문의해주세요" |

---

## 프론트엔드 구현 가이드

### PortOne V2 SDK 설정

```bash
npm install @portone/browser-sdk
```

```typescript
// .env.local
NEXT_PUBLIC_PORTONE_STORE_ID=store-xxx
NEXT_PUBLIC_PORTONE_CHANNEL_KEY=channel-xxx
```

### 에스크로 결제 구현

```typescript
import PortOne from '@portone/browser-sdk/v2';

interface PaymentParams {
  ticketId: number;
  amount: number;          // Agreement.finalPrice
  ticketTitle: string;
}

async function processEscrowPayment({ ticketId, amount, ticketTitle }: PaymentParams) {
  // 1. PortOne 결제 요청 (에스크로)
  const paymentId = `ESCROW-${ticketId}-${Date.now()}`;

  const response = await PortOne.requestPayment({
    storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
    channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!,
    paymentId,
    orderName: `원포인트 의뢰: ${ticketTitle}`,
    totalAmount: amount,
    currency: 'CURRENCY_KRW',
    payMethod: 'CARD',
    isEscrow: true,            // 에스크로 필수!
  });

  // 결제 실패 또는 사용자 취소
  if (response?.code) {
    if (response.code === 'USER_CANCEL') {
      showToast('결제가 취소되었습니다');
      return null;
    }
    throw new Error(response.message);
  }

  // 2. 백엔드에 결제 검증 요청
  const result = await api.post('/v1/api/payment/escrow', {
    ticketId,
    paymentMethod: 'CARD',
    paymentKey: response!.paymentId,
  });

  return result.data.data as EscrowPaymentResponse;
}
```

### 결제 페이지 흐름

```
1. 합의서 확정 알림 수신 (or 채팅방에서 "결제하기" 버튼)
2. 결제 상세 확인 화면
   - 의뢰 제목
   - 합의 금액: ₩50,000
   - 결제 수단 선택 (카드/간편결제/계좌이체)
   - "에스크로 안전결제로 결제 금액이 거래 완료까지 안전하게 보관됩니다"
3. 결제 버튼 → PortOne 결제창
4. 결제 성공 → 백엔드 검증 → 완료 화면
5. 채팅 화면으로 이동
```

### 결제 상태 조회 & 표시

```typescript
// 결제 정보 조회
const payment = await api.get(`/v1/api/payment/escrow/ticket/${ticketId}`);

// 상태별 UI 표시
function PaymentStatusBadge({ status }: { status: EscrowPaymentStatus }) {
  const config: Record<EscrowPaymentStatus, { label: string; color: string }> = {
    PENDING: { label: '결제 대기', color: 'gray' },
    ESCROW_HELD: { label: '결제 완료 (보관 중)', color: 'blue' },
    WORK_IN_PROGRESS: { label: '서비스 진행 중', color: 'blue' },
    DELIVERED: { label: '작업물 전달됨', color: 'yellow' },
    REVISION_REQUESTED: { label: '수정 요청', color: 'orange' },
    CONFIRMED: { label: '완료 확인', color: 'green' },
    AUTO_CONFIRMED: { label: '자동 완료', color: 'green' },
    SETTLED: { label: '정산 완료', color: 'green' },
    REFUND_REQUESTED: { label: '환불 요청', color: 'red' },
    REFUNDED: { label: '환불 완료', color: 'gray' },
    DISPUTE: { label: '분쟁 처리 중', color: 'red' },
    CANCELLED: { label: '취소됨', color: 'gray' },
    FAILED: { label: '결제 실패', color: 'red' },
  };

  const { label, color } = config[status];
  return <Badge color={color}>{label}</Badge>;
}
```

### 결제 수단별 수수료 안내 (전문가 정산 시 차감)

| 결제 수단 | PG 수수료 | 부담 |
|-----------|-----------|------|
| 카드 | ~3.6% | 전문가 |
| 간편결제 | ~3.6% | 전문가 |
| 계좌이체 | ~0.2% | 전문가 |

- 플랫폼 중개 수수료: **0%**
- PG 수수료만 전문가 부담 (정산 시 차감)

### 에스크로 안내 문구 (사용자 노출)

| 시점 | 문구 |
|------|------|
| 결제 화면 | "에스크로 안전결제: 결제 금액이 거래 완료까지 안전하게 보관됩니다" |
| 결제 완료 | "결제가 완료되었습니다. 서비스 완료 후 전문가에게 정산됩니다" |
| 작업물 승인 시 | "거래가 완료되어 전문가에게 정산이 진행됩니다" |

### 환불 정책 요약 (프론트 표시용)

| 상태 | 환불 |
|------|------|
| 결제 후 서비스 시작 전 | 전액 환불 가능 |
| 서비스 진행 중 | 고객센터 중재 필요 |
| 작업물 전달 후 | 고객센터 중재 필요 |
| 완료 확인 / 자동 완료 후 | 환불 불가 |
| 정산 완료 후 | 환불 불가 |

### 중요 비즈니스 룰

1. **온라인 의뢰만**: 오프라인 의뢰에서는 결제 UI 미표시
2. **합의서 확정 필수**: PAYMENT_PENDING 상태에서만 결제 가능
3. **isEscrow: true 필수**: PortOne 호출 시 에스크로 옵션 반드시 활성화
4. **결제 금액 = Agreement.finalPrice**: 합의서에 확정된 금액과 정확히 일치해야 함
5. **자동 구매확인**: 작업물 전달 후 7일 무응답 시 자동 정산
