---
name: notification
description: 알림(Notification) 도메인 프론트엔드 구현 가이드. FCM 웹 푸시, 알림 히스토리 목록/읽음/삭제, 읽지 않은 수 폴링, NotificationType별 라우팅 등 Notification 도메인 관련 프론트엔드 작업 시 사용. /notification 으로 호출하거나 알림·FCM·디바이스토큰 UI를 다룰 때 참고한다.
---

# Notification 도메인

플랫폼 내 이벤트 발생 시 **FCM 웹 푸시 알림**을 보내고, **알림 히스토리**를 앱 내에서 조회/관리한다.

## 프론트엔드 알림 흐름

```
[1] 로그인 후 FCM 토큰 등록 (PUT /v1/api/user/fcm-token)
    │
    ▼
[2] FCM Web Push 수신 → 브라우저 알림 표시
    │
    ▼
[3] 알림센터 (GET /v1/api/notification) → 목록 렌더링
    │
    ▼
[4] 알림 클릭 → readNotification() + NotificationType별 라우팅
    │
    ▼
[5] 읽지 않은 수 폴링 (GET /v1/api/notification/unread-count)
```

## NotificationType (32종)

### Ticket 관련

| 타입 | 제목 | 메시지 템플릿 | targetType |
|------|------|--------------|------------|
| `NEW_TICKET` | 새로운 의뢰 | 새로운 [%s] 의뢰가 올라왔어요! | TICKET |
| `PROPOSAL_RECEIVED` | 새 제안서 도착 | %s 전문가가 제안서를 보냈어요. | TICKET |
| `TICKET_MATCHED_CLIENT` | 매칭 완료 | 전문가와 매칭되었어요! 채팅에서 대화를 시작하세요. | TICKET |
| `TICKET_MATCHED_EXPERT` | 제안 채택 | 제안이 채택되었어요! 채팅에서 대화를 시작하세요. | TICKET |
| `TICKET_CANCELLED` | 의뢰 취소 | %s 의뢰가 취소되었어요. | TICKET |
| `TICKET_EXPIRED` | 의뢰 만료 | %s 의뢰 모집이 마감되었어요. | TICKET |
| `TICKET_AUTO_COMPLETED` | 자동 완료 | 48시간 경과로 거래가 자동 완료되었습니다. | TICKET |
| `DIRECT_REQUEST_RECEIVED` | 직접 의뢰 수신 | %s님이 '%s' 직접 의뢰를 보냈어요 | TICKET |
| `DIRECT_REQUEST_EXPIRED` | 직접 의뢰 만료 | 전문가가 48시간 내 응답하지 않아 직접 의뢰가 만료되었어요. | TICKET |

### Delivery 관련

| 타입 | 제목 | 메시지 템플릿 | targetType |
|------|------|--------------|------------|
| `DELIVERY_SUBMITTED` | 작업물 전달 | 전문가가 작업물을 전달했어요. 확인해주세요! | TICKET |
| `DELIVERY_APPROVED` | 작업물 승인 | 의뢰인이 작업물을 승인했어요! 거래가 완료되었습니다. | TICKET |
| `REVISION_REQUESTED` | 수정 요청 | 의뢰인이 수정을 요청했어요. 확인해주세요. | TICKET |
| `DELIVERY_RESUBMITTED` | 수정 작업물 전달 | 전문가가 수정된 작업물을 전달했어요. | TICKET |
| `DELIVERY_AUTO_APPROVED` | 자동 승인 | 24시간 경과로 작업물이 자동 승인되었습니다. | TICKET |
| `DELIVERY_APPROVE_REMINDER` | 승인 확인 요청 | 작업물이 4시간 뒤 자동 승인됩니다. 확인해주세요! | TICKET |

### Agreement & Payment 관련

| 타입 | 제목 | 메시지 템플릿 | targetType |
|------|------|--------------|------------|
| `AGREEMENT_CONFIRMED` | 합의서 확정 | 합의서가 확정되었어요! 결제를 진행해주세요. | TICKET |
| `ESCROW_PAYMENT_COMPLETED` | 결제 완료 | 결제가 완료되었어요! (%,d원) 전문가님, 서비스를 시작해주세요. | TICKET |
| `ESCROW_SETTLED` | 정산 완료 | %,d원이 정산되었어요! | TICKET |

### Chat 관련

| 타입 | 제목 | 메시지 템플릿 | targetType |
|------|------|--------------|------------|
| `CHAT_REMINDER` | 대화 리마인더 | 24시간 동안 대화가 없어요. 일정을 조율해보세요! | TICKET |
| `CHAT_MESSAGE` | 새 메시지 | %s님이 메시지를 보냈어요. | TICKET |

### Review 관련

| 타입 | 제목 | 메시지 템플릿 | targetType |
|------|------|--------------|------------|
| `REVIEW_PUBLISHED` | 리뷰 공개 | 리뷰가 공개되었어요. | REVIEW |
| `EXPERT_REPLY` | 전문가 답변 | 전문가가 리뷰에 답변을 남겼어요. | REVIEW |

### Dispute 관련

| 타입 | 제목 | 메시지 템플릿 | targetType |
|------|------|--------------|------------|
| `DISPUTE_SUBMITTED_APPLICANT` | 분쟁 신청 완료 | 분쟁 신청이 접수되었어요. | DISPUTE |
| `DISPUTE_SUBMITTED_RESPONDENT` | 분쟁 발생 | 상대방이 분쟁을 신청했어요. | DISPUTE |
| `DISPUTE_REJECTED` | 분쟁 반려 | 분쟁 신청이 반려되었습니다. | DISPUTE |
| `DISPUTE_UNDER_REVIEW` | 분쟁 검토 시작 | 분쟁 조정이 시작되었습니다. 소명을 제출해주세요. | DISPUTE |
| `DISPUTE_RESPONDENT_STATEMENT` | 소명 제출 | 상대방이 소명을 제출했습니다. | DISPUTE |
| `DISPUTE_RESOLVED` | 분쟁 해결 | 분쟁이 해결되었습니다. | DISPUTE |
| `DISPUTE_CLOSED` | 분쟁 종결 | 합의에 이르지 못했습니다. | DISPUTE |
| `DISPUTE_CANCELLED` | 분쟁 취소 | 분쟁이 취소되었습니다. | DISPUTE |

### Coupon 관련

| 타입 | 제목 | 메시지 템플릿 | targetType |
|------|------|--------------|------------|
| `COUPON_EXPIRING` | 쿠폰 만료 임박 | 쿠폰 %d장이 7일 이내에 만료됩니다. | NONE |

## NotificationType → 라우팅 매핑

```typescript
const TARGET_TYPE_MAP: Record<string, string> = {
  // TICKET targetType → /ticket/{referenceId}
  NEW_TICKET: "TICKET",
  PROPOSAL_RECEIVED: "TICKET",
  TICKET_MATCHED_CLIENT: "TICKET",
  TICKET_MATCHED_EXPERT: "TICKET",
  TICKET_CANCELLED: "TICKET",
  TICKET_EXPIRED: "TICKET",
  TICKET_AUTO_COMPLETED: "TICKET",
  DIRECT_REQUEST_RECEIVED: "TICKET",
  DIRECT_REQUEST_EXPIRED: "TICKET",
  DELIVERY_SUBMITTED: "TICKET",
  DELIVERY_APPROVED: "TICKET",
  REVISION_REQUESTED: "TICKET",
  DELIVERY_RESUBMITTED: "TICKET",
  DELIVERY_AUTO_APPROVED: "TICKET",
  DELIVERY_APPROVE_REMINDER: "TICKET",
  AGREEMENT_CONFIRMED: "TICKET",
  ESCROW_PAYMENT_COMPLETED: "TICKET",
  ESCROW_SETTLED: "TICKET",
  CHAT_REMINDER: "TICKET",
  CHAT_MESSAGE: "TICKET",
  // REVIEW targetType → /review/{referenceId}
  REVIEW_PUBLISHED: "REVIEW",
  EXPERT_REPLY: "REVIEW",
  // DISPUTE targetType → /dispute/{referenceId}
  DISPUTE_SUBMITTED_APPLICANT: "DISPUTE",
  DISPUTE_SUBMITTED_RESPONDENT: "DISPUTE",
  DISPUTE_REJECTED: "DISPUTE",
  DISPUTE_UNDER_REVIEW: "DISPUTE",
  DISPUTE_RESPONDENT_STATEMENT: "DISPUTE",
  DISPUTE_RESOLVED: "DISPUTE",
  DISPUTE_CLOSED: "DISPUTE",
  DISPUTE_CANCELLED: "DISPUTE",
  // NONE → 이동 없음
  COUPON_EXPIRING: "NONE",
}
```

## Enum 정의

| Enum | 값 |
|------|-----|
| `NotificationType` | 위 표 참고 (32종) |
| `NotificationTargetType` | `TICKET`, `REVIEW`, `DISPUTE`, `NONE` |
| `DeviceType` | `WEB`, `ANDROID`, `IOS` |

## API 엔드포인트

### 알림 관리

| Method | URL | 설명 | 인증 | Service 함수 |
|--------|-----|------|------|--------------|
| GET | `/v1/api/notification` | 알림 목록 조회 (커서 페이지네이션) | JWT | `getNotifications(params?)` |
| GET | `/v1/api/notification/unread-count` | 읽지 않은 알림 수 | JWT | `getUnreadNotificationCount()` |
| PATCH | `/v1/api/notification/{id}/read` | 단건 읽음 처리 | JWT | `readNotification(id)` |
| PATCH | `/v1/api/notification/read-all` | 전체 읽음 처리 | JWT | `readAllNotifications()` |
| DELETE | `/v1/api/notification/{id}` | 알림 삭제 | JWT | `deleteNotification(id)` |

### FCM 토큰 관리 (User 도메인)

| Method | URL | 설명 | 인증 | Service 함수 |
|--------|-----|------|------|--------------|
| PUT | `/v1/api/user/fcm-token` | FCM 토큰 등록/갱신 | JWT | `updateFcmToken(input)` |
| DELETE | `/v1/api/user/fcm-token` | FCM 토큰 삭제 (로그아웃) | JWT | `deleteFcmToken(input)` |
| PATCH | `/v1/api/user/notification` | 알림 수신 설정 ON/OFF | JWT | `updateNotificationSetting(input)` |

## 프론트엔드 구현 가이드

### FSD 파일 구조

```
src/
├── entities/notification/
│   ├── api/
│   │   ├── notification.schema.ts   # zod v4 스키마 (30종 NotificationType enum 포함)
│   │   └── notification.service.ts  # Service Layer
│   └── model/
│       └── notification.query-keys.ts
│
├── features/notification/
│   ├── notification-list/           # 알림센터 목록
│   │   ├── model/                   # useNotifications infinite query
│   │   └── ui/                     # NotificationList, NotificationItem
│   ├── unread-count/               # 읽지 않은 알림 수
│   │   ├── model/                   # useUnreadCount query (폴링)
│   │   └── ui/                     # UnreadBadge
│   └── fcm-setup/                  # FCM 초기화
│       └── model/                   # useFcmSetup
```

### Query Keys

```typescript
export const notificationQueryKeys = {
  all: ["notification"] as const,
  list: (params?: { cursor?: string; size?: number }) =>
    ["notification", "list", params] as const,
  unreadCount: ["notification", "unread-count"] as const,
}
```

### 읽지 않은 수 폴링 패턴

```typescript
export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationQueryKeys.unreadCount,
    queryFn: getUnreadNotificationCount,
    refetchInterval: 30_000,    // 30초 간격 폴링
    refetchIntervalInBackground: false,
  })
}
```

### 알림 목록 무한스크롤 패턴

```typescript
export function useNotifications() {
  return useInfiniteQuery({
    queryKey: notificationQueryKeys.list(),
    queryFn: ({ pageParam }) =>
      getNotifications({ cursor: pageParam, size: 20 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
  })
}
```

### 읽음 + 라우팅 Mutation 패턴

```typescript
export function useReadAndNavigate() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: readNotification,
    onSuccess: (_, notificationId) => {
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount })
      queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list() })
      // TARGET_TYPE_MAP에 따라 라우팅
    },
  })
}
```

### FCM Web Push 초기화

```typescript
// 로그인 후 호출
async function initFcmToken() {
  const permission = await Notification.requestPermission()
  if (permission !== "granted") return

  const token = await getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY })
  await updateFcmToken({
    fcmToken: token,
    deviceId: getOrCreateDeviceId(),
    deviceType: "WEB",
  })
}
```

### 캐시 무효화 전략

| 이벤트 | 무효화 대상 |
|---|---|
| 알림 읽음 처리 | `notificationQueryKeys.unreadCount`, `notificationQueryKeys.list()` |
| 전체 읽음 처리 | `notificationQueryKeys.unreadCount`, `notificationQueryKeys.list()` |
| 알림 삭제 | `notificationQueryKeys.list()`, `notificationQueryKeys.unreadCount` |

## 에러 코드

| 에러 코드 | HTTP | 메시지 | 프론트 처리 |
|-----------|------|--------|------------|
| `UNAUTHORIZED_NOTIFICATION_ACCESS` (40311) | 403 | 본인의 알림만 관리할 수 있습니다. | 에러 토스트 |
| `NOT_EXIST_NOTIFICATION` (40416) | 404 | 존재하지 않는 알림입니다. | 에러 토스트 |

## 기능 체크리스트

### 알림 히스토리
- [x] 알림 목록 조회 (커서 기반 페이지네이션) — Service 구현 완료
- [x] 읽지 않은 알림 수 조회 — Service 구현 완료
- [x] 단건 읽음 처리 — Service 구현 완료
- [x] 전체 읽음 처리 — Service 구현 완료
- [x] 알림 삭제 — Service 구현 완료
- [ ] 알림 목록 UI (무한 스크롤)
- [ ] 알림 클릭 시 NotificationType별 라우팅
- [ ] 읽지 않은 수 뱃지 UI (폴링)

### FCM Web Push
- [ ] FCM 토큰 등록 (로그인 후)
- [ ] FCM 토큰 삭제 (로그아웃 시)
- [ ] 브라우저 푸시 알림 표시
- [ ] Service Worker 등록 (`firebase-messaging-sw.js`)

## 데이터 상세

- **[notification-data.md](references/notification-data.md)** — Notification, UserFcmToken 필드 상세
