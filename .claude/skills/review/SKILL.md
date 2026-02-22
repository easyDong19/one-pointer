---
name: review
description: 채팅 기반 투명 리뷰 도메인 기획. 거래 완료 후 채팅 스냅샷 생성, 비공개 필터링(48시간), 별점, 전문가 답변, 소통 지표 등. 필터링 화면, 리뷰 목록/상세, 전문가 프로필 리뷰 등 Review 관련 프론트엔드 작업 시 참고. /review 로 호출.
---

# Review 도메인 (프론트엔드)

**"리뷰 = 채팅 내역 그 자체"** — 거래 완료 시 채팅 내역이 자동으로 투명하게 공개. 의뢰인은 별점만 남기면 된다.

## Enum/상태값

```typescript
type ReviewStatus = 'SNAPSHOT_CREATED' | 'FILTERING' | 'WAITING_RATING'
  | 'PUBLISHED' | 'PUBLISHED_NO_RATING' | 'HIDDEN'
type MessageVisibility = 'PUBLIC' | 'HIDDEN_BY_SENDER' | 'HIDDEN_BY_SYSTEM'
type SenderType = 'CLIENT' | 'EXPERT' | 'SYSTEM'
type FilterReason = 'PERSONAL' | 'SENSITIVE' | 'OTHER'
type HiddenReason = 'PHONE' | 'ACCOUNT' | 'EMAIL' | 'ADDRESS' | 'MESSENGER' | 'LINK'

// Chat 도메인과 동일 (스냅샷에서 재사용)
type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM' | 'AGREEMENT' | 'DELIVERY'
```

### 리뷰 상태 전이 + UI 라벨

| 상태 | UI 라벨 | 전이 조건 |
|------|---------|-----------|
| `SNAPSHOT_CREATED` | (내부) | 티켓 COMPLETED 시 자동 |
| `FILTERING` | 리뷰 준비 중 | 스냅샷 직후 자동 전환 |
| `WAITING_RATING` | 별점 입력 대기 | 48시간 경과 or 양측 완료 |
| `PUBLISHED` | ⭐ 4.5 | 별점 포함 공개 |
| `PUBLISHED_NO_RATING` | 별점 없음 | 별점 미입력 공개 |
| `HIDDEN` | (미표시) | 관리자 숨김 |

### 메시지 공개 상태

| MessageVisibility | 열람자에게 표시 |
|-------------------|----------------|
| `PUBLIC` | 원문 그대로 |
| `HIDDEN_BY_SENDER` | "[비공개 메시지]" |
| `HIDDEN_BY_SYSTEM` | "[비공개 메시지]" |

> 두 HIDDEN 모두 **동일하게** "[비공개 메시지]"로 표시. 비공개 주체 비노출.

## 데이터 모델

```typescript
interface Review {
  id: number
  ticketId: number
  chatRoomId: string           // MongoDB ObjectId
  clientId: number
  expertId: number
  rating?: number              // 1~5 (0.5 단위), null이면 미입력
  helpfulCount: number         // "도움됐어요" 수 (기본: 0)
  status: ReviewStatus
  filteringDeadline: string    // 생성 + 48시간
  clientFilteredAt?: string
  expertFilteredAt?: string
  ratingAt?: string
  publishedAt?: string
}

interface ChatSnapshot {
  id: number
  chatRoomId: string
  totalMessageCount: number
  publicMessageCount: number
  hiddenMessageCount: number
  clientHiddenRatio: number           // 0.0~1.0
  expertHiddenRatio: number           // 0.0~1.0
  averageResponseMinutes?: number     // 평균 응답 시간 (분)
  firstResponseMinutes?: number       // 최초 응답 시간 (분)
  messages: SnapshotMessage[]
}

interface SnapshotMessage {
  id: number
  senderType: SenderType
  senderNickname: string              // 닉네임 (실명 X)
  messageType: MessageType
  content: string                     // 비공개 시 API에서 미반환
  visibility: MessageVisibility       // 기본: PUBLIC
  hiddenReason?: HiddenReason         // HIDDEN_BY_SYSTEM일 때만
  sentAt: string
  sequence: number                    // 정렬용
}

interface ExpertReply {
  id: number
  expertId: number
  content: string                     // 500자 이내
}

interface ReviewHelpful {
  reviewId: number
  userId: number
  // 토글 방식: 존재하면 삭제, 없으면 생성
}
```

## 전체 흐름

```
거래 완료 (Ticket COMPLETED)
  │
  ▼
[Step 1] 서버 자동 (즉시)
  ① 채팅 메시지 → 스냅샷으로 복사
  ② 개인정보 메시지 → 자동 비공개 (HIDDEN_BY_SYSTEM)
  ③ 리뷰 생성 → FILTERING
  │
  ▼
[Step 2] 필터링 기간 (48시간)
  - 의뢰인/전문가 각자 자기 메시지만 비공개 토글
  - HIDDEN_BY_SYSTEM 메시지는 해제 불가
  - 의뢰인 별점 입력 (선택)
  │
  ▼ 48시간 경과 or 양쪽 모두 완료
[Step 3] 리뷰 공개
  - PUBLISHED (별점 있음) / PUBLISHED_NO_RATING (별점 없음)
  │
  ▼
[Step 4] 공개 후
  - 전문가 답변 1회 (500자, 30일 이내)
  - "도움됐어요" 클릭
  - 별점 수정: 공개 후 24시간 이내 1회
```

## 비공개 처리 정책

### 1단계: 서버 자동 (즉시)
- 감지 대상: 전화번호, 계좌번호, 이메일, 상세주소, 메신저 ID, 외부 링크
- **메시지 전체를 비공개** (부분 마스킹 없음)
- 사용자가 해제 **불가**

### 2단계: 사용자 수동 (48시간)
- **자기가 보낸 메시지만** 비공개 토글
- HIDDEN_BY_SYSTEM 메시지는 토글 **비활성화**
- 비공개 사유 선택 가능 (PERSONAL / SENSITIVE / OTHER)

### 비공개 비율 경고 (리뷰 열람 시 표시)

| 비율 | 표시 |
|------|------|
| 0~20% | 없음 |
| 21~50% | 일부 비공개 안내 |
| 51~80% | 다수 비공개 경고 |
| 81~100% | 대부분 비공개 강한 경고 |

## 소통 지표

스냅샷에 포함되어 전문가 프로필과 리뷰 상세에 표시.

| 지표 | 필드 | 설명 |
|------|------|------|
| 평균 응답 시간 | `averageResponseMinutes` | 메시지 답변까지 평균 시간 |
| 최초 응답 시간 | `firstResponseMinutes` | 첫 메시지 응답 시간 |
| 총 메시지 수 | `totalMessageCount` | 거래 중 주고받은 메시지 수 |

## 리뷰 정책 요약

| 항목 | 내용 |
|------|------|
| 별점 | 1~5 (0.5 단위), **선택사항** |
| 별점 수정 | 공개 후 **24시간 이내 1회** |
| 별점 추가 | 미입력이었다면 공개 후 **14일 이내** |
| 전문가 답변 | **1회**, **500자**, 공개 후 **30일 이내**, 수정 불가 |
| 도움됐어요 | 1인 1회 (토글: 클릭 → 추가, 다시 클릭 → 취소) |

## UI 구현 참고

### 필터링 화면 (48시간)
- 스냅샷 메시지 목록 (sequence 순)
- 자기 메시지에만 비공개 토글 버튼
- HIDDEN_BY_SYSTEM: 토글 비활성화 + "시스템 보호" 라벨
- 남은 필터링 시간 카운트다운
- "필터링 완료" 버튼
- 별점 입력 UI (0.5 단위 별 선택기)

### 리뷰 공개 화면 (열람자)
- 별점 (없으면 "별점 없음")
- 소통 지표 (응답 시간, 메시지 수)
- 스냅샷 메시지 목록
  - PUBLIC: 원문 (senderType별 스타일 분기)
  - HIDDEN: "[비공개 메시지]" (회색/이탤릭)
  - SYSTEM: 센터 정렬
- 비공개 비율 경고
- 전문가 답변 (있으면)
- "도움됐어요" 버튼 + 카운트

## 악용 방지 (프론트 UX 고려사항)

| 위험 | 대응 |
|------|------|
| 비공개 남용 (리뷰 무력화) | 비공개 비율 경고 (21% 이상) |
| 허위/보복성 별점 | 별점 수정 24시간 1회, 채팅 내역이 함께 공개 |
| 전문가 답변 악용 | 1회 500자, 수정 불가, 관리자 삭제 가능 |
| 리뷰 강요/협박 | 채팅 내역 그대로 공개, 신고 가능 |
| "도움됐어요" 어뷰징 | 1인 1회 제한 (토글) |

## 기능 체크리스트

### 의뢰인
- [ ] 필터링 화면에서 자기 메시지 비공개 토글
- [ ] 별점 입력 (1~5, 0.5 단위)
- [ ] 필터링 완료 확인
- [ ] 별점 수정 (공개 후 24시간 이내 1회)
- [ ] 별점 추가 (미입력 → 14일 이내)

### 전문가
- [ ] 필터링 화면에서 자기 메시지 비공개 토글
- [ ] 필터링 완료 확인
- [ ] 전문가 답변 작성 (1회, 500자, 30일 이내)

### 공통 열람
- [ ] 리뷰 목록 (전문가 프로필 내)
- [ ] 리뷰 상세 (스냅샷 + 별점 + 답변 + 소통 지표)
- [ ] "도움됐어요" 토글
- [ ] 비공개 비율 경고 표시
