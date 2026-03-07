## 매칭 플로우 — 엔티티 상태 전이 상세

> 쿠폰 예약 → 티켓 등록 → 제안서 발송 → 매칭 확정 → 채팅방 생성까지, 각 단계에서 관련 엔티티의 상태가 어떻게 변하는지 정리

### 전체 흐름 요약

| **단계** | **트리거** | **주요 상태 변화** |
| --- | --- | --- |
| STEP 1 | 쿠폰 구매/발급 | Coupon **AVAILABLE** |
| STEP 2 | 티켓 등록 (OPEN) | Coupon **RESERVED**, Ticket **OPEN** |
| STEP 3 | 제안서 발송 | Proposal **PENDING**, Ticket **IN_REVIEW** |
| STEP 4 | 매칭 확정 (수락) | Proposal **SELECTED**, Ticket **MATCHED** |
| STEP 5 | 이벤트 리스너 실행 | 미채택 Proposal **REJECTED**, Coupon **CONSUMED**, ChatRoom **ACTIVE** |
| STEP 6 | 트랜잭션 커밋 | 모든 변경사항 영속 |

---

### STEP 1: 쿠폰 구매/발급

**트리거**: 의뢰인이 쿠폰 패키지 구매 또는 웰컴/이벤트 쿠폰 발급

**처리 위치**: `CouponService.purchaseCoupons()`

| **엔티티** | **변경 전** | **변경 후** | **비고** |
| --- | --- | --- | --- |
| CouponPurchase | — (생성) | `PurchaseStatus.PAID` | 결제 완료 기록 |
| Coupon (N장) | — (생성) | `CouponStatus.AVAILABLE` | 패키지 수량만큼 생성 |
| CouponLog (N건) | — (생성) | `newStatus: AVAILABLE` | 각 쿠폰마다 발급 로그 |

> **주요 필드**: `Coupon.status` = AVAILABLE, `ticketId` = null, `usedAt` = null, `expiredAt` = 구매일 + 6개월

---

### STEP 2: 티켓 등록 (DRAFT → OPEN) + 쿠폰 예약

**트리거**: 의뢰인이 티켓 작성 후 등록

**처리 위치**: `TicketService.createTicket()` → `CouponService.reserveByUserId()`

#### 2-1. 티켓 생성 (DRAFT)

| **엔티티** | **변경 전** | **변경 후** | **비고** |
| --- | --- | --- | --- |
| Ticket | — (생성) | `TicketStatus.DRAFT` | @Builder.Default 초기값 |
| TicketDesiredDate (N건) | — (생성) | — | 희망 일정 N개 |

#### 2-2. 티켓 발행 (DRAFT → OPEN) + 쿠폰 예약

| **엔티티** | **변경 전** | **변경 후** | **비고** |
| --- | --- | --- | --- |
| Ticket | `DRAFT` | `OPEN` | `ticket.open()` 호출 |
| Coupon | `AVAILABLE` | `RESERVED` | 만료일 가장 빠른 쿠폰 1장 |
| CouponLog | — (생성) | `newStatus: RESERVED` | 예약 로그 |

> **쿠폰 예약 상세** (`CouponService.reserveByUserId`): 만료일 가장 빠른 AVAILABLE 쿠폰 1장 조회 → `coupon.reserve(ticketId)` → status = RESERVED, ticketId 설정 → 로그: "의뢰 등록으로 쿠폰 예약"

> **검증**: 의뢰인에게 AVAILABLE 쿠폰이 최소 1장 이상 있어야 함. 없으면 `BadRequestException(INSUFFICIENT_COUPON)`

---

### STEP 3: 전문가 제안서 발송

**트리거**: 전문가가 OPEN 또는 IN_REVIEW 상태의 티켓에 제안서 작성

**처리 위치**: `ProposalService.createProposal()`

| **엔티티** | **변경 전** | **변경 후** | **비고** |
| --- | --- | --- | --- |
| Proposal | — (생성) | `ProposalStatus.PENDING` | @Builder.Default 초기값 |
| ProposalAvailableDate (N건) | — (생성) | — | 가능 일정 N개 |
| Ticket | `OPEN` | `IN_REVIEW` | **첫 제안서 수신 시만** 전이 |

> **티켓 상태 전이 규칙**: `OPEN` 상태에서 첫 제안서 → `IN_REVIEW`로 전이. 이미 `IN_REVIEW`이면 추가 전이 없음 (여러 전문가가 제안 가능)

> **검증 조건**: 티켓 OPEN/IN_REVIEW 상태, 자신의 티켓에 제안 불가, 마감일 미경과, 중복 제안 불가, 온라인 시 계좌+onlineTool 필수, 오프라인 시 locationProposal 필수

---

### STEP 4: 매칭 확정 (의뢰인이 제안서 수락)

**트리거**: 의뢰인이 특정 Proposal을 수락

**처리 위치**: `TicketService.acceptProposal()`

| **엔티티** | **변경 전** | **변경 후** | **비고** |
| --- | --- | --- | --- |
| Proposal (채택) | `PENDING` | `SELECTED` | `proposal.select()` |
| Ticket | `IN_REVIEW` | `MATCHED` | `ticket.match(expertId, proposal)` |

> **Ticket 필드 설정**: `matchedExpertId` = 전문가 ID, `matchedProposal` = 채택된 Proposal, `matchedAt` = 현재 시각

> **이벤트 발행**: `TicketMatchedEvent.from(ticket, proposal)` — ticketId, clientId, expertId, proposalId 전달. 이후 STEP 5의 리스너들이 동일 트랜잭션 내에서 실행됨

---

### STEP 5: 이벤트 리스너 실행 (BEFORE_COMMIT)

`TicketMatchedEvent` 발행 후, **동일 트랜잭션** 내에서 3개의 리스너가 실행된다.

모두 `TransactionPhase.BEFORE_COMMIT` — 하나라도 실패하면 STEP 4 포함 **전체 롤백**.

#### 5-A. 미채택 제안서 일괄 거절 (ProposalListener)

| **엔티티** | **변경 전** | **변경 후** | **비고** |
| --- | --- | --- | --- |
| Proposal (미채택, N건) | `PENDING` | `REJECTED` | `proposal.reject()` |

같은 티켓의 PENDING 제안서 중 채택된 것 제외 → 모두 REJECTED

#### 5-B. 쿠폰 소진 (CouponListener)

| **엔티티** | **변경 전** | **변경 후** | **비고** |
| --- | --- | --- | --- |
| Coupon | `RESERVED` | `CONSUMED` | `coupon.consume()`, usedAt 기록 |
| CouponLog | — (생성) | `newStatus: CONSUMED` | "매칭 확정으로 쿠폰 소진" |

#### 5-C. 채팅방 자동 생성 (ChatListener)

| **엔티티** | **변경 전** | **변경 후** | **비고** |
| --- | --- | --- | --- |
| ChatRoom (MongoDB) | — (생성) | `ChatRoomStatus.ACTIVE` | ticketId, clientId, expertId 연결 |
| ChatMessage (2건, MongoDB) | — (생성) | `MessageType.SYSTEM` | 시스템 안내 메시지 |

> **시스템 메시지 2건**: 1. "매칭이 완료되었어요! 일정과 세부사항을 이야기해보세요." 2. "이 대화는 거래 완료 후 리뷰로 공개될 수 있어요. 개인정보는 자동으로 보호됩니다."

---

### STEP 6: 트랜잭션 커밋 — 최종 상태

| **엔티티** | **최종 상태** | **비고** |
| --- | --- | --- |
| Ticket | `MATCHED` | matchedExpertId, matchedProposal, matchedAt 설정 |
| Proposal (채택) | `SELECTED` | 의뢰인이 수락한 1건 |
| Proposal (미채택) | `REJECTED` | 나머지 PENDING이었던 N건 |
| Coupon | `CONSUMED` | usedAt 기록, ticketId 유지 |
| CouponLog | 생성됨 | RESERVED → CONSUMED 로그 |
| ChatRoom | `ACTIVE` | MongoDB, 의뢰인+전문가 참여 |
| ChatMessage (2건) | `SYSTEM` | MongoDB, 시스템 안내 메시지 |

---

### 트랜잭션 경계

```
┌─ @Transactional (TicketService.acceptProposal) ──────────────────┐
│                                                                   │
│  1. proposal.select()                    ← Proposal SELECTED     │
│  2. ticket.match(expertId, proposal)     ← Ticket MATCHED        │
│  3. eventPublisher.publishEvent(TicketMatchedEvent)               │
│     │                                                             │
│     ├─ [BEFORE_COMMIT] ProposalListener                          │
│     │   → 미채택 Proposal REJECTED (JPA/MySQL)                   │
│     │                                                             │
│     ├─ [BEFORE_COMMIT] CouponListener                            │
│     │   → Coupon CONSUMED + CouponLog 생성 (JPA/MySQL)           │
│     │                                                             │
│     └─ [BEFORE_COMMIT] ChatListener                              │
│         → ChatRoom ACTIVE + ChatMessage 2건 (MongoDB)            │
│                                                                   │
│  ──── COMMIT ────                                                 │
└───────────────────────────────────────────────────────────────────┘
```

> **롤백 규칙**: ProposalListener / CouponListener / ChatListener 중 하나라도 실패하면 MySQL 전체 롤백. MongoDB는 Spring @Transactional 완전 롤백 대상이 아니므로 주의.

---

### 실패/취소 플로우 (역방향)

#### 의뢰인 직접 취소 (매칭 전)

**이벤트**: `TicketCancelledEvent`

| **엔티티** | **변경 전** | **변경 후** | **리스너** |
| --- | --- | --- | --- |
| Ticket | `OPEN` / `IN_REVIEW` | `CANCELLED` | TicketService |
| Coupon | `RESERVED` | `RETURNED` | CouponListener |
| Proposal (전체) | `PENDING` | `REJECTED` | ProposalListener |

#### 자동 만료 (마감일 초과)

**이벤트**: `TicketExpiredEvent`

| **엔티티** | **변경 전** | **변경 후** | **리스너** |
| --- | --- | --- | --- |
| Ticket | `OPEN` / `IN_REVIEW` | `EXPIRED` | 스케줄러 |
| Coupon | `RESERVED` | `RETURNED` | CouponListener |
| Proposal (전체) | `PENDING` | `REJECTED` | ProposalListener |

---

### 전체 엔티티 상태 전이 맵

#### Ticket 상태

```
DRAFT → OPEN → IN_REVIEW → MATCHED
          │        │            │
          └→ CANCELLED      ┌──┴──┐
          └→ EXPIRED     오프라인 온라인
                            │     │
                            │  PAYMENT_PENDING
                            │     │
                            │   PAID
                            │     │
                         IN_PROGRESS
                            │
                       (온라인만) DELIVERED
                            │
                        COMPLETED
```

#### Coupon 상태

```
(생성) → AVAILABLE → RESERVED → CONSUMED
            │           │
            ├→ EXPIRED  └→ RETURNED
            └→ REFUNDED
```

#### Proposal 상태

```
(생성) → PENDING → SELECTED
            │
            ├→ REJECTED
            └→ WITHDRAWN
```

#### ChatRoom 상태 (MongoDB)

```
(생성) → ACTIVE
            │
            └→ REPORTED
```

#### Agreement 상태 (온라인 전용)

```
(생성) → PROPOSED → CONFIRMED
             │
             └→ REJECTED (재협의 → 새 합의서)
```

---

### 이벤트 → 리스너 매핑

| **이벤트** | **발행 시점** | **리스너** | **처리** | **Phase** |
| --- | --- | --- | --- | --- |
| `TicketMatchedEvent` | 제안서 수락 | ProposalListener | 미채택 Proposal REJECTED | BEFORE_COMMIT |
|  |  | CouponListener | Coupon CONSUMED | BEFORE_COMMIT |
|  |  | ChatListener | ChatRoom + ChatMessage 생성 | BEFORE_COMMIT |
| `TicketCancelledEvent` | 티켓 취소 | CouponListener | Coupon RETURNED | BEFORE_COMMIT |
|  |  | ProposalListener | 전체 Proposal REJECTED | BEFORE_COMMIT |
| `TicketExpiredEvent` | 마감일 초과 | CouponListener | Coupon RETURNED | BEFORE_COMMIT |
|  |  | ProposalListener | 전체 Proposal REJECTED | BEFORE_COMMIT |
| `TicketCompletedEvent` | 거래 완료 | ReviewListener | 채팅 스냅샷 + 리뷰 자동 생성 | BEFORE_COMMIT |
| `DeliveryApprovedEvent` | 작업물 승인 (온라인) | TicketListener | 티켓 COMPLETED | BEFORE_COMMIT |
