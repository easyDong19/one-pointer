---
name: fe-coupon
description: 프론트엔드 쿠폰(Coupon) 도메인 가이드. 쿠폰 패키지 구매(PortOne V2 결제), 잔여 확인, 구매 내역, 웰컴/이벤트 쿠폰 수령 등 Coupon 관련 프론트엔드 구현 시 참고한다.
---

# Coupon 프론트엔드 가이드

## 개요

쿠폰 = 의뢰 등록 권한. 쿠폰 판매가 플랫폼의 유일한 수익원 (중개 수수료 0%).
- **티켓 쿠폰**: 공개 의뢰 등록 시 사용
- **직접 의뢰 쿠폰**: 특정 전문가에게 직접 의뢰 시 사용

## 쿠폰 상태 흐름

```
AVAILABLE (구매/발급 직후, 사용 가능)
  ├── RESERVED (티켓 등록 시 예약)
  │     ├── CONSUMED (매칭 확정, 환불 불가)
  │     └── RETURNED (매칭 전 취소/만료 → 재사용 가능, 현금 환불 불가)
  ├── EXPIRED (6개월 유효기간 초과)
  └── REFUNDED (구매 환불 — AVAILABLE만 가능)
```

**핵심 정책**:
- 매칭 확정(CONSUMED) 이후 쿠폰 반환/환불 절대 불가
- RETURNED 쿠폰은 재사용만 가능, 현금 환불 불가
- 환불은 AVAILABLE 상태(한 번도 사용 안 한) 쿠폰만 가능

---

## TypeScript 타입 정의

```typescript
// ========== Enums ==========

type CouponType = 'PURCHASED' | 'WELCOME' | 'EVENT';
type CouponStatus = 'AVAILABLE' | 'RESERVED' | 'CONSUMED' | 'RETURNED' | 'EXPIRED' | 'REFUNDED';
type CouponUsageType = 'TICKET' | 'DIRECT_REQUEST';
type PackageType = 'TRIAL' | 'BASIC' | 'STANDARD' | 'PREMIUM' | 'CONTACT_SINGLE' | 'CONTACT_BASIC' | 'CONTACT_STANDARD' | 'CONTACT_PREMIUM';
type PurchaseStatus = 'PAID' | 'REFUNDED' | 'PARTIAL_REFUNDED' | 'FAILED';
type PaymentMethod = 'CARD' | 'KAKAO_PAY' | 'TOSS';

// ========== 패키지 정보 (프론트 상수) ==========

const TICKET_PACKAGES = [
  { type: 'TRIAL',    quantity: 1,  price: 3000,  unitPrice: 3000, label: '체험' },
  { type: 'BASIC',    quantity: 3,  price: 7500,  unitPrice: 2500, label: '기본' },
  { type: 'STANDARD', quantity: 5,  price: 10000, unitPrice: 2000, label: '할인' },
  { type: 'PREMIUM',  quantity: 10, price: 15000, unitPrice: 1500, label: '최대 할인' },
] as const;

const DIRECT_REQUEST_PACKAGES = [
  { type: 'CONTACT_SINGLE',   quantity: 1,  price: 1500, unitPrice: 1500, label: '1회 체험' },
  { type: 'CONTACT_BASIC',    quantity: 3,  price: 3900, unitPrice: 1300, label: '기본' },
  { type: 'CONTACT_STANDARD', quantity: 5,  price: 5500, unitPrice: 1100, label: '할인' },
  { type: 'CONTACT_PREMIUM',  quantity: 10, price: 9000, unitPrice: 900,  label: '최대 할인' },
] as const;

// ========== Request/Response ==========

interface PurchaseCouponRequest {
  packageType: PackageType;
  paymentMethod: PaymentMethod;
  paymentKey: string;          
}

interface CouponPurchaseResponse {
  id: number;
  packageType: PackageType;
  quantity: number;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  status: PurchaseStatus;
  createdAt: string;
}

interface CouponBalanceResponse {
  balance: number;             // 사용 가능한 쿠폰 수
}

interface ClaimCouponRequest {
  couponType: 'WELCOME' | 'EVENT';  // PURCHASED 불가
  eventCode?: string;                // EVENT 시 필수, WELCOME 시 자동
}

interface CouponClaimResponse {
  couponId: number;
  couponType: CouponType;
  status: CouponStatus;
  expiredAt: string;
}

interface CouponPurchaseHistoryResponse {
  id: number;
  packageType: PackageType;
  quantity: number;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  status: PurchaseStatus;
  createdAt: string;
}
```

---

## API 엔드포인트

| Method | URL | 설명 | 인증 |
|--------|-----|------|------|
| POST | `/v1/api/coupon/purchase` | 쿠폰 패키지 구매 | JWT |
| POST | `/v1/api/coupon/claim` | 웰컴/이벤트 쿠폰 수령 | JWT |
| GET | `/v1/api/coupon/balance` | 티켓 쿠폰 잔여 수량 | JWT |
| GET | `/v1/api/coupon/balance/direct-request` | 직접 의뢰 쿠폰 잔여 수량 | JWT |
| GET | `/v1/api/coupon/purchases` | 구매 내역 조회 | JWT |

---

## 에러 코드

| 코드 | 설명 | UI 처리 |
|------|------|---------|
| 40002 | 쿠폰 부족 (일반) | 쿠폰 구매 페이지로 안내 |
| 40003 | 이미 수령한 쿠폰 | "이미 수령한 쿠폰입니다" |
| 40004 | 잘못된 쿠폰 유형 | — |
| 40005 | 이벤트 코드 미입력 | "이벤트 코드를 입력해주세요" |
| 40006 | 결제 상태 오류 | "결제가 완료되지 않았습니다. 다시 시도해주세요" |
| 40007 | 결제 금액 불일치 | "결제 금액이 일치하지 않습니다" |
| 40008 | 중복 결제 키 | "이미 처리된 결제입니다" |
| 40086 | 직접 의뢰 쿠폰 부족 | 직접 의뢰 쿠폰 구매 안내 |
| 50002 | 결제 검증 실패 | "결제 검증에 실패했습니다. 고객센터에 문의해주세요" |

---

## 프론트엔드 구현 가이드

### 페이지 구조 (추천)

```
/coupon
├── /purchase                 # 쿠폰 구매 (패키지 선택 → 결제)
│   ├── /ticket               # 일반 쿠폰 패키지
│   └── /direct-request       # 직접 의뢰 쿠폰 패키지
├── /balance                  # 쿠폰 잔여 현황
└── /history                  # 구매 내역
```

### PortOne V2 결제 연동 (쿠폰 구매)

```typescript
import PortOne from '@portone/browser-sdk/v2';

async function purchaseCoupon(packageType: PackageType) {
  const pkg = [...TICKET_PACKAGES, ...DIRECT_REQUEST_PACKAGES]
    .find(p => p.type === packageType)!;

  // 1. PortOne 결제 요청
  const response = await PortOne.requestPayment({
    storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
    channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!,
    paymentId: `COUPON-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    orderName: `원포인트 쿠폰 ${pkg.quantity}장`,
    totalAmount: pkg.price,
    currency: 'CURRENCY_KRW',
    payMethod: 'CARD',
  });

  if (response?.code) {
    // 결제 실패 또는 사용자 취소
    throw new Error(response.message);
  }

  // 2. 백엔드에 결제 검증 요청
  const result = await api.post('/v1/api/coupon/purchase', {
    packageType,
    paymentMethod: 'CARD',
    paymentKey: response!.paymentId,
  });

  return result.data; // CouponPurchaseResponse
}
```

### 쿠폰 잔량 표시

```typescript
// 헤더 또는 마이페이지에서 잔량 표시
async function getCouponBalances() {
  const [ticketBalance, directBalance] = await Promise.all([
    api.get('/v1/api/coupon/balance'),
    api.get('/v1/api/coupon/balance/direct-request'),
  ]);

  return {
    ticket: ticketBalance.data.data.balance,        // 일반 쿠폰
    directRequest: directBalance.data.data.balance,  // 직접 의뢰 쿠폰
  };
}
```

### 웰컴 쿠폰 수령

```typescript
// 회원가입 직후 또는 첫 로그인 시
async function claimWelcomeCoupon() {
  try {
    await api.post('/v1/api/coupon/claim', {
      couponType: 'WELCOME',
      // eventCode 불필요 (서버에서 자동 설정)
    });
    showToast('환영 쿠폰 1장이 지급되었습니다!');
  } catch (e) {
    if (e.response?.data?.data === 40003) {
      // 이미 수령 — 무시
    }
  }
}
```

### 티켓 등록 시 쿠폰 예약 안내

```typescript
// 티켓 등록 전 쿠폰 잔량 체크
const balance = await getCouponBalances();
const isDirectRequest = !!targetExpertId;

if (isDirectRequest && balance.directRequest < 1) {
  // 직접 의뢰 쿠폰 부족 → 구매 안내
  showModal({
    title: '직접 의뢰 쿠폰이 부족합니다',
    description: '직접 의뢰 쿠폰을 구매하시겠습니까?',
    action: () => router.push('/coupon/purchase/direct-request'),
  });
  return;
}

if (!isDirectRequest && balance.ticket < 1) {
  // 일반 쿠폰 부족 → 구매 안내
  showModal({
    title: '쿠폰이 부족합니다',
    description: '쿠폰을 구매하시겠습니까?',
    action: () => router.push('/coupon/purchase/ticket'),
  });
  return;
}

// 안내 문구 표시
showConfirm({
  message: isDirectRequest
    ? '직접 의뢰 쿠폰 1장이 예약됩니다. 매칭 전 취소 시 재사용 가능하나, 현금 환불은 불가합니다.'
    : '쿠폰 1장이 예약됩니다. 매칭 전 취소 시 재사용 가능하나, 현금 환불은 불가합니다.',
});
```

### 쿠폰 유효기간

- 모든 쿠폰: 구매/발급일 + **6개월**
- 만료 임박(7일 이내) 시 푸시 알림 발송됨
- 프론트에서 쿠폰 목록 표시 시 만료일 함께 표시 권장

### 환불 안내 문구 (사용자 노출)

| 시점 | 안내 문구 |
|------|-----------|
| 쿠폰 구매 시 | "쿠폰은 의뢰에 한 번도 사용하지 않은 경우에만 환불 가능합니다" |
| 티켓 등록 시 | "쿠폰이 예약됩니다. 매칭 실패 시 재사용 가능하나, 현금 환불은 불가합니다" |
| RETURNED 쿠폰 환불 시도 | "이 쿠폰은 이전에 의뢰에 사용된 이력이 있어 환불이 불가합니다" |
