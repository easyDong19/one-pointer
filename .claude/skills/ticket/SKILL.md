---
name: ticket
description: 티켓(의뢰) 및 제안서(Proposal) 도메인 기획. 1회성 의뢰 생성, 오프라인/온라인 플로우, 제안서, 매칭, 합의서 등. 의뢰 등록 폼, 티켓 피드, 제안서 비교, 합의서 화면 등 Ticket 관련 프론트엔드 작업 시 참고. /ticket 으로 호출.
---

# Ticket 도메인 (프론트엔드)

1회성 의뢰(티켓)와 제안서(Proposal). 의뢰인이 티켓을 등록하면 전문가가 제안서를 보내 매칭된다.

## 오프라인 vs 온라인

| 구분 | 결제 | 에스크로 | 합의서 | 작업물 전달 |
|------|------|----------|--------|-------------|
| **오프라인** | 당사자 직접 | ❌ | ❌ | ❌ |
| **온라인** | 플랫폼 에스크로 | ✅ | ✅ | ✅ |

## Enum/상태값

```typescript
type TicketType = 'OFFLINE' | 'ONLINE'
type TicketStatus = 'DRAFT' | 'OPEN' | 'IN_REVIEW' | 'MATCHED'
  | 'PAYMENT_PENDING' | 'PAID' | 'IN_PROGRESS'
  | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED'
type LevelType = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
type DesiredDuration = 'THIRTY_MIN' | 'ONE_HOUR' | 'ONE_HALF_HOUR' | 'TWO_HOUR' | 'NEGOTIABLE'
type BudgetType = 'RANGE' | 'NEGOTIABLE'
type ProposalStatus = 'PENDING' | 'SELECTED' | 'REJECTED' | 'WITHDRAWN'
type AgreementStatus = 'PROPOSED' | 'CONFIRMED' | 'REJECTED'
```

### 티켓 상태 전이 + UI 라벨

| 상태 | UI 라벨 | 전이 조건 |
|------|---------|-----------|
| `DRAFT` | 작성 중 | 의뢰인 작성 시작 |
| `OPEN` | 모집 중 | 등록 완료 (쿠폰 1장 RESERVED) |
| `IN_REVIEW` | 제안서 검토 중 | 첫 제안서 도착 |
| `MATCHED` | 매칭 완료 | 제안서 수락 (쿠폰 CONSUMED) |
| `PAYMENT_PENDING` | 결제 대기 | 합의서 확정 (온라인만) |
| `PAID` | 결제 완료 | 에스크로 결제 (온라인만) |
| `IN_PROGRESS` | 진행 중 | 채팅 협의 후 (오프라인) / 결제 후 (온라인) |
| `DELIVERED` | 결과물 확인 대기 | 전문가 작업물 제출 (온라인만) |
| `COMPLETED` | 완료 | 의뢰인 확인 / 자동 완료 |
| `CANCELLED` | 취소됨 | 매칭 전 취소 (쿠폰 RETURNED) |
| `EXPIRED` | 만료됨 | 마감일 경과 (쿠폰 RETURNED) |

```
[공통] DRAFT → OPEN → IN_REVIEW → MATCHED
[오프라인] MATCHED → IN_PROGRESS → COMPLETED
[온라인]  MATCHED → PAYMENT_PENDING → PAID → IN_PROGRESS → DELIVERED → COMPLETED
[실패]   OPEN/IN_REVIEW → CANCELLED / EXPIRED
```

## 데이터 모델

```typescript
interface Ticket {
  id: number
  clientId: number
  ticketType: TicketType
  subCategoryId: number        // 중분류 카테고리 ID
  title: string                // 최대 80자
  content: string
  level?: LevelType
  desiredDuration: DesiredDuration
  budgetType: BudgetType
  budgetMin?: number           // RANGE일 때
  budgetMax?: number           // RANGE일 때
  region?: string              // 오프라인 시 필수 (시/구)
  locationDetail?: string      // "강남역 근처"
  deadline: string             // 모집 마감일 (등록일 + 7일)
  status: TicketStatus
  matchedExpertId?: number
  matchedAt?: string
  inProgressAt?: string        // IN_PROGRESS 전이 시점
  completedAt?: string         // COMPLETED 전이 시점
  autoCompleteAfter?: string   // 오프라인 자동완료 기준 시각 (48h 후)
  desiredDates: TicketDesiredDate[]
  attachments: TicketAttachment[]
  createDateTime: string
}

interface TicketDesiredDate {
  desiredDate: string          // YYYY-MM-DD
  timeSlot: 'AM' | 'PM'
}

interface TicketAttachment {
  fileUrl: string
  fileName?: string
}

interface Proposal {
  id: number
  ticketId: number
  expertId: number
  price: number               // 제안 금액 (원)
  proposedDuration: DesiredDuration
  method: 'OFFLINE' | 'ONLINE' | 'BOTH'
  locationProposal?: string   // 오프라인 시
  onlineTool?: string         // "Zoom", "Google Meet"
  appeal: string              // 자기 어필
  status: ProposalStatus
  availableDates: ProposalAvailableDate[]
  createDateTime: string
}

interface ProposalAvailableDate {
  availableDate: string
  timeSlot: 'AM' | 'PM'
}

interface Agreement {  // 온라인 의뢰 전용
  id: number
  ticketId: number
  expertId: number
  clientId: number
  finalPrice: number          // 최종 합의 금액 (원)
  workDeadline: string        // 작업 마감일
  scope?: string              // 작업 범위 요약
  maxRevisions: number        // 기본: 2
  deliveryFormat?: string     // "PDF", "Zoom 녹화본"
  status: AgreementStatus
  proposedAt: string
  confirmedAt?: string
}
```

## 워크플로

### 티켓 등록

```
1. 의뢰 유형 선택 (오프라인/온라인)
   → 카테고리의 availableType에 따라 자동 제한됨
2. 카테고리 선택 (대분류 → 중분류)
3. 내용 작성 (제목 80자, 내용, 수준, 희망 시간)
4. 예산 설정 (범위 지정 → budgetMin/Max 입력 / 협의)
5. 희망 일정 선택 (복수 가능)
6. (오프라인) 지역/장소 입력
7. 첨부파일 (선택)
8. 임시저장 (DRAFT) or 등록 (OPEN)
   → 등록 시 쿠폰 1장 RESERVED
   → 모집 마감일 = 등록일 + 7일
   → AVAILABLE 쿠폰 없으면 등록 불가 → 쿠폰 구매 유도
```

### 매칭

```
의뢰인 티켓 등록 (OPEN)
  → 전문가 제안서 발송 → 티켓 IN_REVIEW (첫 제안서 도착 시)
  → 의뢰인 제안서 비교 → 하나 수락
  → MATCHED (쿠폰 CONSUMED, 환불 불가)
  → 미채택 제안서 자동 REJECTED
  → 채팅방 자동 생성
```

### 합의서 (온라인 전용)

```
MATCHED → 채팅방에서 조건 협의
  → 의뢰인이 합의서 제안 (PROPOSED)
     - 최종 금액, 마감일, 범위, 수정횟수, 전달물 형식
  → 전문가 확인
     ├─ 수락 (CONFIRMED) → PAYMENT_PENDING 자동 전이
     └─ 거절 (REJECTED) → 재협의 (새 합의서 제안)
```

### 오프라인 완료

```
MATCHED → 채팅 협의 → IN_PROGRESS
  → 대면 레슨 (결제 당사자 직접)
  → 의뢰인 완료 확인 → COMPLETED
  → 48시간 미확인 시 자동 COMPLETED (autoCompleteAfter 기준)
```

### 온라인 완료

```
PAYMENT_PENDING → 에스크로 결제 → PAID → IN_PROGRESS
  → 전문가 작업물 전달 → DELIVERED
  → 의뢰인 승인 → COMPLETED → 정산 + 리뷰
```

## API 엔드포인트

| Method | URL | 설명 | 인증 |
|--------|-----|------|------|
| POST | `/v1/api/ticket` | 티켓 생성 | JWT |
| GET | `/v1/api/ticket/{id}` | 티켓 상세 조회 | JWT |
| GET | `/v1/api/ticket/my` | 내 티켓 목록 조회 | JWT |

## UI 정책/제약사항

- **제목**: 최대 80자
- **모집 마감일**: 등록일 + **7일** (수정 불가)
- MATCHED 상태가 "채팅/협의 중" 역할을 겸함
- 오프라인 의뢰에는 Agreement/Delivery 화면 불필요
- **합의서는 의뢰인만 제안 가능**
- 하나의 티켓에 하나의 합의서만 존재 (1:1)
- **쿠폰 부족 시 등록 불가** → 쿠폰 구매 화면 유도
- 취소/환불은 **매칭 전(OPEN/IN_REVIEW)에만** 가능

### 제안서 작성 검증 (전문가 화면)

- 자신의 티켓에 제안 불가
- 중복 제안 불가 (1티켓 1제안)
- 마감일 경과 시 제안 불가
- 온라인 시: 계좌 등록 + `onlineTool` 필수
- 오프라인 시: `locationProposal` 필수

## 악용 방지 (프론트 UX 고려사항)

| 위험 | 대응 |
|------|------|
| 허위 의뢰 (장난) | 쿠폰 1장 예약 필수, 반복 취소 시 경고 |
| 스팸 제안서 | 티켓당 최대 N건 제한, 중복 제안 불가 |
| 외부 거래 유도 | 매칭 전 연락처 교환 금지, 개인정보 감지 |
| 전문가 과도한 철회 | 철회 횟수 모니터링, 경고 |
| 의뢰인 반복 취소 | 취소 횟수 모니터링, 패턴 감지 시 제한 |

## 알림

| 이벤트 | 수신자 | 메시지 |
|--------|--------|--------|
| 티켓 등록 | 의뢰인 | "의뢰가 등록되었어요! 쿠폰 1장 예약됨" |
| 신규 티켓 | 전문가 | "새로운 [골프] 의뢰가 올라왔어요!" |
| 새 제안서 | 의뢰인 | "[닉네임] 전문가가 제안서를 보냈어요." |
| 매칭 완료 | 전문가 | "제안이 채택되었어요! 채팅에서 대화해보세요." |
| 매칭 완료 | 의뢰인 | "전문가와 매칭! 쿠폰 1장 사용됨." |
| (온라인) 결제 요청 | 의뢰인 | "매칭 완료! 안전결제를 진행해주세요." |
| (온라인) 결제 완료 | 전문가 | "결제가 완료되었어요! 서비스를 시작해주세요." |
| 취소 | 의뢰인 | "의뢰가 취소되었어요. 쿠폰 반환됨." |
| 모집 마감 임박 | 의뢰인 | "의뢰 모집이 내일 마감돼요." |
| 모집 만료 | 의뢰인 | "모집 기간 만료. 쿠폰이 반환됩니다." |

## 기능 체크리스트

### 의뢰인
- [ ] 티켓 작성 (유형/카테고리/내용/일시/예산)
- [ ] 임시저장 (DRAFT)
- [ ] 쿠폰 부족 시 구매 유도
- [ ] 제안서 비교 (금액/시간/어필)
- [ ] 매칭 확정 (쿠폰 소모 → 채팅 오픈)
- [ ] (온라인) 에스크로 결제
- [ ] 완료 확인
- [ ] 취소 (매칭 전 → 쿠폰 반환)

### 전문가
- [ ] 티켓 피드 (분야 + 지역 + 방식 필터)
- [ ] 제안서 작성/발송 (무료)
- [ ] 제안서 템플릿 저장
- [ ] 제안서 철회 (매칭 전)
- [ ] 신규 티켓 알림 구독
