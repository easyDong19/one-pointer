---
name: coupon
description: 쿠폰 도메인 기획. 쿠폰 발급/예약/소진/반환, 패키지 구매, 유효기간 관리 등. 쿠폰 구매 화면, 잔여 수량 표시, 구매 내역 등 Coupon 관련 프론트엔드 작업 시 참고. /coupon 으로 호출.
---

# Coupon 도메인 (프론트엔드)

의뢰 등록 시 소모되는 이용권. 중개 수수료 0%, **쿠폰 판매가 유일한 수익원**.

## Enum/상태값

```typescript
type CouponType = 'PURCHASED' | 'WELCOME' | 'EVENT'
type CouponStatus = 'AVAILABLE' | 'RESERVED' | 'CONSUMED' | 'RETURNED' | 'EXPIRED' | 'REFUNDED'
type PackageType = 'TRIAL' | 'BASIC' | 'STANDARD' | 'PREMIUM'
type PaymentMethod = 'CARD' | 'KAKAO_PAY' | 'TOSS'
type PurchaseStatus = 'PAID' | 'REFUNDED' | 'PARTIAL_REFUNDED' | 'FAILED'
```

### 쿠폰 상태 전이 + UI 라벨

| 상태 | UI 라벨 | 전이 조건 |
|------|---------|-----------|
| `AVAILABLE` | 사용 가능 | 구매/발급 시 |
| `RESERVED` | 사용 예정 | 의뢰 등록 시 (ticketId 연결) |
| `CONSUMED` | 사용 완료 | 매칭 확정 시 (**환불 불가**) |
| `RETURNED` | 반환됨 | 매칭 전 취소/만료 시 |
| `EXPIRED` | 만료됨 | 유효기간 경과 |
| `REFUNDED` | 환불됨 | 구매 환불 시 |

```
AVAILABLE → RESERVED → CONSUMED (최종 소진, 환불 불가)
                     → RETURNED (매칭 전 취소/만료 시만)
AVAILABLE → EXPIRED / REFUNDED
```

## 패키지 상품

| PackageType | 쿠폰 수 | 가격 | 장당 | 설명 |
|-------------|----------|------|------|------|
| `TRIAL` | 1장 | ₩3,000 | ₩3,000 | 첫 체험 |
| `BASIC` | 3장 | ₩7,500 | ₩2,500 | 기본 |
| `STANDARD` | 5장 | ₩10,000 | ₩2,000 | 할인 |
| `PREMIUM` | 10장 | ₩15,000 | ₩1,500 | 최대 할인 |

## 데이터 모델

```typescript
interface Coupon {
  id: number
  userId: number
  couponType: CouponType
  status: CouponStatus        // 기본: AVAILABLE
  ticketId?: number            // RESERVED/CONSUMED 시
  eventCode?: string           // WELCOME은 "WELCOME", EVENT는 이벤트별 코드
  expiredAt?: string           // 유효기간 만료일
  usedAt?: string              // CONSUMED 시점
  createDateTime: string       // 발급일
}

interface CouponPurchase {
  id: number
  userId: number
  packageType: PackageType
  quantity: number
  totalPrice: number           // 원
  paymentMethod: PaymentMethod
  status: PurchaseStatus
  refundedCount: number        // 기본: 0
  createDateTime: string
}
```

## 워크플로

### 쿠폰 구매

```
1. 패키지 선택 (TRIAL / BASIC / STANDARD / PREMIUM)
2. 결제 수단 선택 (CARD / KAKAO_PAY / TOSS)
3. 결제 진행 (PG 연동)
4. 완료 → 쿠폰 N장 발급 (AVAILABLE)
```

### 쿠폰 소비 사이클

```
구매/발급 → AVAILABLE (잔여 수량에 포함)
  ├─ 의뢰 등록 → RESERVED (잔여에서 차감, "사용 예정"에 표시)
  │   ├─ 매칭 확정 → CONSUMED (사용 완료, 환불 불가)
  │   └─ 매칭 전 취소/만료 → RETURNED (잔여 수량 복구)
  ├─ 유효기간 만료 → EXPIRED
  └─ 구매 환불 → REFUNDED
```

### 잔여 수량 표시

```typescript
// 쿠폰 현황 화면에 표시할 수치
const available = coupons.filter(c => c.status === 'AVAILABLE').length  // "사용 가능"
const reserved = coupons.filter(c => c.status === 'RESERVED').length    // "사용 예정"
const consumed = coupons.filter(c => c.status === 'CONSUMED').length    // "사용 완료"
```

## 정책

- 유효기간: **구매일 + 6개월** (모든 쿠폰 공통)
- 가입 시 웰컴 쿠폰 **1장** 자동 발급 (계정당 1회)
- **매칭 확정(CONSUMED) 이후 환불 불가**
- 쿠폰 반환(RETURNED)은 매칭 전 취소/만료 시에만
- 환불 시 미사용(AVAILABLE) 쿠폰만 환불 가능 (부분 환불 지원)
- 의뢰 등록 시 AVAILABLE 쿠폰 **1장 이상 필수** → 부족 시 구매 유도

## 악용 방지 (프론트 UX 고려사항)

| 위험 | 대응 |
|------|------|
| 결제 사기 / 부정 결제 | PG사 결제 검증 |
| 쿠폰 반복 환불 | 환불 횟수/패턴 모니터링 |
| 예약만 하고 취소 반복 | 반복 취소 패턴 감지, 제한 |
| 이벤트 쿠폰 대량 수집 (다계정) | 웰컴 쿠폰 계정당 1회, 본인인증 |

## 알림

| 이벤트 | 수신자 | 메시지 |
|--------|--------|--------|
| 쿠폰 발급 (구매) | 의뢰인 | "쿠폰 N장이 발급되었어요!" |
| 쿠폰 발급 (웰컴) | 의뢰인 | "가입을 환영해요! 체험 쿠폰 1장 지급!" |
| 쿠폰 예약 | 의뢰인 | "의뢰 등록 완료! 쿠폰 1장 예약됨." |
| 쿠폰 반환 | 의뢰인 | "의뢰 취소로 쿠폰 1장이 반환되었어요." |
| 잔여 부족 | 의뢰인 | "쿠폰이 부족해요. 충전하고 의뢰를 등록하세요!" |
| 만료 임박 | 의뢰인 | "쿠폰 N장이 곧 만료됩니다." |

## 기능 체크리스트

### 의뢰인
- [ ] 쿠폰 잔여 수량 조회
- [ ] 패키지 선택 → 결제 → 쿠폰 발급
- [ ] 쿠폰 사용 내역 조회
- [ ] 구매 내역 조회
- [ ] 의뢰 등록 시 쿠폰 자동 예약
- [ ] 쿠폰 부족 시 구매 화면 유도
