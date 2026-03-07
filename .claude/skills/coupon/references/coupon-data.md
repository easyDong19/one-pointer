# Coupon 도메인 데이터 상세

## 목차
1. [Coupon 엔티티](#1-coupon-엔티티)
2. [CouponPurchase 엔티티](#2-couponpurchase-엔티티)
3. [CouponLog 엔티티](#3-couponlog-엔티티)
4. [Repository](#4-repository)
5. [CouponGenerator](#5-coupongenerator)
6. [DTO](#6-dto)

---

## 1. Coupon 엔티티

엔티티: `one_pointer.domain.coupon.entity.Coupon`
테이블: `coupon`
- 인덱스: `idx_coupon_user` on `user_id`, `idx_coupon_status` on `status`
- Unique: `uk_coupon_user_type_event` on `(user_id, coupon_type, event_code)` — 이벤트/웰컴 쿠폰 중복 수령 방지

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `coupon_id` | Long (PK, IDENTITY) | 자동 | 쿠폰 고유 식별자 |
| `userId` | `user_id` | Long | ✅ | 소유자 사용자 ID (User PK, 다른 도메인) |
| `couponType` | `coupon_type` | `CouponType` | ✅ | 쿠폰 유형 — PURCHASED / WELCOME / EVENT |
| `usageType` | `usage_type` | `CouponUsageType` | ✅ | 쿠폰 용도 — TICKET / DIRECT_REQUEST (Builder 기본값: TICKET) |
| `status` | `status` | `CouponStatus` | ✅ | 쿠폰 상태 — AVAILABLE / RESERVED / CONSUMED / RETURNED / EXPIRED / REFUNDED (Builder 기본값: AVAILABLE) |
| `purchase` | `coupon_purchase_id` (FK) | CouponPurchase | ⬜ | 구매 내역 (ManyToOne LAZY). 이벤트/웰컴 쿠폰은 null |
| `ticketId` | `ticket_id` | Long | ⬜ | 연결된 티켓 ID (Ticket PK, 다른 도메인). RESERVED/CONSUMED 시 설정 |
| `eventCode` | `event_code` | String | ⬜ | 이벤트 식별 코드. WELCOME은 "WELCOME", EVENT는 이벤트별 고유 코드 (예: "SUMMER_2026"). PURCHASED는 null |
| `expiredAt` | `expired_at` | LocalDateTime | ⬜ | 유효기간 만료일시 (발급일 + 12개월) |
| `usedAt` | `used_at` | LocalDateTime | ⬜ | 실제 사용(CONSUMED) 일시 |
| `createDateTime` | `create_date_time` | LocalDateTime | 자동 | 발급일시 (BaseTimeEntity) |
| `modifiedDateTime` | `modified_date_time` | LocalDateTime | 자동 | 수정일시 (BaseTimeEntity) |

### 비즈니스 메서드

| 메서드 | 상태 전이 | 부수 효과 |
|---|---|---|
| `reserve(Long ticketId)` | → `RESERVED` | `ticketId` 연결 |
| `consume()` | → `CONSUMED` | `usedAt = now()` |
| `returnCoupon()` | → `RETURNED` | `ticketId = null` (해제) |
| `expire()` | → `EXPIRED` | — |
| `refund()` | → `REFUNDED` | — |

---

## 2. CouponPurchase 엔티티

엔티티: `one_pointer.domain.coupon.entity.CouponPurchase`
테이블: `coupon_purchase`
- 인덱스: `idx_coupon_purchase_user` on `user_id`
- Unique: `uk_coupon_purchase_payment_key` on `payment_key`

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `coupon_purchase_id` | Long (PK, IDENTITY) | 자동 | 구매 고유 식별자 |
| `userId` | `user_id` | Long | ✅ | 구매자 사용자 ID (User PK, 다른 도메인) |
| `packageType` | `package_type` | `PackageType` | ✅ | 패키지 유형 — TRIAL / BASIC / STANDARD / PREMIUM |
| `quantity` | `quantity` | Integer | ✅ | 구매한 쿠폰 수량 (PackageType에서 자동 설정) |
| `totalPrice` | `total_price` | Integer | ✅ | 결제 금액 (PackageType에서 자동 설정) |
| `paymentMethod` | `payment_method` | `PaymentMethod` | ✅ | 결제 수단 — CARD / KAKAO_PAY / TOSS |
| `paymentKey` | `payment_key` | String (unique) | ⬜ | PortOne paymentId. 중복 결제 방지 + 환불 시 사용 |
| `status` | `status` | `PurchaseStatus` | ✅ | 구매 상태 — PAID / REFUNDED / PARTIAL_REFUNDED / FAILED (Builder 기본값: PAID) |
| `refundedCount` | `refunded_count` | Integer | ✅ | 환불된 쿠폰 수 (Builder 기본값: 0). 부분 환불 추적용 |
| `createDateTime` | `create_date_time` | LocalDateTime | 자동 | 구매일시 (BaseTimeEntity) |
| `modifiedDateTime` | `modified_date_time` | LocalDateTime | 자동 | 수정일시 (BaseTimeEntity) |

---

## 3. CouponLog 엔티티

엔티티: `one_pointer.domain.coupon.entity.CouponLog`
테이블: `coupon_log`
- 인덱스: `idx_coupon_log_coupon` on `coupon_id`

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `coupon_log_id` | Long (PK, IDENTITY) | 자동 | 로그 고유 식별자 |
| `coupon` | `coupon_id` (FK) | Coupon | ✅ | 대상 쿠폰 (ManyToOne LAZY) |
| `previousStatus` | `previous_status` | `CouponStatus` | ⬜ | 변경 전 상태. 최초 발급 시 null |
| `newStatus` | `new_status` | `CouponStatus` | ✅ | 변경 후 상태 |
| `triggerType` | `trigger_type` | `CouponLogTrigger` | ✅ | 트리거 주체 — USER / SYSTEM / ADMIN |
| `reason` | `reason` | String | ⬜ | 변경 사유 |
| `createDateTime` | `create_date_time` | LocalDateTime | 자동 | 기록일시 (BaseTimeEntity) |
| `modifiedDateTime` | `modified_date_time` | LocalDateTime | 자동 | 수정일시 (BaseTimeEntity) |

### 로그 기록 시점

| 이벤트 | previousStatus | newStatus | trigger | reason |
|---|---|---|---|---|
| 패키지 구매 발급 | null | AVAILABLE | SYSTEM | "패키지 구매로 쿠폰 발급" |
| 이벤트/웰컴 수령 | null | AVAILABLE | SYSTEM | "{타입} 쿠폰 발급" |
| 의뢰 등록 | AVAILABLE | RESERVED | SYSTEM | "의뢰 등록으로 쿠폰 예약" |
| 매칭 확정 | RESERVED | CONSUMED | SYSTEM | "매칭 확정으로 쿠폰 소진" |
| 취소/만료 반환 | RESERVED | RETURNED | SYSTEM | "의뢰 취소/만료로 쿠폰 반환" |
| 유효기간 만료 | AVAILABLE | EXPIRED | SYSTEM | "유효기간 만료" |

---

## 4. Repository

### CouponRepository

`CouponRepository extends JpaRepository<Coupon, Long>`

| 메서드 | 반환 | 용도 |
|---|---|---|
| `findByUserIdAndStatus(userId, status)` | `List<Coupon>` | 사용자별 상태별 쿠폰 조회 |
| `findByUserIdOrderByCreateDateTimeDesc(userId)` | `List<Coupon>` | 사용자 전체 쿠폰 목록 |
| `countByUserIdAndStatus(userId, status)` | `int` | 잔여 수량 (AVAILABLE) |
| `findByTicketId(ticketId)` | `List<Coupon>` | 티켓 연결 쿠폰 |
| `findByTicketIdAndStatus(ticketId, status)` | `Optional<Coupon>` | 티켓+상태 조회 (소모/반환 시) |
| `findFirstByUserIdAndStatusOrderByExpiredAtAsc(userId, status)` | `Optional<Coupon>` | 만료 임박 쿠폰 우선 예약 (레거시, usageType 미필터) |
| `findFirstByUserIdAndStatusAndUsageTypeOrderByExpiredAtAsc(userId, status, usageType)` | `Optional<Coupon>` | usageType별 만료 임박 쿠폰 우선 예약 |
| `countByUserIdAndStatusAndUsageType(userId, status, usageType)` | `int` | usageType별 잔여 수량 |
| `findByStatusAndExpiredAtBefore(status, dateTime)` | `List<Coupon>` | 만료 대상 일괄 조회 |
| `existsByUserIdAndCouponTypeAndEventCode(userId, type, code)` | `boolean` | 이벤트/웰컴 쿠폰 중복 체크 |
| `countExpiringCouponsGroupByUserId(status, from, to)` | `List<Object[]>` | 만료 임박 쿠폰 사용자별 그룹 카운트 (알림용) |

### CouponPurchaseRepository

`CouponPurchaseRepository extends JpaRepository<CouponPurchase, Long>`

| 메서드 | 반환 | 용도 |
|---|---|---|
| `findByUserIdOrderByCreateDateTimeDesc(userId)` | `List<CouponPurchase>` | 구매 내역 조회 |
| `existsByPaymentKey(paymentKey)` | `boolean` | 중복 결제 방지 |

### CouponLogRepository

`CouponLogRepository extends JpaRepository<CouponLog, Long>`

---

## 5. CouponGenerator

`one_pointer.domain.coupon.service.CouponGenerator` — `public final class`, private 생성자

| 메서드 | 설명 |
|---|---|
| `createPurchase(userId, PurchaseCouponRequest)` | CouponPurchase 생성. quantity/totalPrice는 `PackageType`에서 자동 설정 |
| `createCoupon(userId, purchase, usageType, expiredAt)` | 구매 쿠폰 생성. `couponType=PURCHASED`, usageType 설정, purchase 연결 |
| `createEventCoupon(userId, couponType, eventCode, expiredAt)` | 이벤트/웰컴 쿠폰 생성. purchase=null, eventCode 설정 |
| `createLog(coupon, previousStatus, newStatus, trigger, reason)` | CouponLog 생성 |

---

## 6. DTO

### Request DTO

#### PurchaseCouponRequest

| 필드 | 타입 | 설명 |
|---|---|---|
| `packageType` | PackageType | 패키지 유형 (TRIAL/BASIC/STANDARD/PREMIUM/CONTACT_SINGLE/CONTACT_BASIC/CONTACT_STANDARD/CONTACT_PREMIUM) |
| `paymentMethod` | PaymentMethod | 결제 수단 (CARD/KAKAO_PAY/TOSS) |
| `paymentKey` | String | PortOne paymentId (프론트에서 결제 완료 후 받은 값) |

#### ClaimCouponRequest

| 필드 | 타입 | 설명 |
|---|---|---|
| `couponType` | CouponType | WELCOME 또는 EVENT만 가능 |
| `eventCode` | String | 이벤트 코드 (WELCOME이면 자동 설정, EVENT이면 필수) |
| `deviceId` | String | 디바이스 식별자 (중복 수령 방지 보조) |

### Response DTO

#### CouponPurchaseResponse

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | Long | 구매 PK |
| `packageType` | PackageType | 패키지 유형 |
| `quantity` | int | 쿠폰 수량 |
| `totalPrice` | int | 결제 금액 |
| `paymentMethod` | PaymentMethod | 결제 수단 |
| `status` | PurchaseStatus | 구매 상태 |
| `createdAt` | LocalDateTime | 구매일시 |

#### CouponClaimResponse

| 필드 | 타입 | 설명 |
|---|---|---|
| `couponId` | Long | 쿠폰 PK |
| `couponType` | CouponType | 쿠폰 유형 |
| `eventCode` | String | 이벤트 코드 |
| `expiredAt` | LocalDateTime | 유효기간 |

#### CouponBalanceResponse

| 필드 | 타입 | 설명 |
|---|---|---|
| `availableCount` | int | AVAILABLE 상태 쿠폰 수 |
