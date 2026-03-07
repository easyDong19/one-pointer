# Review 도메인 데이터 상세

## 목차
1. [Review 엔티티](#1-review-엔티티)
2. [ChatSnapshot 엔티티](#2-chatsnapshot-엔티티)
3. [SnapshotMessage 엔티티](#3-snapshotmessage-엔티티)
4. [ExpertReply 엔티티](#4-expertreply-엔티티)
5. [AutoHideLog 엔티티](#5-autohidelog-엔티티)
6. [MessageFilter 엔티티](#6-messagefilter-엔티티)
7. [ReviewHelpful 엔티티](#7-reviewhelpful-엔티티)
---

## 1. Review 엔티티

엔티티: `one_pointer.domain.review.entity.Review`
테이블: `review` (인덱스: `idx_review_ticket` unique on ticket_id, `idx_review_expert` on expert_id, `idx_review_status` on status)

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `review_id` | Long (PK, IDENTITY) | 자동 | 리뷰 고유 식별자 |
| `ticketId` | `ticket_id` | Long (unique) | ✅ | 거래 티켓 ID (Ticket PK, 다른 도메인). 1:1 |
| `chatRoomId` | `chat_room_id` | String | ✅ | 원본 채팅방 ID (ChatRoom `_id`, MongoDB, 다른 도메인) |
| `clientId` | `client_id` | Long | ✅ | 의뢰인 사용자 ID (User PK, 다른 도메인) |
| `expertId` | `expert_id` | Long | ✅ | 전문가 사용자 ID (User PK, 다른 도메인) |
| `rating` | `rating` | Float | ⬜ | 별점 1~5 (0.5 단위). 미입력 시 null |
| `status` | `status` | `ReviewStatus` | ✅ | 리뷰 상태 (기본값: SNAPSHOT_CREATED) |
| `filteringDeadline` | `filtering_deadline` | LocalDateTime | ✅ | 필터링 마감일 (생성 + 48시간) |
| `clientFilteredAt` | `client_filtered_at` | LocalDateTime | ⬜ | 의뢰인 필터링 완료 시점 |
| `expertFilteredAt` | `expert_filtered_at` | LocalDateTime | ⬜ | 전문가 필터링 완료 시점 |
| `ratingAt` | `rating_at` | LocalDateTime | ⬜ | 별점 입력 시점 |
| `publishedAt` | `published_at` | LocalDateTime | ⬜ | 공개 시점 |
| `helpfulCount` | `helpful_count` | Integer | ✅ | 도움이 됐어요 수 (기본값: 0) |
| `createDateTime` | `create_date_time` | LocalDateTime | 자동 | 생성일시 (BaseTimeEntity) |
| `modifiedDateTime` | `modified_date_time` | LocalDateTime | 자동 | 수정일시 (BaseTimeEntity) |

### 연관 엔티티 (같은 도메인, JPA)
| 엔티티 | 관계 | 설명 |
|--------|------|------|
| `ChatSnapshot` | OneToOne (mappedBy) | 채팅 스냅샷 |
| `ExpertReply` | OneToOne (mappedBy) | 전문가 답변 |

### 비즈니스 메서드
- `startFiltering()` — FILTERING 상태로 전환
- `markClientFiltered()` — 의뢰인 필터링 완료 기록
- `markExpertFiltered()` — 전문가 필터링 완료 기록
- `rate(Float)` — 별점 입력 + ratingAt 기록
- `publish()` — rating 유무에 따라 PUBLISHED / PUBLISHED_NO_RATING, publishedAt 기록
- `hide()` — HIDDEN 처리 (관리자)

---

## 2. ChatSnapshot 엔티티

엔티티: `one_pointer.domain.review.entity.ChatSnapshot`
테이블: `chat_snapshot`

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `chat_snapshot_id` | Long (PK, IDENTITY) | 자동 | 스냅샷 고유 식별자 |
| `review` | `review_id` (FK, unique) | Review | ✅ | 소속 리뷰 (OneToOne LAZY) |
| `chatRoomId` | `chat_room_id` | String | ✅ | 원본 채팅방 ID (MongoDB) |
| `totalMessageCount` | `total_message_count` | Integer | ✅ | 전체 메시지 수 |
| `publicMessageCount` | `public_message_count` | Integer | 자동 | 공개 메시지 수 (공개 확정 후 갱신, 기본: 0) |
| `hiddenMessageCount` | `hidden_message_count` | Integer | 자동 | 비공개 메시지 수 (기본: 0) |
| `clientHiddenRatio` | `client_hidden_ratio` | Float | 자동 | 의뢰인 비공개 비율 0.0~1.0 (기본: 0.0) |
| `expertHiddenRatio` | `expert_hidden_ratio` | Float | 자동 | 전문가 비공개 비율 0.0~1.0 (기본: 0.0) |
| `averageResponseMinutes` | `average_response_minutes` | Long | ⬜ | 평균 응답 시간 (분, 소통 지표) |
| `firstResponseMinutes` | `first_response_minutes` | Long | ⬜ | 첫 응답 시간 (분, 소통 지표) |

### 연관 엔티티
| 엔티티 | 관계 | 설명 |
|--------|------|------|
| `SnapshotMessage` | OneToMany (cascade ALL, orphanRemoval) | 스냅샷 메시지 목록 |

### 비즈니스 메서드
- `addMessage(SnapshotMessage)` — 메시지 추가
- `updateCounts(publicCount, hiddenCount, clientRatio, expertRatio)` — 공개 확정 시 카운트 갱신

---

## 3. SnapshotMessage 엔티티

엔티티: `one_pointer.domain.review.entity.SnapshotMessage`
테이블: `snapshot_message` (인덱스: `idx_snapshot_msg_snapshot` on chat_snapshot_id, `idx_snapshot_msg_visibility` on visibility)

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `snapshot_message_id` | Long (PK, IDENTITY) | 자동 | 메시지 고유 식별자 |
| `chatSnapshot` | `chat_snapshot_id` (FK) | ChatSnapshot | ✅ | 소속 스냅샷 (ManyToOne LAZY) |
| `originalMessageId` | `original_message_id` | String | ✅ | 원본 ChatMessage `_id` (MongoDB, 다른 도메인) |
| `senderType` | `sender_type` | `SenderType` | ✅ | 발신자 유형 — CLIENT / EXPERT / SYSTEM |
| `senderNickname` | `sender_nickname` | String | ✅ | 발신자 닉네임 (실명 X) |
| `messageType` | `message_type` | `MessageType` | ✅ | 메시지 유형 — TEXT / IMAGE / FILE / SYSTEM (기존 enum 재사용) |
| `content` | `content` | Text (@Lob) | ✅ | 원본 내용. 비공개 시 API에서 미반환 (관리자만 열람) |
| `attachmentUrl` | `attachment_url` | String | ⬜ | 첨부파일 URL (IMAGE / FILE 타입 시 사용, 비공개 시 API에서 null 반환) |
| `visibility` | `visibility` | `MessageVisibility` | ✅ | PUBLIC / HIDDEN_BY_SENDER / HIDDEN_BY_SYSTEM (기본: PUBLIC) |
| `hiddenReason` | `hidden_reason` | `HiddenReason` | ⬜ | HIDDEN_BY_SYSTEM일 때 감지 유형 (PHONE, EMAIL 등) |
| `sentAt` | `sent_at` | LocalDateTime | ✅ | 원본 메시지 전송 시각 |
| `sequence` | `sequence` | Integer | ✅ | 메시지 순서 (정렬용) |

### 비즈니스 메서드
- `hideBySystem(HiddenReason)` — HIDDEN_BY_SYSTEM + 사유 기록
- `hideBySender()` — HIDDEN_BY_SENDER
- `makePublic()` — PUBLIC으로 복원, hiddenReason 초기화

---

## 4. ExpertReply 엔티티

엔티티: `one_pointer.domain.review.entity.ExpertReply`
테이블: `expert_reply`

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `expert_reply_id` | Long (PK, IDENTITY) | 자동 | 답변 고유 식별자 |
| `review` | `review_id` (FK, unique) | Review | ✅ | 소속 리뷰 (OneToOne LAZY) |
| `expertId` | `expert_id` | Long | ✅ | 전문가 사용자 ID (User PK, 다른 도메인) |
| `content` | `content` | String(500) | ✅ | 답변 내용 (500자 이내) |

> 정책: 리뷰당 1회, 공개 후 30일 이내, 수정 불가

---

## 5. AutoHideLog 엔티티

엔티티: `one_pointer.domain.review.entity.AutoHideLog`
테이블: `auto_hide_log`

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `auto_hide_log_id` | Long (PK, IDENTITY) | 자동 | 로그 고유 식별자 |
| `snapshotMessage` | `snapshot_message_id` (FK) | SnapshotMessage | ✅ | 비공개 처리된 메시지 (ManyToOne LAZY) |
| `detectedType` | `detected_type` | `HiddenReason` | ✅ | 감지 유형 — PHONE / ACCOUNT / EMAIL / ADDRESS / MESSENGER / LINK |
| `detectedText` | `detected_text` | Text (@Lob) | ✅ | 감지된 원본 텍스트 (관리자 전용) |

> 하나의 메시지에서 여러 개인정보가 감지될 수 있으므로 ManyToOne (1 메시지 : N 로그)

---

## 6. MessageFilter 엔티티

엔티티: `one_pointer.domain.review.entity.MessageFilter`
테이블: `message_filter`

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `message_filter_id` | Long (PK, IDENTITY) | 자동 | 필터 고유 식별자 |
| `review` | `review_id` (FK) | Review | ✅ | 소속 리뷰 (ManyToOne LAZY) |
| `snapshotMessage` | `snapshot_message_id` (FK) | SnapshotMessage | ✅ | 비공개된 메시지 (ManyToOne LAZY) |
| `filteredBy` | `filtered_by` | Long | ✅ | 처리한 사용자 ID (User PK, 다른 도메인) |
| `reason` | `reason` | `FilterReason` | ⬜ | 비공개 사유 — PERSONAL / SENSITIVE / OTHER |

---

## 7. ReviewHelpful 엔티티

엔티티: `one_pointer.domain.review.entity.ReviewHelpful`
테이블: `review_helpful` (유니크 제약: `uk_review_helpful_user` on review_id + user_id)

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `review_helpful_id` | Long (PK, IDENTITY) | 자동 | 고유 식별자 |
| `review` | `review_id` (FK) | Review | ✅ | 소속 리뷰 (ManyToOne LAZY) |
| `userId` | `user_id` | Long | ✅ | 도움이 됐어요를 누른 사용자 ID (User PK, 다른 도메인) |

> 사용자당 리뷰 1건에 1회만 가능 (unique constraint). 토글 방식으로 등록/취소.

