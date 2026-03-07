# Notification 데이터 정의

## Notification (알림 히스토리)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `notificationId` | Long (PK) | O | IDENTITY 전략 |
| `recipientId` | Long | O | 수신 사용자 ID |
| `type` | NotificationType | O | 알림 유형 (24종) |
| `title` | String | O | 알림 제목 |
| `body` | String (max 500) | O | 알림 본문 |
| `targetId` | Long | X | 관련 엔티티 ID (티켓, 제안서, 배달 등) |
| `isRead` | Boolean | O | 읽음 여부 (기본값: false) |
| `createDateTime` | LocalDateTime | O | BaseTimeEntity 상속 |
| `modifiedDateTime` | LocalDateTime | O | BaseTimeEntity 상속 |

**인덱스**: `idx_notification_recipient` — (recipientId, notificationId)

---

## UserFcmToken (FCM 디바이스 토큰)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `userFcmTokenId` | Long (PK) | O | IDENTITY 전략 |
| `userId` | Long | O | 사용자 ID |
| `fcmToken` | String | O | Firebase Cloud Messaging 토큰 |
| `deviceId` | String | O | 디바이스 고유 식별자 |
| `deviceType` | DeviceType | O | WEB / ANDROID / IOS |
| `createDateTime` | LocalDateTime | O | BaseTimeEntity 상속 |
| `modifiedDateTime` | LocalDateTime | O | BaseTimeEntity 상속 |

**제약조건**:
- UNIQUE: (userId, deviceId) — 사용자 + 디바이스 조합 유니크
- INDEX: fcmToken

---

## DTO

### NotificationResponse (응답)

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | Long | 알림 ID |
| `type` | NotificationType | 알림 유형 |
| `targetType` | NotificationTargetType | 알림 대상 유형 (TICKET / REVIEW / DISPUTE / NONE) |
| `title` | String | 제목 |
| `body` | String | 본문 |
| `targetId` | Long | 관련 엔티티 ID |
| `isRead` | Boolean | 읽음 여부 |
| `createdAt` | LocalDateTime | 생성 시각 |

### UpdateFcmTokenRequest (FCM 토큰 등록/갱신)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `fcmToken` | String | O | FCM 토큰 |
| `deviceId` | String | O | 디바이스 식별자 |
| `deviceType` | DeviceType | O | WEB / ANDROID / IOS |

### DeleteFcmTokenRequest (FCM 토큰 삭제)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `deviceId` | String | O | 디바이스 식별자 |

### UpdateNotificationRequest (알림 수신 설정)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `notificationEnabled` | Boolean | O | 알림 수신 ON/OFF |
