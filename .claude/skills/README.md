# 원포인트 NextJS 프론트엔드 Skills

백엔드 API 기획서를 기반으로 프론트엔드 개발자가 NextJS에서 참고할 수 있도록 정리한 도메인별 가이드.

## Skills 목록

| Skill | 도메인 | 핵심 기능 |
|-------|--------|-----------|
| [auth-user](./auth-user/SKILL.md) | Auth + User | 회원가입, 로그인, JWT, 내 정보, 전문가 등록/프로필, FCM 토큰 |
| [ticket](./ticket/SKILL.md) | Ticket + Proposal + Agreement | 의뢰 등록, 피드, 제안서 비교/수락, 합의서, 직접 의뢰 |
| [coupon](./coupon/SKILL.md) | Coupon | 쿠폰 구매 (PortOne V2), 잔여 확인, 웰컴/이벤트 쿠폰 |
| [chat](./chat/SKILL.md) | Chat | 채팅방 목록, 메시지 송수신, 시스템 메시지 |
| [delivery](./delivery/SKILL.md) | Delivery | 작업물 전달/승인/수정 요청 (온라인 전용) |
| [review](./review/SKILL.md) | Review | 채팅 기반 리뷰, 비공개 필터링, 별점, 전문가 답변 |
| [payment](./payment/SKILL.md) | Payment | 에스크로 결제 (PortOne V2, 온라인 전용) |
| [notification](./notification/SKILL.md) | Notification | FCM 푸시, 알림 센터, 읽음 처리 |

## 공통 사항

### API 기본 정보

- **Base URL**: `/v1/api/`
- **인증**: JWT (HttpOnly Cookie 또는 Authorization Bearer 헤더)
- **응답 포맷**: 모든 응답은 `SuccessResponse<T>` 래퍼

```typescript
interface SuccessResponse<T> {
  success: boolean;
  message: string;
  data: T;         // 성공 시 데이터, 실패 시 에러 코드 (number)
}
```

### 에러 처리

```typescript
// 에러 응답 예시
{
  "success": false,
  "message": "사용 가능한 쿠폰이 부족합니다.",
  "data": 40002    // ErrorResponseCode
}

// Axios interceptor 예시
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const { data } = error.response;
    if (!data.success) {
      const errorCode = data.data as number;
      // errorCode로 분기 처리
    }
    return Promise.reject(error);
  }
);
```

### 커서 기반 페이지네이션

대부분의 목록 API는 커서 기반 페이지네이션 사용:

```typescript
interface CursorPageResponse<T> {
  content: T[];
  nextCursor: number | string | null;
  hasNext: boolean;
}

// 사용: ?cursor={nextCursor}&size=20
// 첫 페이지: cursor 파라미터 생략
// 다음 페이지: 이전 응답의 nextCursor 사용
// 마지막 페이지: hasNext === false
```

### 전체 워크플로 (프론트 관점)

```
1. 회원가입/로그인 → JWT 토큰 획득 → FCM 토큰 등록
2. (의뢰인) 쿠폰 구매 → 티켓 등록 (쿠폰 RESERVED)
3. (전문가) 피드 탐색 → 제안서 발송
4. (의뢰인) 제안서 비교 → 수락 (매칭 확정, 쿠폰 CONSUMED)
5. 채팅 오픈 → 일정/조건 협의
6. [온라인] 합의서 제안 → 확정 → 에스크로 결제 → 서비스 진행
   [오프라인] 바로 서비스 진행 (당사자 직접 결제)
7. [온라인] 작업물 전달 → 의뢰인 승인 → 에스크로 정산
   [오프라인] 완료 확인 (48시간 자동)
8. 리뷰 자동 생성 → 필터링 (48시간) → 별점 → 공개
```

### 카테고리 (대분류/중분류)

```
GET /v1/api/category          # 전체 카테고리 조회

스포츠 → 골프, 테니스, 피트니스, 수영, 필라테스, 요가, 복싱, 볼링
음악 → 기타, 피아노, 보컬, 작곡, 드럼
라이프스타일 → 타로/운세, 사진/영상, 커리어/취업, 요리, 반려동물
크리에이티브 → 그림, 공예, 뜨개질
```
