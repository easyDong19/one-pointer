---
name: coupon
description: 쿠폰 도메인 프론트엔드 구현 가이드. 쿠폰 잔여 조회, 패키지 구매(PortOne V2 결제), 이벤트/웰컴 쿠폰 수령, 구매 내역 조회 등 Coupon 도메인 관련 프론트엔드 작업 시 사용. /coupon 으로 호출하거나 쿠폰·구매·잔여 UI를 다룰 때 참고한다.
---

# Coupon 도메인

의뢰 등록 시 소모되는 쿠폰(이용권). 패키지 구매 또는 이벤트로 발급되며, 프론트에서는 잔여 조회, 구매(결제), 수령 요청을 처리한다.

## 수익 모델

- 중개 수수료 0% — 쿠폰 판매가 유일한 수익원
- 쿠폰 1장 = 의뢰 1건 등록 권한
- 패키지 단위로 구매 (할인율 적용)

## 쿠폰 상태 (CouponStatus)

```
[발급] AVAILABLE
  → [의뢰 등록] RESERVED (ticketId 연결)
     → [매칭 확정] CONSUMED (usedAt 기록) ← 최종 소진, 이후 환불 불가
     → [매칭 전 취소/만료] RETURNED (ticketId 해제)
  → [기간 만료] EXPIRED
  → [구매 환불] REFUNDED
```

### 쿠폰 환불 불가 정책
- **매칭 확정(MATCHED) 시점에 쿠폰은 최종 소진(CONSUMED)**
- 매칭 이후에는 어떤 사유로든 쿠폰이 반환되지 않음 (합의 실패, 온라인 결제 미진행, 서비스 불만족 등)
- 쿠폰 반환(RETURNED)은 **매칭 전(OPEN/IN_REVIEW) 취소/만료 시에만** 발생

### 사용 이력 있는 쿠폰 현금 환불 불가 정책
- 한 번이라도 티켓에 사용(RESERVED)된 이력이 있는 쿠폰은 **현금 환불 불가**
- 매칭 전 취소/만료 시 쿠폰은 RETURNED 상태로 반환되어 **새 티켓 등록에 재사용 가능**
- 단, RETURNED 쿠폰은 구매 환불(REFUNDED) 대상에서 제외됨
- 구매 환불 시 AVAILABLE 상태(한 번도 사용하지 않은) 쿠폰만 환불 가능

## Enum 정의

| Enum | 값 |
|------|-----|
| `CouponType` | `PURCHASED`, `WELCOME`, `EVENT` |
| `CouponStatus` | `AVAILABLE`, `RESERVED`, `CONSUMED`, `RETURNED`, `EXPIRED`, `REFUNDED` |
| `PackageType` | `TRIAL`, `BASIC`, `STANDARD`, `PREMIUM`, `CONTACT_SINGLE`, `CONTACT_BASIC`, `CONTACT_STANDARD`, `CONTACT_PREMIUM` |
| `CouponUsageType` | `TICKET`, `DIRECT_REQUEST` |
| `PurchaseStatus` | `PAID`, `REFUNDED`, `PARTIAL_REFUNDED`, `FAILED` |
| `PaymentMethod` | `CARD`, `KAKAO_PAY`, `TOSS` |

## 패키지 상품

### 티켓 쿠폰 (usageType = TICKET)

| PackageType | 쿠폰 수 | 가격 | 장당 가격 | 비고 |
|-------------|----------|------|-----------|------|
| TRIAL | 1장 | ₩3,000 | ₩3,000 | 첫 체험용 |
| BASIC | 3장 | ₩7,500 | ₩2,500 | 기본 |
| STANDARD | 5장 | ₩10,000 | ₩2,000 | 할인 적용 |
| PREMIUM | 10장 | ₩15,000 | ₩1,500 | 최대 할인 |

### 직접 의뢰 쿠폰 (usageType = DIRECT_REQUEST)

| PackageType | 쿠폰 수 | 가격 | 장당 가격 | 비고 |
|-------------|----------|------|-----------|------|
| CONTACT_SINGLE | 1장 | ₩1,500 | ₩1,500 | 1회 체험 |
| CONTACT_BASIC | 3장 | ₩3,900 | ₩1,300 | 기본 |
| CONTACT_STANDARD | 5장 | ₩5,500 | ₩1,100 | 할인 적용 |
| CONTACT_PREMIUM | 10장 | ₩9,000 | ₩900 | 최대 할인 |

- `CONTACT_`로 시작하는 패키지는 `DIRECT_REQUEST` 용도, 나머지는 `TICKET` 용도

## 쿠폰 유효기간

- 모든 쿠폰: **구매일/발급일 + 12개월** (공통)
- 유효기간 만료 시 백엔드 스케줄러가 자동 EXPIRED 처리
- 이벤트/웰컴 쿠폰도 동일한 유효기간 적용

## API 엔드포인트

| Method | URL | 설명 | 인증 |
|---|---|---|---|
| POST | `/v1/api/coupon/claim` | 이벤트/웰컴 쿠폰 수령 | JWT |
| POST | `/v1/api/coupon/purchase` | 쿠폰 패키지 구매 (결제 검증 포함) | JWT |
| GET | `/v1/api/coupon/balance` | 티켓 쿠폰 잔여 수량 조회 | JWT |
| GET | `/v1/api/coupon/balance/direct-request` | 직접 의뢰 쿠폰 잔여 수량 조회 | JWT |
| GET | `/v1/api/coupon/purchases` | 쿠폰 구매 내역 조회 (커서 페이지네이션) | JWT |

## 결제 연동 (PortOne V2)

쿠폰 패키지 구매 시 **PortOne V2 신모듈 + 토스페이먼츠**를 통해 결제한다.

### 결제 플로우 (프론트엔드 중심)

```
[1. 패키지 선택] 사용자가 패키지 타입 + 결제 수단 선택
    │
    ▼
[2. PortOne SDK] PortOne.requestPayment({
      storeId, channelKey, paymentId (UUID 생성),
      orderName: "쿠폰 패키지 - {packageType}",
      totalAmount: PackageType 가격,
      currency: "KRW",
      payMethod: "CARD" | "EASY_PAY",
    })
    → 결제창 열림 → 사용자 결제 → response 수신
    │
    ▼
[3. 결제 결과 확인]
    response.code 존재 → 결제 실패/취소 → 에러 처리
    response.paymentId 존재 → 결제 성공
    │
    ▼
[4. 백엔드 검증] POST /v1/api/coupon/purchase
    body: { packageType, paymentMethod, paymentKey: response.paymentId }
    → 백엔드가 PortOne API로 결제 검증 → 쿠폰 발급 → 응답 반환
    │
    ▼
[5. 후처리]
    성공 → couponQueryKeys.balance / purchases 캐시 무효화 → 성공 UI
    실패 → 에러 토스트 표시
```

### PortOne V2 프론트 연동 패턴

```typescript
import PortOne from "@portone/browser-sdk/v2"

// 결제 요청
const response = await PortOne.requestPayment({
  storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
  channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!,
  paymentId: crypto.randomUUID(),
  orderName: `쿠폰 패키지 - ${packageType}`,
  totalAmount: PACKAGE_PRICES[packageType],
  currency: "KRW",
  payMethod: "CARD",
})

// 결제 결과 확인
if (response?.code) {
  throw new Error(response.message)
}

// 백엔드 검증 요청
const result = await purchaseCoupon({
  packageType,
  paymentMethod,
  paymentKey: response!.paymentId,
})
```

### 환경변수

```env
NEXT_PUBLIC_PORTONE_STORE_ID=store-xxx
NEXT_PUBLIC_PORTONE_CHANNEL_KEY=channel-xxx
```

## 에러코드

| 코드 | ErrorCode | 설명 | 프론트 처리 |
|---|---|---|---|
| 40002 | `INSUFFICIENT_COUPON` | 사용 가능한 쿠폰 부족 | 쿠폰 구매 유도 UI |
| 40003 | `ALREADY_CLAIMED_COUPON` | 이미 수령한 쿠폰 (중복 수령 방지) | "이미 수령한 쿠폰입니다" 토스트 |
| 40004 | `INVALID_COUPON_CLAIM_TYPE` | WELCOME/EVENT 아닌 유형으로 수령 시도 | 에러 토스트 |
| 40005 | `EVENT_CODE_REQUIRED` | EVENT 쿠폰인데 eventCode 미입력 | 에러 토스트 |
| 40006 | `PAYMENT_NOT_PAID` | PortOne 상태가 PAID가 아님 | "결제 확인 실패" 에러 |
| 40007 | `PAYMENT_AMOUNT_MISMATCH` | 결제 금액 ≠ 패키지 가격 | "결제 금액 불일치" 에러 |
| 40008 | `DUPLICATE_PAYMENT_KEY` | 이미 처리된 paymentKey | "이미 처리된 결제입니다" 토스트 |
| 40086 | `INSUFFICIENT_DIRECT_REQUEST_COUPON` | 직접 의뢰 쿠폰 부족 | 직접 의뢰 쿠폰 구매 유도 UI |
| 50002 | `PAYMENT_VERIFICATION_FAILED` | PortOne API 호출 실패 | "결제 검증 실패. 다시 시도해주세요" |

## 프론트엔드 구현 가이드

### FSD 파일 구조

```
src/
├── entities/coupon/
│   ├── api/
│   │   ├── coupon.schema.ts          # zod v4 스키마 (enum, request, response)
│   │   └── coupon.service.ts         # Service Layer (clientFetch + zod 검증)
│   └── model/
│       └── coupon.query-keys.ts      # TanStack Query 키 팩토리
│
└── features/coupon/
    ├── purchase/                     # 쿠폰 구매 (패키지 선택 + PortOne 결제)
    │   ├── model/                    # usePurchaseCoupon mutation hook
    │   └── ui/                      # 패키지 선택 UI, 결제 버튼
    ├── claim/                        # 이벤트/웰컴 쿠폰 수령
    │   ├── model/                    # useClaimCoupon mutation hook
    │   └── ui/                      # 쿠폰 수령 버튼/모달
    ├── balance/                      # 쿠폰 잔여 수량 조회
    │   ├── model/                    # useCouponBalance query hook
    │   └── ui/                      # 잔여 수량 표시 UI
    └── purchases/                    # 구매 내역 조회
        ├── model/                    # useCouponPurchases infinite query hook
        └── ui/                      # 구매 내역 리스트
```

### Service Layer

`coupon.service.ts`에 구현된 서비스 함수:

| 함수 | HTTP | 설명 |
|---|---|---|
| `purchaseCoupon(input)` | POST `/v1/api/coupon/purchase` | 패키지 구매 (결제 검증 포함) |
| `claimCoupon(input)` | POST `/v1/api/coupon/claim` | 이벤트/웰컴 쿠폰 수령 |
| `getCouponPurchases(params?)` | GET `/v1/api/coupon/purchases` | 구매 내역 조회 (커서 페이지네이션) |
| `getCouponBalance()` | GET `/v1/api/coupon/balance` | 티켓 쿠폰 잔여 수량 |
| `getDirectRequestCouponBalance()` | GET `/v1/api/coupon/balance/direct-request` | 직접 의뢰 쿠폰 잔여 수량 |

모든 서비스 함수는 `clientFetch` + `parseSchemaOrThrow` (zod v4) 패턴을 따른다.

### Query Keys

```typescript
export const couponQueryKeys = {
  all: ["coupon"] as const,
  balance: ["coupon", "balance"] as const,
  directRequestBalance: ["coupon", "balance", "direct-request"] as const,
  purchases: (params?: { cursor?: string; size?: number }) =>
    ["coupon", "purchases", params] as const,
}
```

### Query Hook 구현 패턴

#### 잔여 수량 조회 (useQuery)

```typescript
export function useCouponBalance() {
  return useQuery({
    queryKey: couponQueryKeys.balance,
    queryFn: getCouponBalance,
  })
}
```

#### 구매 내역 조회 (useInfiniteQuery)

```typescript
export function useCouponPurchases() {
  return useInfiniteQuery({
    queryKey: couponQueryKeys.purchases(),
    queryFn: ({ pageParam }) =>
      getCouponPurchases({ cursor: pageParam, size: 20 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
  })
}
```

#### 패키지 구매 (useMutation)

```typescript
export function usePurchaseCoupon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: purchaseCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponQueryKeys.balance })
      queryClient.invalidateQueries({ queryKey: couponQueryKeys.purchases() })
    },
  })
}
```

### 캐시 무효화 전략

| 이벤트 | 무효화 대상 |
|---|---|
| 쿠폰 구매 성공 | `couponQueryKeys.balance`, `couponQueryKeys.purchases()` |
| 쿠폰 수령 성공 | `couponQueryKeys.balance` |
| 의뢰 등록 성공 (다른 도메인) | `couponQueryKeys.balance` (쿠폰 RESERVED로 잔여 감소) |
| 의뢰 취소 (다른 도메인) | `couponQueryKeys.balance` (쿠폰 RETURNED로 잔여 증가) |

## 알림

| 이벤트 | 수신자 | 메시지 | 구현 |
|--------|--------|--------|------|
| 만료 임박 | 의뢰인 | `COUPON_EXPIRING`: "쿠폰 N장이 7일 이내에 만료됩니다." | 구현 완료 |

## 기능 체크리스트

### 프론트엔드 (의뢰인)
- [x] 쿠폰 잔여 수량 조회 — Service 구현 완료
- [x] 직접 의뢰 쿠폰 잔여 수량 조회 — Service 구현 완료
- [x] 구매 내역 조회 — Service 구현 완료 (커서 페이지네이션)
- [x] 패키지 구매 Service — Service 구현 완료
- [x] 이벤트/웰컴 쿠폰 수령 Service — Service 구현 완료
- [ ] 패키지 선택 UI (패키지 목록 + 가격 표시)
- [ ] PortOne V2 결제 연동 (requestPayment → purchaseCoupon mutation)
- [ ] 쿠폰 잔여 수량 표시 UI
- [ ] 구매 내역 리스트 UI (무한 스크롤)
- [ ] 웰컴 쿠폰 수령 UI (신규 가입 후)
- [ ] 쿠폰 부족 시 구매 유도 UI (의뢰 등록 시)
- [ ] Query Hook 구현

## 데이터 상세

- **[coupon-data.md](references/coupon-data.md)** — Coupon, CouponPurchase, CouponLog 필드, DTO 상세
