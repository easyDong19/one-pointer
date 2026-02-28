---
name: fe-chat
description: 프론트엔드 채팅(Chat) 도메인 가이드. 채팅방 목록, 메시지 송수신, 읽음 처리, 시스템 메시지, 합의서/작업물 메시지 등 Chat 관련 프론트엔드 구현 시 참고한다.
---

# Chat 프론트엔드 가이드

## 개요

매칭 확정 시 자동 생성되는 1:1 채팅. 의뢰인-전문가 간 일정/장소/금액 협의 용도.
- MongoDB 기반 (ID가 ObjectId String)
- 매칭 후 채팅에서 조건 협의 → (온라인) 합의서 제안 → 결제 → 서비스 진행

**리뷰 경고**: 채팅 내역은 거래 완료 후 리뷰로 공개될 수 있음.

---

## TypeScript 타입 정의

```typescript
// ========== Enums ==========

type ChatRoomStatus = 'ACTIVE' | 'ARCHIVED' | 'REPORTED';
type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM' | 'AGREEMENT' | 'DELIVERY';

// ========== 채팅방 목록 ==========

interface MyChatRoomListResponse {
  rooms: ChatRoomSummary[];
  nextCursor: string | null;   // ISO 8601 datetime
  hasNext: boolean;
}

interface ChatRoomSummary {
  roomId: string;              // MongoDB ObjectId
  ticketId: number;
  opponentNickname: string;
  opponentProfileImageUrl: string | null;
  ticketTitle: string;
  ticketStatus: string;        // TicketStatus
  lastMessageType: MessageType;
  lastMessage: string;
  lastMessageAt: string;       // ISO datetime
  unreadCount: number;
  reviewPending: boolean;      // 리뷰 대기 여부
}

// ========== 메시지 ==========

interface ChatMessageResponse {
  id: string;                  // MongoDB ObjectId
  roomId: string;
  senderId: number;
  messageType: MessageType;
  content: string;
  attachmentUrl: string | null;
  isRead: boolean;
  createdAt: string;           // ISO datetime
}

interface SendMessageRequest {
  messageType: MessageType;    // TEXT, IMAGE, FILE
  content: string;
  attachmentUrl?: string;      // IMAGE, FILE 시 S3 URL
}
```

---

## API 엔드포인트

| Method | URL | 설명 | 인증 |
|--------|-----|------|------|
| GET | `/v1/api/chat/rooms` | 내 채팅방 목록 | JWT |
| GET | `/v1/api/chat/rooms/{roomId}/messages` | 메시지 조회 | JWT |
| POST | `/v1/api/chat/rooms/{roomId}/messages` | 메시지 전송 | JWT |
| PATCH | `/v1/api/chat/rooms/{roomId}/read` | 메시지 읽음 처리 | JWT |

### Query Parameters

**채팅방 목록**: `?cursor={ISO datetime}&size=20`
**메시지 조회**: `?cursor={messageId}&size=50`

---

## 에러 코드

| 코드 | 설명 | UI 처리 |
|------|------|---------|
| 40409 | 채팅방 없음 | "채팅방을 찾을 수 없습니다" |
| 40303 | 참여자 아님 | "이 채팅방에 접근할 수 없습니다" |

---

## 프론트엔드 구현 가이드

### 페이지 구조 (추천)

```
/chat
├── /                         # 채팅방 목록
└── /[roomId]                 # 채팅방 상세 (메시지 화면)
```

### 메시지 타입별 렌더링

| MessageType | 렌더링 | 설명 |
|-------------|--------|------|
| `TEXT` | 일반 말풍선 | 텍스트 메시지 |
| `IMAGE` | 이미지 프리뷰 | `attachmentUrl`로 이미지 표시 |
| `FILE` | 파일 다운로드 링크 | 파일 아이콘 + 이름 |
| `SYSTEM` | 시스템 안내 (중앙 정렬) | 회색 배경, 다른 스타일 |
| `AGREEMENT` | 합의서 카드 | 합의서 상세 보기 링크 포함 |
| `DELIVERY` | 작업물 카드 | 작업물 상세 보기 링크 포함 |

### 시스템 메시지 목록

| 시점 | 메시지 |
|------|--------|
| 채팅 오픈 | "매칭이 완료되었어요! 일정과 세부사항을 이야기해보세요" |
| 채팅 오픈 (리뷰 경고) | "이 대화는 거래 완료 후 리뷰로 공개될 수 있어요. 개인정보는 자동으로 보호됩니다." |
| 24시간 무대화 | "24시간 동안 대화가 없어요. 일정을 조율해보세요!" |
| 합의서 제안 | "합의서가 제안되었어요. 내용을 확인해주세요!" |
| 합의서 확정 | "합의가 완료되었어요! 다음 단계로 진행합니다." |
| 합의서 거절 | "합의서가 거절되었어요. 조건을 다시 이야기해보세요." |
| 결제 완료 | "안전결제가 완료되었어요! 서비스를 시작해주세요." |
| 서비스 완료 | "서비스가 완료되었어요! 리뷰를 남겨주세요" |

### 채팅방 목록 UI

```typescript
// 채팅방 목록 정렬: lastMessageAt 기준 최신순
// 안 읽은 메시지 뱃지 표시: unreadCount
// 리뷰 대기 뱃지: reviewPending === true

function ChatRoomItem({ room }: { room: ChatRoomSummary }) {
  return (
    <div>
      <Avatar src={room.opponentProfileImageUrl} />
      <div>
        <span>{room.opponentNickname}</span>
        <span>{room.ticketTitle}</span>
      </div>
      <div>
        <span>{formatLastMessage(room.lastMessage, room.lastMessageType)}</span>
        <span>{formatRelativeTime(room.lastMessageAt)}</span>
      </div>
      {room.unreadCount > 0 && <Badge count={room.unreadCount} />}
      {room.reviewPending && <Badge text="리뷰 대기" />}
    </div>
  );
}
```

### 채팅 화면 구현

```typescript
// 1. 메시지 로드 (커서 기반, 오래된 메시지부터 스크롤)
const loadMessages = async (roomId: string, cursor?: string) => {
  const { data } = await api.get(`/v1/api/chat/rooms/${roomId}/messages`, {
    params: { cursor, size: 50 },
  });
  return data.data; // ChatMessageResponse[]
};

// 2. 메시지 전송
const sendMessage = async (roomId: string, content: string) => {
  await api.post(`/v1/api/chat/rooms/${roomId}/messages`, {
    messageType: 'TEXT',
    content,
  });
};

// 3. 이미지 전송
const sendImage = async (roomId: string, file: File) => {
  // 먼저 이미지 업로드
  const imageUrl = await uploadImage(file);
  await api.post(`/v1/api/chat/rooms/${roomId}/messages`, {
    messageType: 'IMAGE',
    content: file.name,
    attachmentUrl: imageUrl,
  });
};

// 4. 읽음 처리 (채팅방 진입 시 호출)
const markAsRead = async (roomId: string) => {
  await api.patch(`/v1/api/chat/rooms/${roomId}/read`);
};
```

### 채팅 내 액션 버튼 (ticketStatus 기반)

| ticketStatus | 의뢰인 액션 | 전문가 액션 |
|--------------|-----------|-----------|
| `MATCHED` | "합의서 제안하기" (온라인만) | — |
| `MATCHED` | "진행 시작하기" (오프라인) | — |
| `PAYMENT_PENDING` | "결제하기" (온라인) | — |
| `IN_PROGRESS` | — | "작업물 전달하기" (온라인) |
| `IN_PROGRESS` | "완료 확인하기" (오프라인) | — |
| `DELIVERED` | "승인" / "수정 요청" (온라인) | — |
| `COMPLETED` | "리뷰 작성하기" | — |

### 폴링 vs WebSocket

현재 백엔드는 REST API 기반. 실시간 메시지를 위해:
- **단기**: 주기적 폴링 (5~10초 간격으로 새 메시지 조회)
- **장기**: WebSocket/SSE 도입 시 별도 연동 필요

```typescript
// 폴링 예시
useEffect(() => {
  const interval = setInterval(async () => {
    const messages = await loadMessages(roomId, lastMessageId);
    if (messages.length > 0) {
      appendMessages(messages);
    }
  }, 5000);
  return () => clearInterval(interval);
}, [roomId]);
```

### 채팅 정책

| 규칙 | 내용 |
|------|------|
| 외부 연락처 교환 | 매칭 후 허용 |
| 개인정보 | 전화번호 등 자동 감지 → 안심번호 안내 |
| 신고 | 부적절 메시지 신고 가능 |
| 보관 | 영구 보관 |
| 리뷰 공개 | 거래 완료 후 채팅 내역이 리뷰로 공개될 수 있음 |
