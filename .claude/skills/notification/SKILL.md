---
name: fe-notification
description: 프론트엔드 알림(Notification) 도메인 가이드. FCM 푸시 알림 수신, 알림 센터 목록/읽음/삭제, FCM 토큰 관리 등 Notification 관련 프론트엔드 구현 시 참고한다.
---

# Notification 프론트엔드 가이드

## 개요

FCM 푸시 알림 + 앱 내 알림 히스토리.
- 비즈니스 이벤트 발생 시 FCM 푸시 알림
- 알림 히스토리 DB 저장 → 앱 내 알림 센터에서 조회
- 다중 디바이스 지원 (WEB/ANDROID/IOS)

---

## TypeScript 타입 정의

```typescript
// ========== Enums ==========

type NotificationType =
  // 티켓/매칭
  | 'NEW_TICKET'
  | 'PROPOSAL_RECEIVED'
  | 'TICKET_MATCHED_CLIENT'
  | 'TICKET_MATCHED_EXPERT'
  // 작업물
  | 'DELIVERY_SUBMITTED'
  | 'DELIVERY_APPROVED'
  | 'REVISION_REQUESTED'
  | 'DELIVERY_RESUBMITTED'
  // 자동 처리
  | 'TICKET_AUTO_COMPLETED'
  | 'DELIVERY_AUTO_APPROVED'
  | 'DELIVERY_APPROVE_REMINDER'
  // 취소/만료
  | 'TICKET_CANCELLED'
  | 'TICKET_EXPIRED'
  // 리뷰
  | 'REVIEW_PUBLISHED'
  | 'EXPERT_REPLY'
  // 채팅
  | 'CHAT_REMINDER'
  // 쿠폰
  | 'COUPON_EXPIRING'
  // 결제
  | 'ESCROW_PAYMENT_COMPLETED'
  | 'ESCROW_SETTLED';

type DeviceType = 'IOS' | 'ANDROID' | 'WEB';

// ========== Response ==========

interface NotificationResponse {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  referenceId: number | null;   // 관련 엔티티 ID (ticketId 등)
  isRead: boolean;
  createdAt: string;
}

interface NotificationListResponse {
  content: NotificationResponse[];
  nextCursor: number | null;
  hasNext: boolean;
}

interface UnreadCountResponse {
  count: number;
}
```

---

## API 엔드포인트

### 알림 히스토리

| Method | URL | 설명 | 인증 |
|--------|-----|------|------|
| GET | `/v1/api/notification` | 알림 목록 (커서 페이지네이션) | JWT |
| GET | `/v1/api/notification/unread-count` | 안 읽은 알림 수 | JWT |
| PATCH | `/v1/api/notification/{id}/read` | 단건 읽음 처리 | JWT |
| PATCH | `/v1/api/notification/read-all` | 전체 읽음 처리 | JWT |
| DELETE | `/v1/api/notification/{id}` | 알림 삭제 | JWT |

### FCM 토큰 관리 (User API)

| Method | URL | 설명 | 인증 |
|--------|-----|------|------|
| PUT | `/v1/api/user/fcm-token` | FCM 토큰 등록/갱신 | JWT |
| DELETE | `/v1/api/user/fcm-token` | FCM 토큰 삭제 (로그아웃) | JWT |
| PATCH | `/v1/api/user/notification` | 알림 수신 ON/OFF | JWT |

---

## 에러 코드

| 코드 | 설명 | UI 처리 |
|------|------|---------|
| 40311 | 본인 알림이 아님 | — |
| 40416 | 알림 없음 | — |

---

## 프론트엔드 구현 가이드

### 페이지 구조 (추천)

```
/notification                 # 알림 센터 (목록)
/settings/notification        # 알림 수신 설정
```

### FCM 초기화 (Firebase)

```typescript
// firebase.ts
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// FCM 토큰 발급 + 서버 등록
export async function initializeFcm() {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;

  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
  });

  // 서버에 토큰 등록
  await api.put('/v1/api/user/fcm-token', {
    fcmToken: token,
    deviceType: 'WEB',
  });

  return token;
}

// 포그라운드 메시지 수신
export function onForegroundMessage(callback: (payload: any) => void) {
  onMessage(messaging, callback);
}
```

### Service Worker (firebase-messaging-sw.js)

```javascript
// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.x.x/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.x.x/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: '...',
  projectId: '...',
  messagingSenderId: '...',
  appId: '...',
});

const messaging = firebase.messaging();

// 백그라운드 메시지 수신
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: '/icon-192.png',
  });
});
```

### 포그라운드 알림 처리

```typescript
// _app.tsx 또는 layout.tsx
useEffect(() => {
  initializeFcm();

  onForegroundMessage((payload) => {
    const { title, body } = payload.notification;

    // 인앱 토스트 알림
    showToast({
      title,
      description: body,
      onClick: () => handleNotificationClick(payload.data),
    });

    // 안 읽은 알림 수 갱신
    refreshUnreadCount();
  });
}, []);
```

### 알림 센터 UI

```typescript
function NotificationCenter() {
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam }) =>
      api.get('/v1/api/notification', {
        params: { cursor: pageParam, size: 20 },
      }),
    getNextPageParam: (lastPage) => lastPage.data.data.nextCursor,
  });

  return (
    <div>
      <Header>
        <h1>알림</h1>
        <Button onClick={markAllAsRead}>전체 읽음</Button>
      </Header>

      {data?.pages.flatMap(p => p.data.data.content).map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClick={() => handleClick(notification)}
        />
      ))}

      {hasNextPage && <LoadMoreButton onClick={fetchNextPage} />}
    </div>
  );
}
```

### 알림 타입별 이동 경로

```typescript
function handleNotificationClick(notification: NotificationResponse) {
  // 읽음 처리
  api.patch(`/v1/api/notification/${notification.id}/read`);

  // 타입별 라우팅
  switch (notification.type) {
    case 'NEW_TICKET':
      router.push(`/ticket/${notification.referenceId}`);
      break;
    case 'PROPOSAL_RECEIVED':
      router.push(`/ticket/${notification.referenceId}/proposals`);
      break;
    case 'TICKET_MATCHED_CLIENT':
    case 'TICKET_MATCHED_EXPERT':
      // 채팅으로 이동 (referenceId가 ticketId)
      router.push(`/chat`); // 또는 해당 채팅방으로 직접 이동
      break;
    case 'DELIVERY_SUBMITTED':
    case 'DELIVERY_RESUBMITTED':
      router.push(`/delivery/ticket/${notification.referenceId}`);
      break;
    case 'DELIVERY_APPROVED':
    case 'DELIVERY_AUTO_APPROVED':
      router.push(`/ticket/${notification.referenceId}`);
      break;
    case 'REVISION_REQUESTED':
      router.push(`/delivery/ticket/${notification.referenceId}`);
      break;
    case 'REVIEW_PUBLISHED':
      router.push(`/review/${notification.referenceId}`);
      break;
    case 'EXPERT_REPLY':
      router.push(`/review/${notification.referenceId}`);
      break;
    case 'CHAT_REMINDER':
      router.push('/chat');
      break;
    case 'COUPON_EXPIRING':
      router.push('/coupon/balance');
      break;
    case 'ESCROW_PAYMENT_COMPLETED':
    case 'ESCROW_SETTLED':
      router.push(`/ticket/${notification.referenceId}`);
      break;
    default:
      router.push('/notification');
  }
}
```

### 안 읽은 알림 뱃지

```typescript
// 헤더의 알림 아이콘에 뱃지 표시
function NotificationBell() {
  const { data } = useQuery({
    queryKey: ['unread-count'],
    queryFn: () => api.get('/v1/api/notification/unread-count'),
    refetchInterval: 30000, // 30초마다 갱신
  });

  const count = data?.data?.data?.count ?? 0;

  return (
    <button onClick={() => router.push('/notification')}>
      <BellIcon />
      {count > 0 && <Badge>{count > 99 ? '99+' : count}</Badge>}
    </button>
  );
}
```

### 알림 수신 설정

```typescript
// 마이페이지 > 설정에서
async function toggleNotification(enabled: boolean) {
  await api.patch('/v1/api/user/notification', {
    notificationEnabled: enabled,
  });
  showToast(enabled ? '알림이 켜졌습니다' : '알림이 꺼졌습니다');
}
```

### 로그아웃 시 FCM 토큰 정리

```typescript
async function logout() {
  // 1. FCM 토큰 삭제 (서버)
  const token = await getToken(messaging);
  if (token) {
    await api.delete('/v1/api/user/fcm-token', {
      data: { fcmToken: token },
    });
  }

  // 2. JWT 쿠키/토큰 정리
  clearAuthTokens();

  // 3. 로그인 페이지로 이동
  router.push('/auth/login');
}
```

### NotificationType 메시지 목록

| 타입 | 제목 | 메시지 |
|------|------|--------|
| `NEW_TICKET` | 새로운 의뢰 | 새로운 [%s] 의뢰가 올라왔어요! |
| `PROPOSAL_RECEIVED` | 새 제안서 도착 | %s 전문가가 제안서를 보냈어요. |
| `TICKET_MATCHED_CLIENT` | 매칭 완료 | 전문가와 매칭되었어요! 채팅에서 대화를 시작하세요. |
| `TICKET_MATCHED_EXPERT` | 제안 채택 | 제안이 채택되었어요! 채팅에서 대화를 시작하세요. |
| `DELIVERY_SUBMITTED` | 작업물 전달 | 전문가가 작업물을 전달했어요. 확인해주세요! |
| `DELIVERY_APPROVED` | 작업물 승인 | 의뢰인이 작업물을 승인했어요! |
| `REVISION_REQUESTED` | 수정 요청 | 의뢰인이 수정을 요청했어요. |
| `DELIVERY_RESUBMITTED` | 수정 작업물 | 전문가가 수정된 작업물을 전달했어요. |
| `TICKET_AUTO_COMPLETED` | 자동 완료 | 48시간 경과로 거래가 자동 완료되었습니다. |
| `DELIVERY_AUTO_APPROVED` | 자동 승인 | 24시간 경과로 작업물이 자동 승인되었습니다. |
| `DELIVERY_APPROVE_REMINDER` | 승인 확인 | 작업물이 4시간 뒤 자동 승인됩니다. 확인해주세요! |
| `TICKET_CANCELLED` | 의뢰 취소 | %s 의뢰가 취소되었어요. |
| `TICKET_EXPIRED` | 의뢰 만료 | %s 의뢰 모집이 마감되었어요. |
| `REVIEW_PUBLISHED` | 리뷰 공개 | 리뷰가 공개되었어요. |
| `EXPERT_REPLY` | 전문가 답변 | 전문가가 리뷰에 답변을 남겼어요. |
| `CHAT_REMINDER` | 대화 리마인더 | 24시간 동안 대화가 없어요. |
| `COUPON_EXPIRING` | 쿠폰 만료 임박 | 쿠폰 N장이 7일 이내에 만료됩니다. |
| `ESCROW_PAYMENT_COMPLETED` | 결제 완료 | 에스크로 결제가 완료되었습니다. |
| `ESCROW_SETTLED` | 정산 완료 | 정산이 완료되었습니다. |
