---
name: chat
description: 채팅 도메인 기획. 매칭 완료 후 자동 생성되는 1:1 채팅방, 메시지 송수신, 시스템 메시지, 합의서/작업물 알림 메시지 등. 채팅 목록, 채팅방, 메시지 렌더링 등 Chat 관련 프론트엔드 작업 시 참고. /chat 으로 호출.
---

# Chat 도메인 (프론트엔드)

매칭 확정 시 자동 생성되는 1:1 채팅. 의뢰인-전문가 간 일정/장소/금액 협의, 합의서/작업물 알림 등.

## Enum/상태값

```typescript
type ChatRoomStatus = 'ACTIVE' | 'ARCHIVED' | 'REPORTED'

// 주의: AGREEMENT, DELIVERY 타입 포함
type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM' | 'AGREEMENT' | 'DELIVERY'
```

### 메시지 유형별 UI 렌더링

| MessageType | 설명 | UI 처리 |
|-------------|------|---------|
| `TEXT` | 일반 텍스트 | 말풍선 |
| `IMAGE` | 이미지 | 이미지 미리보기 (탭 → 전체 보기) |
| `FILE` | 파일 | 파일 아이콘 + 파일명 + 다운로드 |
| `SYSTEM` | 시스템 안내 | 센터 정렬, 구분선 스타일 |
| `AGREEMENT` | 합의서 제안/확정/거절 알림 | 합의서 카드 UI (referenceId로 Agreement 조회) |
| `DELIVERY` | 작업물 제출/승인 알림 | 작업물 카드 UI (referenceId로 Delivery 조회) |

### 마지막 메시지 미리보기 (채팅 목록)

| MessageType | 미리보기 텍스트 |
|-------------|-----------------|
| `TEXT` | 내용 truncate |
| `IMAGE` | "사진을 보냈습니다" |
| `FILE` | "파일을 보냈습니다" |
| `SYSTEM` | 시스템 메시지 내용 |
| `AGREEMENT` | "합의서가 제안되었어요" 등 |
| `DELIVERY` | "작업물이 전달되었어요" 등 |

## 데이터 모델

```typescript
interface ChatRoom {
  id: string                    // MongoDB ObjectId
  ticketId: number
  clientId: number
  expertId: number
  status: ChatRoomStatus        // 기본: ACTIVE
  lastMessageAt?: string        // 목록 정렬용
  lastMessageContent?: string   // 미리보기용
  lastMessageType?: MessageType
  createdAt: string
}

interface ChatMessage {
  id: string                    // MongoDB ObjectId
  roomId: string                // ChatRoom.id
  senderId: number
  messageType: MessageType      // 기본: TEXT
  content?: string              // 텍스트/시스템 메시지 본문
  attachmentUrl?: string        // IMAGE/FILE 시
  referenceId?: number          // AGREEMENT/DELIVERY 시 참조 엔티티 ID
  isRead: boolean               // 기본: false
  createdAt: string
}
```

## 시스템 메시지

| 시점 | 메시지 내용 | MessageType |
|------|------------|-------------|
| 채팅 오픈 | "매칭이 완료되었어요! 일정과 세부사항을 이야기해보세요" | SYSTEM |
| 채팅 오픈 (리뷰 경고) | "이 대화는 거래 완료 후 리뷰로 공개될 수 있어요. 개인정보는 자동으로 보호됩니다." | SYSTEM |
| 24시간 무대화 리마인더 | "아직 대화가 시작되지 않았어요. 먼저 인사해보세요!" | SYSTEM |
| (온라인) 합의서 제안 | "합의서가 제안되었어요. 내용을 확인해주세요!" | AGREEMENT |
| (온라인) 합의서 확정 | "합의가 완료되었어요! 다음 단계로 진행합니다." | AGREEMENT |
| (온라인) 합의서 거절 | "합의서가 거절되었어요. 조건을 다시 이야기해보세요." | AGREEMENT |
| (온라인) 결제 완료 | "안전결제가 완료되었어요! 서비스를 시작해주세요." | SYSTEM |
| 서비스 완료 | "서비스가 완료되었어요! 리뷰를 남겨주세요" | SYSTEM |

## 채팅 목록 화면

각 채팅방 항목에 포함되는 정보:

- 상대방 프로필 (닉네임, 프로필 이미지)
- 연결된 티켓 정보 (제목, 상태)
- 마지막 메시지 미리보기 + 시각
- 안 읽은 메시지 수
- 거래 상태 (매칭 중 / 진행 중 / 완료 등)
- 리뷰 대기 여부

> 커서 기반 페이지네이션 (lastMessageAt 기준)

## 채팅 정책

| 규칙 | 내용 |
|------|------|
| 외부 연락처 교환 | 매칭 후 허용 (매칭 전 금지) |
| 보관 기간 | 완료 후 **6개월** → ARCHIVED |
| 개인정보 | 전화번호 등 자동 감지 → 안심번호 안내 |
| 신고 | 부적절 메시지 신고 가능 → REPORTED |
| 리뷰 공개 | 거래 완료 후 채팅 내역이 리뷰로 공개될 수 있음 (가입 시 동의) |

## 읽음 처리

- 채팅방 진입 시 안 읽은 메시지 **일괄 읽음 처리**
- 상대방이 보낸 메시지에 읽음 마크 (`isRead: true`)

## 악용 방지 (프론트 UX 고려사항)

| 위험 | 대응 |
|------|------|
| 플랫폼 우회 거래 | 매칭 전 개인정보/연락처 자동 감지 차단 |
| 부적절한 메시지 | 신고 시스템, 누적 시 계정 정지 |
| 스팸/광고 | URL/연락처 패턴 감지 |
| 개인정보 유출 | 전화번호/계좌/이메일 자동 감지 → 안심번호 안내 |
| 채팅 리뷰 공개 거부 | 가입 시 동의 필수 (서비스 이용 전제조건) |

## 기능 체크리스트

### 의뢰인 / 전문가 공통
- [ ] 채팅방 목록 조회 (커서 페이지네이션)
- [ ] 채팅 메시지 조회 (시간순)
- [ ] 텍스트 메시지 전송
- [ ] 이미지/파일 전송
- [ ] 읽음 처리
- [ ] 안 읽은 메시지 수 표시
- [ ] AGREEMENT 메시지 카드 렌더링
- [ ] DELIVERY 메시지 카드 렌더링
- [ ] 24시간 무대화 리마인더
- [ ] 개인정보 감지 필터링
- [ ] 신고 기능
