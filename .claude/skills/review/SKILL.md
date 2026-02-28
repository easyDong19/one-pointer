---
name: fe-review
description: 프론트엔드 리뷰(Review) 도메인 가이드. 채팅 기반 투명 리뷰 시스템. 거래 완료 후 채팅 스냅샷 자동 생성, 비공개 필터링, 별점, 전문가 답변, 도움됐어요 등 Review 관련 프론트엔드 구현 시 참고한다.
---

# Review 프론트엔드 가이드

## 개요

**"리뷰 = 채팅 내역 그 자체"** — 텍스트 리뷰 대신 실제 채팅 내역이 리뷰로 공개됨.
- 거래 완료 시 채팅 내역이 스냅샷으로 복사
- 48시간 동안 비공개 필터링 기간
- 의뢰인 별점 (선택), 전문가 답변 (1회)

## 리뷰 흐름

```
거래 완료 (Ticket COMPLETED)
  │
  ▼ 서버 자동 처리 (즉시)
  ① 채팅 메시지 → 스냅샷 복사
  ② 개인정보 메시지 자동 비공개 (HIDDEN_BY_SYSTEM)
  ③ Review 생성 (FILTERING)
  │
  ▼ 필터링 기간 (48시간)
  - 의뢰인/전문가 각자 자기 메시지만 비공개 토글
  - 의뢰인 별점 입력 (선택)
  │
  ▼ 48시간 경과 또는 양쪽 모두 필터링 완료
  리뷰 공개 (PUBLISHED / PUBLISHED_NO_RATING)
  │
  ▼ 공개 후
  - 전문가 답변 1회 (500자, 30일 이내)
  - 별점 추후 추가 가능 (공개 후 14일 이내)
```

---

## TypeScript 타입 정의

```typescript
// ========== Enums ==========

type ReviewStatus = 'SNAPSHOT_CREATED' | 'FILTERING' | 'WAITING_RATING' | 'PUBLISHED' | 'PUBLISHED_NO_RATING' | 'HIDDEN';
type MessageVisibility = 'PUBLIC' | 'HIDDEN_BY_SENDER' | 'HIDDEN_BY_SYSTEM';
type SenderType = 'CLIENT' | 'EXPERT' | 'SYSTEM';
type FilterReason = 'PERSONAL' | 'SENSITIVE' | 'OTHER';

// ========== Review ==========

interface ReviewDetailResponse {
  id: number;
  ticketId: number;
  ticketTitle: string;
  clientId: number;
  clientNickname: string;
  expertId: number;
  expertNickname: string;
  status: ReviewStatus;
  rating: number | null;       // 1.0~5.0, 0.5 단위
  filteringDeadline: string;   // 필터링 마감일
  publishedAt: string | null;
  snapshot: SnapshotResponse;
  expertReply: ExpertReplyResponse | null;
  communicationMetrics: CommunicationMetrics | null;
  helpfulCount: number;
  isHelpful: boolean;          // 내가 도움됐어요 눌렀는지
  hiddenRatio: number;         // 비공개 비율 (0.0~1.0)
  createdAt: string;
}

interface SnapshotResponse {
  id: number;
  messages: SnapshotMessageResponse[];
  totalMessageCount: number;
  hiddenMessageCount: number;
}

interface SnapshotMessageResponse {
  id: number;
  sequence: number;
  senderType: SenderType;
  senderNickname: string;
  messageType: string;         // TEXT, IMAGE, FILE, SYSTEM
  content: string;             // PUBLIC이면 원문, HIDDEN이면 "[비공개 메시지]"
  visibility: MessageVisibility;
  createdAt: string;
}

interface ExpertReplyResponse {
  id: number;
  expertId: number;
  content: string;
  createdAt: string;
}

interface CommunicationMetrics {
  avgResponseTime: string;     // "약 15분"
  totalMessageCount: number;
  conversationDuration: string; // "3일"
}

// ========== Review Feed (전문가 프로필 내 리뷰) ==========

interface ReviewFeedResponse {
  content: ReviewSummary[];
  nextCursor: number | null;
  hasNext: boolean;
}

interface ReviewSummary {
  id: number;
  ticketTitle: string;
  clientNickname: string;
  rating: number | null;
  status: ReviewStatus;
  publishedAt: string;
  messagePreview: string;      // 첫 몇 줄 미리보기
  hiddenRatio: number;
  helpfulCount: number;
  expertReplyExists: boolean;
  createdAt: string;
}

// ========== Review Summary (전문가 프로필 요약) ==========

interface ReviewSummaryResponse {
  averageRating: number | null;
  reviewCount: number;
  totalMatchCount: number;
}

// ========== 필터링 ==========

interface FilteringScreenResponse {
  reviewId: number;
  status: ReviewStatus;
  filteringDeadline: string;
  messages: FilterableMessage[];
  myFilteringCompleted: boolean;
}

interface FilterableMessage {
  snapshotMessageId: number;
  sequence: number;
  senderType: SenderType;
  senderNickname: string;
  content: string;
  visibility: MessageVisibility;
  isMine: boolean;             // 내가 보낸 메시지인지
  canToggle: boolean;          // 비공개 토글 가능 여부
}

// ========== Request ==========

interface SubmitRatingRequest {
  rating: number;              // 1.0~5.0, 0.5 단위
}

interface ExpertReplyRequest {
  content: string;             // 최대 500자
}

interface ToggleVisibilityRequest {
  snapshotMessageId: number;
  visibility: 'PUBLIC' | 'HIDDEN_BY_SENDER';
  reason?: FilterReason;       // HIDDEN_BY_SENDER 시 선택
}
```

---

## API 엔드포인트

| Method | URL | 설명 | 인증 |
|--------|-----|------|------|
| GET | `/v1/api/review/{reviewId}` | 리뷰 상세 조회 | JWT |
| GET | `/v1/api/review/expert/{expertId}` | 전문가 리뷰 피드 | JWT |
| GET | `/v1/api/review/expert/{expertId}/summary` | 전문가 리뷰 요약 (평점/건수) | JWT |
| GET | `/v1/api/review/{reviewId}/filtering` | 필터링 화면 조회 | JWT |
| PATCH | `/v1/api/review/{reviewId}/filtering/toggle` | 메시지 비공개 토글 | JWT |
| PATCH | `/v1/api/review/{reviewId}/filtering/complete` | 필터링 완료 확인 | JWT |
| POST | `/v1/api/review/{reviewId}/rating` | 별점 입력 | JWT (Client) |
| POST | `/v1/api/review/{reviewId}/reply` | 전문가 답변 | JWT (Expert) |
| POST | `/v1/api/review/{reviewId}/helpful` | 도움됐어요 토글 | JWT |
| GET | `/v1/api/review/my` | 내 리뷰 요약 | JWT |

---

## 프론트엔드 구현 가이드

### 페이지 구조 (추천)

```
/review
├── /[reviewId]               # 리뷰 상세 (공개 후)
│   └── 채팅 내역 + 별점 + 전문가 답변
├── /[reviewId]/filtering     # 비공개 필터링 화면 (거래 완료 후 48시간)
└── /my                       # 내 리뷰 관리

/expert/{id}
└── 리뷰 탭                   # 전문가 프로필 내 리뷰 피드
```

### 리뷰 상태별 UI

| 상태 | 의뢰인 | 전문가 |
|------|--------|--------|
| `FILTERING` | 필터링 화면 (비공개 선택 + 별점 입력) | 필터링 화면 (비공개 선택) |
| `WAITING_RATING` | 별점 입력 요청 | 대기 |
| `PUBLISHED` | 공개된 리뷰 조회 | 답변 작성 가능 |
| `PUBLISHED_NO_RATING` | 별점 추가 가능 (14일 이내) | 답변 작성 가능 |
| `HIDDEN` | "관리자에 의해 숨김 처리됨" | 동일 |

### 비공개 필터링 화면

```typescript
function FilteringScreen({ data }: { data: FilteringScreenResponse }) {
  return (
    <div>
      <Timer deadline={data.filteringDeadline} label="필터링 마감까지" />

      {data.messages.map((msg) => (
        <MessageItem key={msg.snapshotMessageId}>
          <SenderBadge type={msg.senderType} />
          <Content>{msg.content}</Content>

          {msg.isMine && msg.canToggle && (
            <ToggleButton
              visibility={msg.visibility}
              onChange={(v) => toggleVisibility(msg.snapshotMessageId, v)}
            />
          )}

          {msg.visibility === 'HIDDEN_BY_SYSTEM' && (
            <SystemBadge>시스템 비공개 (해제 불가)</SystemBadge>
          )}
        </MessageItem>
      ))}

      <Button onClick={handleCompleteFiltering}>
        필터링 완료
      </Button>
    </div>
  );
}
```

### 비공개 비율 경고

| 비율 | 표시 |
|------|------|
| 0~20% | 없음 |
| 21~50% | "일부 메시지가 비공개 처리되었습니다" |
| 51~80% | "다수의 메시지가 비공개 처리되었습니다" (주황 경고) |
| 81~100% | "대부분의 메시지가 비공개 처리되었습니다" (빨간 경고) |

```typescript
function HiddenRatioWarning({ ratio }: { ratio: number }) {
  const percent = Math.round(ratio * 100);
  if (percent <= 20) return null;
  if (percent <= 50) return <Warning level="info">일부 비공개 ({percent}%)</Warning>;
  if (percent <= 80) return <Warning level="warn">다수 비공개 ({percent}%)</Warning>;
  return <Warning level="danger">대부분 비공개 ({percent}%)</Warning>;
}
```

### 별점 입력

```typescript
// 1.0~5.0, 0.5 단위
// 한 번 등록하면 수정 불가
// PUBLISHED_NO_RATING → 14일 이내 추가 가능

function RatingInput({ reviewId, existingRating }: Props) {
  if (existingRating !== null) {
    return <StarDisplay rating={existingRating} />;
  }

  return (
    <StarPicker
      min={1} max={5} step={0.5}
      onSubmit={async (rating) => {
        await api.post(`/v1/api/review/${reviewId}/rating`, { rating });
        showToast('별점이 등록되었습니다');
      }}
    />
  );
}
```

### 전문가 답변

```typescript
// 1회만 가능, 500자 제한, 공개 후 30일 이내

function ExpertReply({ reviewId, existingReply }: Props) {
  if (existingReply) {
    return <ReplyCard reply={existingReply} />;
  }

  return (
    <form onSubmit={async (e) => {
      const content = formData.get('content');
      if (content.length > 500) return;
      await api.post(`/v1/api/review/${reviewId}/reply`, { content });
    }}>
      <textarea maxLength={500} name="content" />
      <Button type="submit">답변 등록</Button>
    </form>
  );
}
```

### 도움됐어요

```typescript
// 토글 방식 (눌렀다 다시 누르면 취소)
async function toggleHelpful(reviewId: number) {
  const { data } = await api.post(`/v1/api/review/${reviewId}/helpful`);
  // data.data: { isHelpful: boolean, helpfulCount: number }
}
```

### 전문가 프로필 내 리뷰 표시

```typescript
// 전문가 프로필 페이지에서
// 1. 리뷰 요약 (평균 별점, 리뷰 수, 총 매칭 수)
const summary = await api.get(`/v1/api/review/expert/${expertId}/summary`);

// 2. 리뷰 피드 (커서 페이지네이션)
const reviews = await api.get(`/v1/api/review/expert/${expertId}`, {
  params: { cursor: lastReviewId, size: 10 },
});

// 표시:
// ⭐ 4.5 (12건) | 총 매칭 15건
// [리뷰 카드 목록]
//   - 의뢰인 닉네임, 별점, 채팅 미리보기
//   - 비공개 비율 경고
//   - 전문가 답변 여부
//   - 도움됐어요 수
```

### 소통 지표 표시

```typescript
// 리뷰 상세 또는 전문가 프로필에서
function CommunicationMetrics({ metrics }: { metrics: CommunicationMetrics }) {
  return (
    <div>
      <Stat label="평균 응답 시간" value={metrics.avgResponseTime} />
      <Stat label="총 메시지" value={`${metrics.totalMessageCount}건`} />
      <Stat label="대화 기간" value={metrics.conversationDuration} />
    </div>
  );
}
```

### 메시지 표시 규칙

| visibility | 표시 |
|------------|------|
| `PUBLIC` | 원문 그대로 |
| `HIDDEN_BY_SENDER` | "[비공개 메시지]" |
| `HIDDEN_BY_SYSTEM` | "[비공개 메시지]" |

- 두 HIDDEN 모두 열람자에게 동일하게 "[비공개 메시지]"로 표시
- 비공개 주체(발신자/시스템) 정보는 비노출
