---
name: chat
description: 채팅 도메인 프론트엔드 구현 가이드. 매칭 완료 후 자동 생성되는 1:1 채팅방, 메시지 목록/상세 조회, 폴링 기반 메시지 수신, MessageType별 렌더링 등 Chat 도메인 관련 프론트엔드 작업 시 사용. /chat 으로 호출하거나 채팅방/메시지 UI를 다룰 때 참고한다.
---

# Chat 도메인

매칭 확정 시 자동 생성되는 1:1 채팅. 의뢰인과 전문가 간 일정/장소/금액 협의 및 서비스 전 소통 용도.
채팅에서 조건 협의 후 **온라인 의뢰 시 합의서(Agreement)를 제안·확정**하여 다음 단계(결제)로 넘어간다. 오프라인 의뢰는 합의서 없이 바로 진행.

## 채팅 생성 조건

| 항목 | 내용 |
|------|------|
| 생성 시점 | 매칭 확정 시 서버에서 자동 생성 |
| 참여자 | 의뢰인 1명 + 전문가 1명 (1:1) |
| 용도 | 일정/장소/금액 협의, 서비스 전 소통 |

## 데이터 관계

```
ChatRoom (1) ──── (N) ChatMessage
   │                    │
   ├── ticketId          ├── roomId
   ├── clientId          └── senderId
   └── expertId
```

## Enum 정의

| Enum | 값 | 설명 |
|------|-----|------|
| `ChatRoomStatus` | `ACTIVE`, `ARCHIVED`, `REPORTED` | 채팅방 상태 |
| `MessageType` | `TEXT`, `IMAGE`, `FILE`, `SYSTEM`, `AGREEMENT`, `DELIVERY` | 메시지 유형 |

## 시스템 메시지 (서버 자동 발송)

| 시점 | 메시지 |
|------|--------|
| 채팅 오픈 | "매칭이 완료되었어요! 일정과 세부사항을 이야기해보세요" |
| 채팅 오픈 (리뷰 경고) | "이 대화는 거래 완료 후 리뷰로 공개될 수 있어요. 개인정보는 자동으로 보호됩니다." |
| 24시간 무대화 리마인더 | "24시간 동안 대화가 없어요. 일정을 조율해보세요!" |
| (온라인) 합의서 제안 | "합의서가 제안되었어요. 내용을 확인해주세요!" |
| (온라인) 합의서 확정 | "합의가 완료되었어요! 다음 단계로 진행합니다." |
| (온라인) 합의서 거절 | "합의서가 거절되었어요. 조건을 다시 이야기해보세요." |
| (온라인) 결제 완료 | "안전결제가 완료되었어요! 서비스를 시작해주세요." |
| 서비스 완료 확인 | "서비스가 완료되었어요! 리뷰를 남겨주세요" |

## 채팅 정책

| 규칙 | 내용 |
|------|------|
| 외부 연락처 교환 | 매칭 후 허용 (매칭 전 금지) |
| 보관 기간 | 영구 보관 |
| 개인정보 | 서버에서 자동 감지 → 안심번호 안내 |
| 신고 | 부적절 메시지 신고 가능 |

## API 엔드포인트

| Method | URL | 설명 | 인증 |
|--------|-----|------|------|
| GET | `/v1/api/chat/rooms/by-ticket/{ticketId}` | 티켓 ID로 채팅방 ID 조회 (알림→채팅 이동) | JWT |
| GET | `/v1/api/chat/rooms` | 내 채팅방 목록 조회 (커서 기반, query: cursor, size) | JWT |
| GET | `/v1/api/chat/rooms/{roomId}/messages` | 채팅방 상세 조회 (메시지 이력 + 상대방 정보 + 티켓 진행 상태) | JWT |
| POST | `/v1/api/chat/rooms/{roomId}/read` | 메시지 읽음 처리 (채팅방 입장 후 호출) | JWT |

> **참고**: 프론트엔드에서는 WebSocket을 사용하지 않고, REST API 폴링 방식으로 메시지를 수신한다.

## 프론트엔드 구현 가이드

### FSD 파일 구조

```
src/
├── entities/chat/
│   ├── api/
│   │   ├── chat.schema.ts          # zod v4 스키마
│   │   └── chat.service.ts         # Service Layer
│   └── model/
│       └── chat.query-keys.ts      # TanStack Query 키 팩토리
├── features/chat/
│   ├── chat-list/
│   │   ├── model/                  # useChatRoomsQuery
│   │   └── ui/                     # ChatRoomList, ChatRoomItem
│   ├── chat-room/
│   │   ├── model/                  # useChatMessagesQuery (폴링)
│   │   └── ui/                     # ChatRoom, MessageBubble
│   └── send-message/
│       ├── model/                  # useSendMessageMutation
│       └── ui/                     # MessageInput, FileUpload
```

### Service 함수

| 함수 | 설명 | API |
|------|------|-----|
| `getChatRooms(params?)` | 채팅방 목록 (커서 페이지네이션) | GET `/v1/api/chat/rooms` |
| `getChatRoomMessages(roomId, params?)` | 메시지 상세 조회 | GET `/v1/api/chat/rooms/{roomId}/messages` |
| `markMessagesAsRead(roomId)` | 메시지 읽음 처리 | POST `/v1/api/chat/rooms/{roomId}/read` |

### 폴링 기반 메시지 수신 패턴

```typescript
export function useChatMessagesQuery(roomId: number) {
  return useQuery({
    queryKey: chatKeys.roomMessages(roomId),
    queryFn: () => getChatRoomMessages(roomId),
    refetchInterval: 3000,    // 3초 간격 폴링
    refetchIntervalInBackground: false,  // 탭 비활성 시 중지
  })
}
```

- 채팅방 진입 시 `markMessagesAsRead(roomId)` 호출
- 채팅방 목록도 폴링으로 `unreadCount`, `lastMessage` 갱신
- 새 메시지 전송 후 `queryClient.invalidateQueries`로 즉시 갱신

### MessageType별 렌더링 가이드

| MessageType | 렌더링 | 설명 |
|-------------|--------|------|
| `TEXT` | 텍스트 말풍선 | senderId로 본인/상대 구분하여 좌/우 배치 |
| `IMAGE` | 이미지 썸네일 | `fileUrl`로 표시. 클릭 시 원본 뷰어 |
| `FILE` | 파일 카드 | `fileName`, `fileSize` 표시 + 다운로드 |
| `SYSTEM` | 시스템 알림 | 중앙 정렬, 배경색 구분. senderId 없음 |
| `AGREEMENT` | 합의서 카드 | 합의서 상태/내용 카드. 온라인 의뢰 전용 |
| `DELIVERY` | 작업물 카드 | 작업물 전달/상태 카드. 온라인 의뢰 전용 |

```tsx
function MessageBubble({ message }: { message: ChatMessage }) {
  switch (message.messageType) {
    case "TEXT":     return <TextBubble message={message} />
    case "IMAGE":    return <ImageBubble message={message} />
    case "FILE":     return <FileBubble message={message} />
    case "SYSTEM":   return <SystemMessage message={message} />
    case "AGREEMENT": return <AgreementCard message={message} />
    case "DELIVERY": return <DeliveryCard message={message} />
  }
}
```

## 데이터 상세

- **[chat-data.md](references/chat-data.md)** — ChatRoom, ChatMessage 필드 상세

## 기능 체크리스트

### 프론트엔드
- [x] 채팅방 목록 조회 (커서 기반 무한스크롤)
- [x] 채팅방 상세 메시지 조회
- [x] 읽음 처리 API 연동
- [ ] 폴링 기반 실시간 메시지 수신
- [ ] MessageType별 메시지 버블 렌더링
- [ ] 텍스트/이미지/파일 메시지 전송 UI
- [ ] 합의서(AGREEMENT) 카드 렌더링 및 액션
- [ ] 작업물(DELIVERY) 카드 렌더링 및 액션
- [ ] 알림에서 채팅방 이동 (ticketId → roomId 변환)
