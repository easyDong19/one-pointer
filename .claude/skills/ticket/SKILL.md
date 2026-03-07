---
name: ticket
description: 티켓(의뢰) 및 제안서(Proposal) 도메인 프론트엔드 구현 가이드. 1회성 의뢰 생성, 오프라인/온라인 플로우, 제안서 발송, 매칭, 합의서(Agreement) 등 Ticket 도메인 관련 프론트엔드 작업 시 사용. /ticket 으로 호출하거나 티켓·제안서·합의서 UI를 다룰 때 참고한다.
---

# Ticket 도메인

1회성 의뢰(티켓)와 제안서(Proposal). 의뢰인이 티켓을 등록하면 전문가가 제안서를 보내 매칭된다.

## 오프라인 vs 온라인

| 구분 | 결제 | 에스크로 | Agreement | 진행 |
|------|------|----------|-----------|------|
| **오프라인** | 당사자 간 직접 | 없음 | 없음 | 대면 레슨 |
| **온라인** | 플랫폼 에스크로 | 있음 | 필수 | 화상/원격 |

## 티켓 상태 (TicketStatus)

```
[공통]
DRAFT → OPEN (쿠폰 RESERVED) → IN_REVIEW → MATCHED (쿠폰 CONSUMED) → (채팅 협의)

[오프라인]
MATCHED → IN_PROGRESS → COMPLETED → (리뷰)
* 매칭 즉시 IN_PROGRESS 자동 전이
* Agreement 없음 — 채팅에서 협의 후 바로 진행
* 의뢰인이 "거래 완료" 버튼을 눌러야 COMPLETED (수동 완료만)

[온라인]
MATCHED → (채팅 협의) → Agreement 확정 → PAYMENT_PENDING → PAID → IN_PROGRESS → DELIVERED → COMPLETED → (리뷰 + 정산)
* 수정 요청 횟수: Agreement.maxRevisions (기본 2회)

[실패]
OPEN/IN_REVIEW → CANCELLED (쿠폰 RETURNED — 재사용 가능, 현금 환불 불가)
OPEN/IN_REVIEW → EXPIRED (쿠폰 RETURNED — 재사용 가능, 현금 환불 불가)
```

- MATCHED 상태가 "채팅/협의 중" 역할을 겸함
- 모집 마감일: 등록일 + **7일**
- **오프라인**: 매칭 즉시 IN_PROGRESS 자동 전이. 의뢰인이 "거래 완료" 버튼 → COMPLETED
- **온라인**: Agreement CONFIRMED 시 시스템이 자동으로 PAYMENT_PENDING 전이

## Enum 정의

| Enum | 값 |
|------|-----|
| `TicketType` | `OFFLINE`, `ONLINE` |
| `TicketStatus` | `DRAFT`, `OPEN`, `IN_REVIEW`, `MATCHED`, `PAYMENT_PENDING`, `PAID`, `IN_PROGRESS`, `DELIVERED`, `COMPLETED`, `CANCELLED`, `EXPIRED` |
| `LevelType` | `BEGINNER`, `INTERMEDIATE`, `ADVANCED` |
| `DesiredDuration` | `THIRTY_MIN`, `ONE_HOUR`, `ONE_HALF_HOUR`, `TWO_HOUR`, `NEGOTIABLE` |
| `BudgetType` | `RANGE`, `NEGOTIABLE` |
| `ProposalStatus` | `PENDING`, `SELECTED`, `COMPLETED`, `REJECTED`, `WITHDRAWN` |
| `AgreementStatus` | `PROPOSED`, `CONFIRMED`, `REJECTED` |
| `TicketSourceType` | `TICKET_FEED`, `DIRECT_REQUEST` |

## API 엔드포인트

### Ticket API (`/v1/api/ticket`)

| Method | URL | 설명 | 인증 |
|--------|-----|------|------|
| POST | `/v1/api/ticket` | 티켓 등록 (targetExpertId 포함 시 직접 의뢰) | JWT |
| PUT | `/v1/api/ticket/{ticketId}` | 티켓 수정 (DRAFT/OPEN 상태만) | JWT |
| GET | `/v1/api/ticket/{id}` | 티켓 상세 조회 | 불필요 |
| GET | `/v1/api/ticket/my` | 내 티켓 전체 조회 | JWT |
| GET | `/v1/api/ticket/my/in-progress` | 내 진행중 의뢰 조회 (커서 페이징) | JWT |
| GET | `/v1/api/ticket/my/completed` | 내 완료 의뢰 조회 (커서 페이징) | JWT |
| GET | `/v1/api/ticket/feed` | 티켓 피드 조회 (카테고리별, 커서 페이징) | 불필요 |
| GET | `/v1/api/ticket/search` | 티켓 제목 검색 (커서 페이징) | 불필요 |
| GET | `/v1/api/ticket/direct-request/received` | 받은 직접 의뢰 목록 (전문가) | JWT |
| GET | `/v1/api/ticket/direct-request/sent` | 보낸 직접 의뢰 목록 (의뢰인) | JWT |
| POST | `/v1/api/ticket/proposal/{proposalId}/accept` | 제안서 수락 (매칭 확정) | JWT |
| POST | `/v1/api/ticket/{ticketId}/cancel` | 티켓 취소 (매칭 전, 쿠폰 반환) | JWT |
| POST | `/v1/api/ticket/{ticketId}/complete` | 오프라인 의뢰 완료 | JWT |

### Proposal API (`/v1/api/proposal`)

| Method | URL | 설명 | 인증 |
|--------|-----|------|------|
| POST | `/v1/api/proposal` | 제안서 보내기 | JWT |
| GET | `/v1/api/proposal/{id}` | 제안서 상세 조회 (의뢰인용) | JWT |
| GET | `/v1/api/proposal/my/{id}` | 내 제안서 상세 조회 (전문가용) | JWT |
| GET | `/v1/api/proposal/my/in-progress` | 내 진행중 제안서 (커서 페이징) | JWT |
| GET | `/v1/api/proposal/my/completed` | 내 완료 제안서 (커서 페이징) | JWT |
| GET | `/v1/api/proposal/ticket/{ticketId}` | 티켓별 제안서 목록 (의뢰인용) | JWT |
| POST | `/v1/api/proposal/{id}/withdraw` | 제안서 철회 (PENDING 상태만) | JWT |

### Agreement API (`/v1/api/agreement`)

| Method | URL | 설명 | 인증 |
|--------|-----|------|------|
| POST | `/v1/api/agreement` | 합의서 제안 (의뢰인, 온라인 전용) | JWT |
| GET | `/v1/api/agreement/ticket/{ticketId}` | 티켓별 합의서 조회 | JWT |
| PATCH | `/v1/api/agreement/{id}/deadline` | 합의서 마감일 수정 (의뢰인) | JWT |
| PUT | `/v1/api/agreement/{id}/repropose` | 합의서 재제안 (거절 후, 의뢰인) | JWT |
| POST | `/v1/api/agreement/{id}/confirm` | 합의서 수락 (전문가) | JWT |
| POST | `/v1/api/agreement/{id}/reject` | 합의서 거부 (전문가) | JWT |

## 합의서 (Agreement) — 온라인 의뢰 전용

매칭 완료(MATCHED) 후 채팅에서 가격·마감일·작업 범위를 협의하고, 그 결과를 합의서로 확정하는 단계.
**오프라인 의뢰는 Agreement 없이 채팅 협의 후 바로 진행한다.**

### 흐름
1. 매칭 확정 → 채팅방 오픈 → 의뢰인·전문가가 조건 협의
2. **의뢰인**이 합의서 제안 (PROPOSED) — 의뢰인만 제안 가능
3. 전문가가 수락 (CONFIRMED) 또는 거절 (REJECTED → 재협의)
4. CONFIRMED 시 시스템이 자동으로 티켓 PAYMENT_PENDING 전이

### 주요 필드
- `finalPrice` — 최종 합의 금액
- `workDeadline` — 작업 마감일
- `scope` — 작업 범위/조건 요약
- `maxRevisions` — 최대 수정 요청 횟수 (기본값: 2)
- `deliveryFormat` — 전달물 형식

### 정책
- **온라인 의뢰 전용** — 오프라인 의뢰에는 사용하지 않음
- 하나의 티켓에 하나의 합의서만 존재 (1:1)
- REJECTED 시 기존 합의서를 수정하여 재제안
- **의뢰인만 제안 가능**

## 직접 의뢰 (Direct Request)

의뢰인이 전문가 프로필을 보고 **직접 견적 요청**을 보내는 매칭 채널.

### 공개 티켓 vs 직접 의뢰

| 항목 | 공개 티켓 | 직접 의뢰 |
|------|-----------|-----------|
| `targetExpertId` | null | 전문가 ID |
| `sourceType` | TICKET_FEED | DIRECT_REQUEST |
| `deadline` | +7일 | +48시간 |
| 쿠폰 | usageType = TICKET | usageType = DIRECT_REQUEST |
| 알림 | 카테고리 전문가 전체 | targetExpert 1명만 |
| 피드 | 공개 피드 노출 | 피드 미노출 |

### 직접 의뢰 검증 규칙
- 전문가 인증(APPROVED)된 전문가만 대상 가능
- 자기 자신에게 불가
- 동일 전문가에게 동시에 OPEN/IN_REVIEW인 직접 의뢰 1건만
- 의뢰인당 동시 PENDING 직접 의뢰 최대 5건
- 48시간 무응답 시 자동 만료 + 쿠폰 반환

## 프론트엔드 구현 가이드

### FSD 파일 구조

```
src/
├── entities/ticket/
│   ├── api/
│   │   ├── ticket.schema.ts        # zod v4 스키마
│   │   └── ticket.service.ts       # Service Layer
│   └── model/
│       └── ticket.query-keys.ts    # Query 키 팩토리
│
├── entities/proposal/
│   ├── api/
│   │   ├── proposal.schema.ts
│   │   └── proposal.service.ts
│   └── model/
│       └── proposal.query-keys.ts
│
├── entities/agreement/
│   ├── api/
│   │   ├── agreement.schema.ts
│   │   └── agreement.service.ts
│   └── model/
│       └── agreement.query-keys.ts
│
├── features/ticket/
│   ├── create-ticket/              # 티켓 등록
│   ├── ticket-detail/              # 티켓 상세
│   ├── ticket-feed/                # 피드 (전문가)
│   └── my-tickets/                 # 내 의뢰 목록
│
├── features/proposal/
│   ├── create-proposal/            # 제안서 작성
│   ├── proposal-detail/            # 제안서 상세
│   └── my-proposals/               # 내 제안서 목록
│
└── features/agreement/
    ├── create-agreement/           # 합의서 제안
    └── agreement-detail/           # 합의서 상세/수락/거절
```

### Service Layer

**Ticket:**

| 함수 | HTTP | 설명 |
|------|------|------|
| `createTicket(input)` | POST `/v1/api/ticket` | 티켓 등록 |
| `updateTicket(ticketId, input)` | PUT `/v1/api/ticket/{id}` | 티켓 수정 |
| `getTicket(id)` | GET `/v1/api/ticket/{id}` | 티켓 상세 |
| `completeOfflineTicket(ticketId)` | POST `.../complete` | 오프라인 완료 |
| `cancelTicket(ticketId)` | POST `.../cancel` | 취소 |
| `acceptProposal(proposalId)` | POST `.../accept` | 매칭 확정 |
| `getTicketFeed(params?)` | GET `.../feed` | 피드 (커서) |
| `searchTickets(params)` | GET `.../search` | 검색 (커서) |
| `getMyTickets(params?)` | GET `.../my` | 내 전체 티켓 |
| `getMyInProgressTickets(params?)` | GET `.../my/in-progress` | 내 진행중 |
| `getMyCompletedTickets(params?)` | GET `.../my/completed` | 내 완료 |
| `getSentDirectRequests(params?)` | GET `.../direct-request/sent` | 보낸 직접 의뢰 |
| `getReceivedDirectRequests(params?)` | GET `.../direct-request/received` | 받은 직접 의뢰 |

**Proposal:**

| 함수 | HTTP | 설명 |
|------|------|------|
| `createProposal(input)` | POST `/v1/api/proposal` | 제안서 작성 |
| `withdrawProposal(id)` | POST `.../withdraw` | 제안서 철회 |
| `getProposal(id)` | GET `/v1/api/proposal/{id}` | 상세 (의뢰인) |
| `getMyProposal(id)` | GET `.../my/{id}` | 상세 (전문가) |
| `getProposalsByTicket(ticketId, params?)` | GET `.../ticket/{id}` | 티켓별 목록 |
| `getMyInProgressProposals(params?)` | GET `.../my/in-progress` | 내 진행중 |
| `getMyCompletedProposals(params?)` | GET `.../my/completed` | 내 완료 |

**Agreement:**

| 함수 | HTTP | 설명 |
|------|------|------|
| `createAgreement(input)` | POST `/v1/api/agreement` | 합의서 제안 |
| `reproposeAgreement(id, input)` | PUT `.../repropose` | 재제안 |
| `confirmAgreement(id)` | POST `.../confirm` | 수락 |
| `rejectAgreement(id)` | POST `.../reject` | 거절 |
| `updateAgreementDeadline(id, input)` | PATCH `.../deadline` | 마감일 수정 |
| `getAgreementByTicket(ticketId)` | GET `.../ticket/{id}` | 티켓별 조회 |

### Query Keys

```typescript
// ticket
export const ticketQueryKeys = {
  all: ["ticket"] as const,
  detail: (id: number) => ["ticket", id] as const,
  feed: (params?) => ["ticket", "feed", params] as const,
  search: (query, params?) => ["ticket", "search", query, params] as const,
  my: (params?) => ["ticket", "my", params] as const,
  myInProgress: (params?) => ["ticket", "my", "in-progress", params] as const,
  myCompleted: (params?) => ["ticket", "my", "completed", params] as const,
  directRequestSent: (params?) => ["ticket", "direct-request", "sent", params] as const,
  directRequestReceived: (params?) => ["ticket", "direct-request", "received", params] as const,
}

// proposal
export const proposalQueryKeys = {
  all: ["proposal"] as const,
  detail: (id: number) => ["proposal", id] as const,
  byTicket: (ticketId, params?) => ["proposal", "ticket", ticketId, params] as const,
  myDetail: (id: number) => ["proposal", "my", id] as const,
  myInProgress: (params?) => ["proposal", "my", "in-progress", params] as const,
  myCompleted: (params?) => ["proposal", "my", "completed", params] as const,
}

// agreement
export const agreementQueryKeys = {
  all: ["agreement"] as const,
  byTicket: (ticketId: number) => ["agreement", "ticket", ticketId] as const,
}
```

### 캐시 무효화 전략

| 이벤트 | 무효화 대상 |
|---|---|
| 티켓 등록 | `ticketQueryKeys.my()`, `couponQueryKeys.balance` |
| 티켓 취소 | `ticketQueryKeys.detail(id)`, `ticketQueryKeys.my()`, `couponQueryKeys.balance` |
| 티켓 완료 | `ticketQueryKeys.detail(id)`, `ticketQueryKeys.myInProgress()`, `ticketQueryKeys.myCompleted()` |
| 제안서 수락 (매칭) | `ticketQueryKeys.detail(id)`, `proposalQueryKeys.byTicket(ticketId)`, `couponQueryKeys.balance` |
| 제안서 작성 | `proposalQueryKeys.myInProgress()`, `ticketQueryKeys.detail(ticketId)` |
| 합의서 제안/수락/거절 | `agreementQueryKeys.byTicket(ticketId)`, `ticketQueryKeys.detail(ticketId)` |

### TicketStatus별 UI 분기

```tsx
function TicketStatusBadge({ status }: { status: TicketStatus }) {
  switch (status) {
    case "OPEN":           return <Badge color="blue">모집중</Badge>
    case "IN_REVIEW":      return <Badge color="yellow">제안서 검토중</Badge>
    case "MATCHED":        return <Badge color="green">매칭 완료</Badge>
    case "PAYMENT_PENDING": return <Badge color="orange">결제 대기</Badge>
    case "IN_PROGRESS":    return <Badge color="purple">진행중</Badge>
    case "COMPLETED":      return <Badge color="gray">완료</Badge>
    case "CANCELLED":      return <Badge color="red">취소됨</Badge>
    case "EXPIRED":        return <Badge color="red">만료됨</Badge>
    // ...
  }
}
```

## 기능 체크리스트

### 의뢰인
- [x] 티켓 작성 — 의뢰 유형(오프/온라인) 선택, 카테고리, 내용, 일시, 예산
- [x] 직접 의뢰 (targetExpertId 지정하여 티켓 생성)
- [ ] 임시저장 (DRAFT)
- [x] 제안서 비교
- [x] 매칭 확정 (쿠폰 소모 → 채팅 오픈)
- [x] 완료 확인
- [x] 취소 (매칭 전 → 쿠폰 반환)

### 전문가
- [x] 티켓 피드 (분야 + 지역 + 방식 필터)
- [x] 받은 직접 의뢰 목록 조회
- [x] 제안서 작성/발송 (무료)
- [x] 제안서 철회 (매칭 전)

### 시스템
- [x] 자동 만료 (마감일 초과 → EXPIRED + 쿠폰 RETURNED)
- [x] 매칭 추천 알림

## 알림

| 이벤트 | 수신자 | 메시지 |
|--------|--------|--------|
| 티켓 등록 | 의뢰인 | "의뢰가 등록되었어요! 쿠폰 1장 예약됨" |
| 신규 티켓 | 전문가 | "새로운 [골프] 의뢰가 올라왔어요!" |
| 새 제안서 | 의뢰인 | "[닉네임] 전문가가 제안서를 보냈어요." |
| 매칭 완료 | 전문가 | "제안이 채택되었어요! 채팅에서 대화해보세요." |
| 매칭 완료 | 의뢰인 | "전문가와 매칭! 쿠폰 1장 사용됨." |
| 취소 | 의뢰인 | "의뢰가 취소되었어요. 쿠폰 반환됨." |
| 모집 만료 | 의뢰인 | "모집 기간 만료. 쿠폰이 반환됩니다." |

## 데이터 상세

- **[ticket-data.md](references/ticket-data.md)** — Ticket, TicketDesiredDate, TicketAttachment, Proposal, ProposalAvailableDate 필드 상세
