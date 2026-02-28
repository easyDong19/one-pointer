---
name: fe-ticket
description: 프론트엔드 티켓(의뢰), 제안서(Proposal), 합의서(Agreement) 도메인 가이드. 의뢰 등록, 피드 탐색, 제안서 비교/수락, 합의서 제안/확정, 직접 의뢰 등 Ticket 관련 프론트엔드 구현 시 참고한다.
---

# Ticket 프론트엔드 가이드

## 개요

1회성 의뢰(티켓) → 전문가 제안서 → 매칭 → 채팅 협의 → (온라인만) 합의서 → 서비스 진행.

## 의뢰 유형

| 구분 | 결제 | 에스크로 | 합의서 |
|------|------|----------|--------|
| **오프라인** | 당사자 직접 | X | X |
| **온라인** | 플랫폼 에스크로 | O | O (필수) |

## 매칭 채널

| 항목 | 공개 티켓 | 직접 의뢰 |
|------|-----------|-----------|
| `targetExpertId` | null | 전문가 ID |
| `sourceType` | `TICKET_FEED` | `DIRECT_REQUEST` |
| `deadline` | +7일 | +48시간 |
| 쿠폰 | 일반 쿠폰 | 직접 의뢰 쿠폰 |
| 피드 노출 | O | X (전문가 1명에게만) |

---

## TypeScript 타입 정의

```typescript
// ========== Enums ==========

type TicketType = 'OFFLINE' | 'ONLINE';
type TicketStatus = 'DRAFT' | 'OPEN' | 'IN_REVIEW' | 'MATCHED' | 'PAYMENT_PENDING' | 'PAID' | 'IN_PROGRESS' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
type TicketSourceType = 'TICKET_FEED' | 'DIRECT_REQUEST';
type LevelType = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
type DesiredDuration = 'THIRTY_MIN' | 'ONE_HOUR' | 'ONE_HALF_HOUR' | 'TWO_HOUR' | 'NEGOTIABLE';
type BudgetType = 'RANGE' | 'NEGOTIABLE';
type ProposalStatus = 'PENDING' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN';
type AgreementStatus = 'PROPOSED' | 'CONFIRMED' | 'REJECTED';

// ========== Ticket ==========

interface CreateTicketRequest {
  ticketType: TicketType;
  title: string;
  content: string;
  level: LevelType;
  desiredDuration: DesiredDuration;
  budgetType: BudgetType;
  budgetMin?: number;         // budgetType이 RANGE일 때 필수
  budgetMax?: number;
  region?: string;            // 오프라인 시 필수
  locationDetail?: string;
  subCategoryId: number;
  targetExpertId?: number;    // 직접 의뢰 시 전문가 ID
  desiredDates: DesiredDateInput[];
}

interface DesiredDateInput {
  date: string;               // "2026-03-05" (ISO date)
  timeSlot: string;           // "14:00-16:00"
}

interface TicketResponse {
  id: number;
  clientId: number;
  subCategoryId: number;
  ticketType: TicketType;
  title: string;
  content: string;
  level: LevelType;
  desiredDuration: DesiredDuration;
  budgetType: BudgetType;
  budgetMin: number | null;
  budgetMax: number | null;
  region: string | null;
  locationDetail: string | null;
  deadline: string;           // ISO datetime
  status: TicketStatus;
  sourceType: TicketSourceType;
  targetExpertId: number | null;
  matchedAt: string | null;
  createdAt: string;
  desiredDates: DesiredDateResponse[];
}

interface DesiredDateResponse {
  id: number;
  date: string;
  timeSlot: string;
}

// ========== Ticket Feed ==========

interface TicketFeedResponse {
  id: number;
  majorCategoryName: string;
  subCategoryName: string;
  ticketType: TicketType;
  title: string;
  budgetType: BudgetType;
  budgetMin: number | null;
  budgetMax: number | null;
  desiredDuration: DesiredDuration;
  region: string | null;
  locationDetail: string | null;
  createdAt: string;
}

interface CursorPageResponse<T> {
  content: T[];
  nextCursor: number | string | null;
  hasNext: boolean;
}

// ========== My Ticket ==========

interface MyTicketResponse {
  id: number;
  ticketType: TicketType;
  title: string;
  status: TicketStatus;
  sourceType: TicketSourceType;
  subCategoryName: string;
  proposalCount: number;
  deadline: string;
  matchedAt: string | null;
  createdAt: string;
}

// ========== Proposal ==========

interface CreateProposalRequest {
  ticketId: number;
  price: number;
  proposedDuration: DesiredDuration;
  locationProposal?: string;   // 오프라인
  onlineTool?: string;         // 온라인 ("Zoom", "Google Meet" 등)
  appeal: string;              // 어필 메시지
  availableDates: ProposalDateInput[];
}

interface ProposalDateInput {
  availableDate: string;       // "2026-03-05"
  timeSlot: string;            // "14:00~16:00"
}

interface ProposalDetailResponse {
  id: number;
  ticketId: number;
  expertId: number;
  price: number;
  proposedDuration: DesiredDuration;
  locationProposal: string | null;
  onlineTool: string | null;
  appeal: string;
  status: ProposalStatus;
  availableDates: ProposalDateResponse[];
  expertInfo: ProposalExpertInfo;
  createdAt: string;
}

interface ProposalDateResponse {
  id: number;
  availableDate: string;
  timeSlot: string;
}

interface ProposalExpertInfo {
  expertId: number;
  nickname: string;
  profileImageUrl: string | null;
  introduction: string;
  careerPeriod: string;
  grade: string;
  averageRating: number | null;
  reviewCount: number;
  totalMatchCount: number;
  certifications: { name: string; issuer: string }[];
  portfolios: { type: string; images: { imageUrl: string }[] }[];
}

// ========== Agreement (온라인 전용) ==========

interface CreateAgreementRequest {
  ticketId: number;
  finalPrice: number;
  workDeadline: string;       // ISO datetime
  scope: string;
  maxRevisions: number;       // 기본 2
  deliveryFormat: string;
}

interface AgreementResponse {
  id: number;
  ticketId: number;
  finalPrice: number;
  workDeadline: string;
  scope: string;
  maxRevisions: number;
  deliveryFormat: string;
  status: AgreementStatus;
  proposedBy: number;
  proposedAt: string;
  confirmedAt: string | null;
  createdAt: string;
}
```

---

## API 엔드포인트

### 티켓

| Method | URL | 설명 | 인증 | 비고 |
|--------|-----|------|------|------|
| POST | `/v1/api/ticket` | 티켓 생성 | JWT | targetExpertId 포함 시 직접 의뢰 |
| GET | `/v1/api/ticket/{id}` | 티켓 상세 조회 | JWT | |
| GET | `/v1/api/ticket/my` | 내 티켓 목록 | JWT | 커서 페이지네이션 |
| GET | `/v1/api/ticket/feed` | 티켓 피드 | X | `?subCategoryId=&cursor=&size=20` |
| GET | `/v1/api/ticket/direct-request/received` | 받은 직접 의뢰 (전문가) | JWT | |
| GET | `/v1/api/ticket/direct-request/sent` | 보낸 직접 의뢰 (의뢰인) | JWT | |

### 제안서

| Method | URL | 설명 | 인증 |
|--------|-----|------|------|
| POST | `/v1/api/proposal` | 제안서 보내기 | JWT (Expert) |
| GET | `/v1/api/proposal/{id}` | 제안서 상세 | JWT |
| GET | `/v1/api/proposal/ticket/{ticketId}` | 티켓별 제안서 목록 | JWT |
| PATCH | `/v1/api/proposal/{id}/accept` | 제안서 수락 (매칭 확정) | JWT (Client) |
| PATCH | `/v1/api/proposal/{id}/withdraw` | 제안서 철회 | JWT (Expert) |
| GET | `/v1/api/proposal/my/active` | 진행중인 내 제안서 | JWT (Expert) |
| GET | `/v1/api/proposal/my/completed` | 완료된 내 제안서 | JWT (Expert) |

### 합의서 (온라인 전용)

| Method | URL | 설명 | 인증 |
|--------|-----|------|------|
| POST | `/v1/api/agreement` | 합의서 제안 | JWT (Client만) |
| GET | `/v1/api/agreement/ticket/{ticketId}` | 합의서 조회 | JWT |
| PATCH | `/v1/api/agreement/{id}/confirm` | 합의서 수락 (전문가) | JWT (Expert) |
| PATCH | `/v1/api/agreement/{id}/reject` | 합의서 거절 (전문가) | JWT (Expert) |

---

## 티켓 상태 전이 (프론트 관점)

```
DRAFT → OPEN (등록, 쿠폰 RESERVED)
  ├── → IN_REVIEW (제안서 1건 이상 도착)
  │      ├── → MATCHED (의뢰인이 제안서 수락, 쿠폰 CONSUMED)
  │      │      │
  │      │   [오프라인]
  │      │      └── → IN_PROGRESS → COMPLETED (48시간 자동 완료)
  │      │
  │      │   [온라인]
  │      │      └── → PAYMENT_PENDING (합의서 CONFIRMED)
  │      │             → PAID (에스크로 결제)
  │      │             → IN_PROGRESS
  │      │             → DELIVERED (전문가 작업물 전달)
  │      │             → COMPLETED (의뢰인 승인)
  │      │
  │      └── → CANCELLED (의뢰인 취소, 쿠폰 RETURNED)
  │
  └── → EXPIRED (마감일 초과, 쿠폰 RETURNED)
```

### 상태별 UI 표시

| 상태 | 의뢰인 화면 | 전문가 화면 |
|------|------------|------------|
| `OPEN` | "모집 중" + 남은 시간 | 피드에서 제안 가능 |
| `IN_REVIEW` | "제안서 N건 도착" | 제안서 발송 가능 |
| `MATCHED` | "매칭 완료, 채팅에서 협의하세요" | "채택됨! 채팅을 시작하세요" |
| `PAYMENT_PENDING` | "결제를 진행해주세요" (온라인) | "결제 대기 중" |
| `PAID` | "결제 완료" | "서비스를 시작해주세요" |
| `IN_PROGRESS` | "진행 중" | "진행 중" |
| `DELIVERED` | "작업물 확인해주세요" (온라인) | "작업물 전달 완료" |
| `COMPLETED` | "거래 완료" | "거래 완료" |
| `CANCELLED` | "취소됨 (쿠폰 반환)" | — |
| `EXPIRED` | "만료됨 (쿠폰 반환)" | — |

---

## 에러 코드

| 코드 | 설명 | UI 처리 |
|------|------|---------|
| 40002 | 쿠폰 부족 (일반) | 쿠폰 구매 페이지로 안내 |
| 40086 | 직접 의뢰 쿠폰 부족 | 직접 의뢰 쿠폰 구매 안내 |
| 40010 | OPEN 상태가 아닌 티켓 | "이미 마감된 의뢰입니다" |
| 40012 | 자기 티켓에 제안 불가 | "본인의 의뢰에는 제안할 수 없습니다" |
| 40013 | 이미 제안한 티켓 | "이미 제안서를 보낸 의뢰입니다" |
| 40017 | 전문가 인증 미완료 | "전문가 인증 완료 후 제안 가능합니다" |
| 40025 | MATCHED가 아닌 티켓에 합의서 | "매칭 완료 상태에서만 합의서를 제안할 수 있습니다" |
| 40026 | 이미 합의서 존재 | "이미 합의서가 있습니다" |
| 40027 | 온라인 의뢰만 합의서 가능 | "온라인 의뢰에서만 합의서를 제안할 수 있습니다" |
| 40307 | 의뢰인만 합의서 제안 가능 | "의뢰인만 합의서를 제안할 수 있습니다" |

---

## 프론트엔드 구현 가이드

### 페이지 구조 (추천)

```
/ticket
├── /create                   # 티켓 작성 (다단계 폼)
├── /feed                     # 티켓 피드 (전문가용)
├── /[id]                     # 티켓 상세
│   ├── proposals/            # 제안서 목록 (의뢰인)
│   └── agreement/            # 합의서 (온라인)
└── /my                       # 내 티켓 목록 (의뢰인)

/proposal
├── /create?ticketId=          # 제안서 작성 (전문가)
├── /[id]                     # 제안서 상세
└── /my                       # 내 제안서 목록 (전문가)

/direct-request
├── /sent                     # 보낸 직접 의뢰 (의뢰인)
└── /received                 # 받은 직접 의뢰 (전문가)
```

### 티켓 작성 흐름

```
Step 1: 의뢰 유형 선택 (오프라인/온라인)
Step 2: 카테고리 선택 (대분류 → 중분류)
Step 3: 의뢰 내용 작성
  - 제목, 설명, 레벨, 소요시간, 예산
  - (오프라인) 지역, 상세 위치
Step 4: 희망 일시 선택 (1개 이상)
Step 5: 확인 및 등록 → 쿠폰 1장 예약

주의: "쿠폰 1장이 예약됩니다" 안내 필수
```

### 직접 의뢰 흐름

```
전문가 프로필 화면 → "직접 의뢰 보내기" 버튼
→ 티켓 작성 폼 (targetExpertId 자동 설정)
→ POST /v1/api/ticket (targetExpertId 포함)
→ 직접 의뢰 쿠폰 1장 예약

주의 사항:
- 직접 의뢰 쿠폰 잔량 미리 확인 (GET /v1/api/coupon/balance/direct-request)
- 동일 전문가에게 OPEN/IN_REVIEW 직접 의뢰 1건만 가능
- 최대 5건 동시 PENDING 가능
```

### 제안서 수락 (매칭 확정) 흐름

```
의뢰인이 제안서 수락 버튼 클릭
→ 확인 모달: "쿠폰 1장이 최종 사용됩니다. 매칭 후에는 쿠폰 반환이 불가합니다."
→ PATCH /v1/api/proposal/{id}/accept
→ 쿠폰 CONSUMED + 채팅방 자동 생성
→ 채팅 화면으로 이동
```

### 합의서 흐름 (온라인 전용)

```
매칭 후 채팅에서 조건 협의
→ 의뢰인이 합의서 제안 (POST /v1/api/agreement)
→ 전문가가 수락(CONFIRMED) 또는 거절(REJECTED)
→ CONFIRMED 시 자동으로 PAYMENT_PENDING
→ 의뢰인 에스크로 결제 진행 (→ /payment 스킬 참고)
→ REJECTED 시 재협의 → 새 합의서 제안
```

### 무한 스크롤 (피드)

```typescript
// 티켓 피드 커서 기반 페이지네이션
const { data } = await api.get('/v1/api/ticket/feed', {
  params: {
    subCategoryId: selectedCategory,
    cursor: lastTicketId,  // 다음 페이지 요청 시 이전 응답의 nextCursor
    size: 20,
  },
});

// data.content: TicketFeedResponse[]
// data.nextCursor: number | null
// data.hasNext: boolean → 더 불러올 데이터 여부
```

### 마감 타이머

```typescript
// 모집 마감까지 남은 시간 계산
function getTimeRemaining(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return '마감됨';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}일 ${hours}시간 남음`;
  return `${hours}시간 남음`;
}
```

### 중요 비즈니스 룰 (프론트 검증)

1. **쿠폰 잔량 체크**: 티켓 등록 전 쿠폰 잔량 확인 → 부족 시 구매 안내
2. **직접 의뢰 쿠폰**: 일반 쿠폰과 별도. `GET /v1/api/coupon/balance/direct-request`로 확인
3. **매칭 후 쿠폰 환불 불가**: 제안서 수락 시 반드시 안내
4. **온라인만 합의서**: 오프라인 의뢰에서는 합의서 UI 미표시
5. **의뢰인만 합의서 제안**: 전문가는 수락/거절만 가능
