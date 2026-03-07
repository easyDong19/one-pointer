# Chat 도메인 데이터 상세

## 목차
1. [ChatRoom Document](#1-chatroom-document)
2. [ChatMessage Document](#2-chatmessage-document)

---

## 1. ChatRoom Document

Document: `one_pointer.domain.chat.document.ChatRoom`
Collection: `chat_room`
인덱스: `ticketId` (unique), `clientId`, `expertId`, `lastMessageAt`

| 필드명 | MongoDB 필드 | 타입 | 필수 | 설명 |
|--------|-------------|------|------|------|
| `id` | `_id` | String (ObjectId) | 자동 | 채팅방 고유 식별자 |
| `ticketId` | `ticketId` | Long | ✅ | 연결된 티켓 ID (Ticket PK, 다른 도메인). unique 인덱스 |
| `clientId` | `clientId` | Long | ✅ | 의뢰인 사용자 ID (User PK, 다른 도메인) |
| `expertId` | `expertId` | Long | ✅ | 전문가 사용자 ID (User PK, 다른 도메인) |
| `status` | `status` | `ChatRoomStatus` | ✅ | 채팅방 상태 — ACTIVE / ARCHIVED / REPORTED (기본값: ACTIVE) |
| `lastMessageAt` | `lastMessageAt` | LocalDateTime | ⬜ | 마지막 메시지 발신일시 (비정규화, 목록 정렬/커서에 사용) |
| `lastMessageContent` | `lastMessageContent` | String | ⬜ | 마지막 메시지 내용 (비정규화, 목록 미리보기용) |
| `lastMessageType` | `lastMessageType` | `MessageType` | ⬜ | 마지막 메시지 유형 (비정규화, 목록 표시용) |
| `reminderSentAt` | `reminderSentAt` | LocalDateTime | ⬜ | 24시간 무대화 리마인더 발송 시각. 중복 발송 방지용. 새 메시지 수신 시 자동 null 초기화 |
| `createdAt` | `createdAt` | LocalDateTime | 자동 | 생성일시 (@CreatedDate) |
| `modifiedAt` | `modifiedAt` | LocalDateTime | 자동 | 수정일시 (@LastModifiedDate) |

비즈니스 메서드:
- `updateLastMessage(content, type, time)` — 마지막 메시지 정보 갱신 + reminderSentAt 초기화 (메시지 전송 시 호출)
- `archive()` — 상태를 ARCHIVED로 변경
- `report()` — 상태를 REPORTED로 변경
- `markReminderSent()` — 리마인더 발송 시각 기록

---

## 2. ChatMessage Document

Document: `one_pointer.domain.chat.document.ChatMessage`
Collection: `chat_message`
인덱스: `roomId`

| 필드명 | MongoDB 필드 | 타입 | 필수 | 설명 |
|--------|-------------|------|------|------|
| `id` | `_id` | String (ObjectId) | 자동 | 메시지 고유 식별자 |
| `roomId` | `roomId` | String | ✅ | 소속 채팅방 ID (ChatRoom `_id`, 같은 도메인) |
| `senderId` | `senderId` | Long | ✅ | 발신자 사용자 ID (User PK, 다른 도메인) |
| `messageType` | `messageType` | `MessageType` | ✅ | 메시지 유형 — TEXT / IMAGE / FILE / SYSTEM / AGREEMENT / DELIVERY (기본값: TEXT) |
| `content` | `content` | String | ⬜ | 메시지 내용 (텍스트 또는 시스템 메시지 본문) |
| `attachmentUrl` | `attachmentUrl` | String | ⬜ | 첨부파일 URL (IMAGE / FILE 타입 시 사용) |
| `referenceId` | `referenceId` | Long | ⬜ | 합의서/작업물 등 참조 엔티티 ID (AGREEMENT / DELIVERY 타입 시 사용) |
| `isRead` | `isRead` | Boolean | ✅ | 상대방 읽음 여부 (기본값: false) |
| `createdAt` | `createdAt` | LocalDateTime | 자동 | 발신일시 (@CreatedDate) |

비즈니스 메서드:
- `markAsRead()` — isRead를 true로 변경
