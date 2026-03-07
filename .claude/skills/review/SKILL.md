---
name: review
description: 채팅 기반 투명 리뷰 도메인 프론트엔드 구현 가이드. 거래 완료 후 채팅 스냅샷 기반 리뷰 공개, 비공개 필터링, 별점, 전문가 답변 등 Review 도메인 관련 프론트엔드 작업 시 사용. /review 로 호출하거나 리뷰·스냅샷·필터링 UI를 다룰 때 참고한다.
---

# Review 도메인

**"리뷰 = 채팅 내역 그 자체"** — 거래 완료 시 채팅 내역이 자동으로 투명하게 공개. 의뢰인은 별점만 남기면 된다.

## FSD 파일 구조

```
src/
├── entities/review/
│   ├── api/
│   │   ├── review.schema.ts        # zod 스키마 (ReviewDetail, ReviewSummary 등)
│   │   └── review.service.ts       # API 호출 함수 (clientFetch 기반)
│   └── model/
│       └── review.query-keys.ts    # TanStack Query 키 팩토리
│
├── features/review/
│   ├── review-detail/              # 리뷰 상세 조회
│   │   ├── model/                  # useReviewDetail query hook
│   │   └── ui/                     # ReviewDetailPage, MessageList, ExpertReplySection
│   ├── review-feed/                # 전문가 리뷰 피드
│   │   ├── model/                  # useExpertReviews infinite query hook
│   │   └── ui/                     # ReviewFeedList, ReviewCard
│   ├── review-filtering/           # 필터링 화면 (의뢰인/전문가)
│   │   ├── model/                  # useFilteringReview, useToggleVisibility mutation
│   │   └── ui/                     # FilteringPage, MessageToggleItem
│   ├── review-rating/              # 별점 입력
│   │   ├── model/                  # useSubmitRating mutation
│   │   └── ui/                     # StarRatingInput
│   ├── expert-reply/               # 전문가 답변
│   │   ├── model/                  # useCreateExpertReply mutation
│   │   └── ui/                     # ExpertReplyForm
│   └── review-summary/             # 내 리뷰 요약 (전문가)
│       ├── model/                  # useMyReviewSummary query hook
│       └── ui/                     # ReviewSummaryCard
```

## 리뷰 구성

| 구성 | 방식 | 설명 |
|------|------|------|
| 별점 | 수동 | 의뢰인 1~5점 (0.5 단위, 선택) |
| 채팅 내역 | 자동 | ChatSnapshot으로 영구 보존 |

## 전체 흐름

```
거래 완료 (Ticket COMPLETED)
  │
  ▼
[Step 1] 서버 자동 처리 (즉시)
  ① ChatMessage(MongoDB) → SnapshotMessage(MySQL) 복사
  ② 개인정보 포함 메시지 → HIDDEN_BY_SYSTEM (메시지 전체 비공개)
  ③ Review 생성 (SNAPSHOT_CREATED → FILTERING)
  │
  ▼
[Step 2] 필터링 기간 (48시간) ← 프론트엔드 필터링 UI
  - 의뢰인/전문가 각자 자기 메시지만 비공개 토글 가능
  - 시스템 비공개 메시지는 해제 불가
  - 의뢰인 별점 입력 (선택)
  │
  ▼ 48시간 경과 or 양쪽 모두 완료
[Step 3] 리뷰 공개
  - PUBLISHED (별점 있음) / PUBLISHED_NO_RATING (별점 없음)
  │
  ▼
[Step 4] 공개 후
  - 전문가 답변 1회 (500자, 30일 이내)
  - 별점은 한번 등록하면 수정 불가
```

## 리뷰 상태 (ReviewStatus)

| 상태 | 코드 | 설명 | 프론트엔드 노출 |
|------|------|------|----------------|
| 필터링 중 | `FILTERING` | 비공개 처리 기간 (48시간) | 필터링 UI 표시 |
| 별점 대기 | `WAITING_RATING` | 비공개 처리 완료, 별점 대기 | 별점 입력 UI 표시 |
| 공개됨 | `PUBLISHED` | 별점 포함 공개 | 리뷰 상세 표시 |
| 공개됨 (별점 없음) | `PUBLISHED_NO_RATING` | 채팅만 공개 | 리뷰 상세 표시 (별점 없음) |
| 숨김 | `HIDDEN` | 관리자에 의해 숨김 | 비노출 |

> `SNAPSHOT_CREATED` 상태는 서버 내부 전용이며, 프론트엔드에서는 `FILTERING` 이후 상태만 다룬다.

## 메시지 공개 상태 (MessageVisibility)

| 값 | 의미 | 리뷰 열람자에게 표시 |
|----|------|---------------------|
| `PUBLIC` | 공개 | 원문 그대로 렌더링 |
| `HIDDEN_BY_SENDER` | 발신자가 비공개 | `[비공개 메시지]` 텍스트로 대체 |
| `HIDDEN_BY_SYSTEM` | 개인정보 감지 비공개 | `[비공개 메시지]` 텍스트로 대체 |

> 두 HIDDEN 모두 열람자에게 동일하게 표시. 비공개 주체는 노출하지 않는다.

### MessageVisibility UI 렌더링 패턴

```tsx
function MessageBubble({ message }: { message: SnapshotMessage }) {
  const isHidden = message.visibility !== "PUBLIC"

  if (isHidden) {
    return (
      <div className="opacity-50 italic text-gray-400">
        [비공개 메시지]
      </div>
    )
  }

  return (
    <div>
      <span className="font-medium">{message.senderNickname}</span>
      <p>{message.content}</p>
    </div>
  )
}
```

## 엔티티 관계

```
Review (1:1) ── ChatSnapshot (1:N) ── SnapshotMessage
  │                                       │
  │                                       ├── (1:N) AutoHideLog (시스템 비공개 기록, 관리자 전용)
  │                                       └── (N:1) MessageFilter (사용자 비공개 기록)
  │
  └── (1:1) ── ExpertReply
```

### 프론트엔드에서 참조하는 주요 ID

- `Review.id` (number): 리뷰 고유 식별자
- `Review.ticketId` (number): 거래 티켓 ID
- `Review.expertProfileId` (number): 전문가 프로필 ID (피드 조회 시 사용)
- `SnapshotMessage.id` (number): 메시지 ID (비공개 토글 시 사용)
- `SnapshotMessage.senderId` (number): 발신자 ID (자기 메시지 판별용)

## Enum 정의

| Enum | 스키마 | 값 |
|------|--------|-----|
| `ReviewStatus` | `reviewStatusSchema` | `FILTERING`, `WAITING_RATING`, `PUBLISHED` |
| `MessageVisibility` | `messageVisibilitySchema` | `PUBLIC`, `HIDDEN_BY_SENDER`, `HIDDEN_BY_SYSTEM` |
| `VisibilityReason` | `visibilityReasonSchema` | `PERSONAL`, `SENSITIVE`, `OTHER` |

## 소통 지표 (Communication Metrics)

거래 완료 시 채팅 데이터를 분석하여 소통 지표를 자동 산출한다. 전문가 프로필에 표시.

| 지표 | 설명 | 프론트엔드 필드 |
|------|------|----------------|
| 의뢰인 메시지 수 | 의뢰인이 보낸 메시지 수 | `communicationMetrics.clientMessageCount` |
| 전문가 메시지 수 | 전문가가 보낸 메시지 수 | `communicationMetrics.expertMessageCount` |
| 총 메시지 수 | 거래 중 주고받은 메시지 총 수 | `communicationMetrics.totalMessages` |
| 비공개 비율 | 비공개 처리된 메시지 비율 | `communicationMetrics.hiddenRatio` |

## 비공개 처리 정책

### 1단계: 서버 자동 (즉시)
- 전화번호, 계좌번호, 이메일, 상세주소, 메신저 ID, 외부 링크 감지
- **메시지 전체를 비공개** (부분 마스킹 없음)
- 프론트엔드에서는 `HIDDEN_BY_SYSTEM` 상태의 메시지를 `[비공개 메시지]`로 렌더링

### 2단계: 사용자 수동 (48시간)
- 자기가 보낸 메시지만 비공개 가능
- 시스템 비공개 메시지는 해제 불가 (토글 UI 비활성화)
- `toggleMessageVisibility` API 호출 시 `reason` 필드 필수 (`PERSONAL` | `SENSITIVE` | `OTHER`)

### 필터링 토글 UI 패턴

```tsx
function MessageToggleItem({
  message,
  currentUserId,
}: {
  message: SnapshotMessage
  currentUserId: number
}) {
  const isMine = message.senderId === currentUserId
  const isSystemHidden = message.visibility === "HIDDEN_BY_SYSTEM"
  const isToggleable = isMine && !isSystemHidden

  return (
    <div>
      <p>{message.visibility === "PUBLIC" ? message.content : "[비공개 메시지]"}</p>
      {isToggleable && (
        <ToggleButton
          checked={message.visibility === "HIDDEN_BY_SENDER"}
          onChange={() => {/* toggleMessageVisibility mutation */}}
        />
      )}
      {isSystemHidden && (
        <span className="text-xs text-gray-400">시스템에 의해 비공개 처리됨</span>
      )}
    </div>
  )
}
```

### 비공개 비율 경고

| 비율 | 표시 |
|------|------|
| 0~20% | 없음 |
| 21~50% | 일부 비공개 안내 |
| 51~80% | 다수 비공개 경고 |
| 81~100% | 대부분 비공개 강한 경고 |

> `communicationMetrics.hiddenRatio` 값을 기준으로 UI 경고 레벨을 결정한다.

## API 엔드포인트

| Method | URL | 설명 | 인증 | Service 함수 |
|--------|-----|------|------|--------------|
| GET | `/v1/api/review/my-summary` | [전문가] 내 리뷰 요약 (평균 별점, 리뷰 수) | JWT | `getMyReviewSummary()` |
| GET | `/v1/api/review/expert/{expertProfileId}` | [공통] 전문가 리뷰 피드 (커서 기반) | 불필요 | `getExpertReviews(expertProfileId, params?)` |
| GET | `/v1/api/review/{reviewId}` | [공통] 리뷰 상세 조회 (필터링된 대화 내역 포함) | 불필요 | `getReview(reviewId)` |
| GET | `/v1/api/review/{reviewId}/filtering` | [의뢰인/전문가] 필터링 화면 조회 | JWT | `getFilteringReview(reviewId)` |
| POST | `/v1/api/review/{reviewId}/reply` | [전문가] 리뷰 답변 작성 (1회, 500자, 30일 이내) | JWT | `createExpertReply(reviewId, input)` |
| POST | `/v1/api/review/{reviewId}/helpful` | [공통] 도움이 됐어요 토글 | JWT | `toggleHelpful(reviewId)` |
| PATCH | `/v1/api/review/{reviewId}/messages/{messageId}/visibility` | [의뢰인/전문가] 메시지 비공개 토글 | JWT | `toggleMessageVisibility(reviewId, messageId, input)` |
| POST | `/v1/api/review/{reviewId}/filtering/complete` | [의뢰인/전문가] 필터링 완료 확인 | JWT | `confirmFilteringComplete(reviewId)` |
| POST | `/v1/api/review/{reviewId}/rating` | [의뢰인] 별점 입력 (필터링 기간 중) | JWT | `submitRating(reviewId, input)` |
| POST | `/v1/api/review/{reviewId}/rating/late` | [의뢰인] 별점 추가 (공개 후 14일 이내) | JWT | `submitLateRating(reviewId, input)` |

## 프론트엔드 구현 가이드

### Query Keys

```ts
export const reviewQueryKeys = {
  all: ["review"] as const,
  detail: (reviewId: number) => ["review", reviewId] as const,
  filtering: (reviewId: number) => ["review", reviewId, "filtering"] as const,
  mySummary: ["review", "my-summary"] as const,
  byExpert: (expertProfileId: number, params?: { cursor?: string; size?: number }) =>
    ["review", "expert", expertProfileId, params] as const,
}
```

### Query Hook 패턴

```ts
// 리뷰 상세 조회
export function useReviewDetail(reviewId: number) {
  return useQuery({
    queryKey: reviewQueryKeys.detail(reviewId),
    queryFn: () => getReview(reviewId),
  })
}

// 전문가 리뷰 피드 (무한 스크롤)
export function useExpertReviews(expertProfileId: number) {
  return useInfiniteQuery({
    queryKey: reviewQueryKeys.byExpert(expertProfileId),
    queryFn: ({ pageParam }) =>
      getExpertReviews(expertProfileId, { cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
  })
}
```

### Mutation 패턴

```ts
// 별점 입력
export function useSubmitRating(reviewId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { rating: number }) => submitRating(reviewId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewQueryKeys.detail(reviewId) })
    },
  })
}
```

### 상태별 UI 분기

```tsx
function ReviewPage({ review }: { review: ReviewDetail }) {
  switch (review.status) {
    case "FILTERING":
      return <FilteringView review={review} />
    case "WAITING_RATING":
      return <RatingInputView review={review} />
    case "PUBLISHED":
      return <PublishedReviewView review={review} />
    default:
      return null
  }
}
```

### 별점 입력 규칙

| 항목 | 규칙 |
|------|------|
| 범위 | 1~5 (0.5 단위) |
| 입력 시점 | 필터링 기간 중 (`FILTERING` 상태) |
| 늦은 입력 | 공개 후 14일 이내 (`submitLateRating` 사용) |
| 수정 | 한번 등록하면 수정 불가 |

### 전문가 답변 규칙

| 항목 | 규칙 |
|------|------|
| 작성 횟수 | 리뷰당 1회 |
| 글자 수 | 500자 이내 |
| 작성 기한 | 공개 후 30일 이내 |
| 수정/삭제 | 불가 |

## 기능 체크리스트

### 의뢰인
- [x] 필터링 화면에서 자기 메시지 비공개 토글
- [x] 별점 입력 (1~5, 0.5 단위, 선택, 한번 등록 시 수정 불가)
- [x] 필터링 완료 확인
- [x] 별점 추가 (미입력이었던 경우, 공개 후 14일 이내)

### 전문가
- [x] 필터링 화면에서 자기 메시지 비공개 토글
- [x] 필터링 완료 확인
- [x] 전문가 답변 작성 (1회, 500자, 공개 후 30일 이내)

### 공통
- [x] 리뷰 상세 조회 (메시지 목록 + 소통 지표 + 전문가 답변)
- [x] 전문가 리뷰 피드 조회 (커서 기반 무한스크롤)
- [x] 도움이 됐어요 토글
- [x] 내 리뷰 요약 조회 (전문가 전용)

### 시스템 (서버 처리, 프론트엔드 비관여)
- [x] 거래 완료 시 스냅샷 자동 생성
- [x] 개인정보 자동 감지 → 메시지 전체 비공개
- [x] 48시간 후 자동 공개 (배치)
- [ ] 24시간 경과 시 필터링 리마인더
- [ ] 별점 리마인더 (공개 후 7일)

## 데이터 상세

- **[review-data.md](references/review-data.md)** — 전체 엔티티 필드 상세
