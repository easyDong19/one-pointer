---
name: user
description: 사용자(User) 도메인 프론트엔드 구현 가이드. 의뢰인/전문가 사용자 모델, ExpertProfile, 회원가입, 전문가 등록, FCM 토큰 관리 등 User 도메인 관련 프론트엔드 작업 시 사용. /user 로 호출하거나 사용자·전문가 프로필 UI를 다룰 때 참고한다.
---

# User 도메인

사용자(의뢰인/전문가) 도메인. 하나의 계정으로 의뢰인/전문가 역할 전환이 가능하며, 전문가는 별도 ExpertProfile을 가진다.

## 사용자 분류

| 구분 | 설명 |
|------|------|
| **의뢰인 (Client)** | 쿠폰을 구매하고 티켓(의뢰)을 등록하여 전문가를 찾는 사용자 |
| **전문가 (Expert)** | 티켓을 탐색하고 제안서를 보내 매칭되는 전문가 |

> 하나의 계정으로 역할 추가 방식 전환 (CLIENT → BOTH)

## 데이터 관계

```
User (1) ──── (1) ExpertProfile
  │                   ├── (N) ExpertBenefit
  │                   ├── (N) ExpertCertification (최대 5개)
  │                   ├── (N) ExpertPortfolio (최대 10개)
  │                   │          └── (N) PortfolioImage (최대 7개)
  │                   ├── (N) ExpertAvailableTime
  │                   ├── (N) ExpertAvailableRegion
  │                   └── (N) ExpertCategory → SubCategory.id (Long)
  │
  └── (N) UserFcmToken (기기별 푸시 토큰)
```

## 데이터 상세

- **[user-data.md](references/user-data.md)** — User 엔티티, 의뢰인 전용 필드, ExpertProfile 및 하위 엔티티 필드 상세

## Enum 정의

| Enum | 값 | 프론트엔드 용도 |
|------|-----|--------------|
| `UserRole` | `CLIENT`, `EXPERT`, `BOTH`, `ADMIN` | 역할 기반 UI 분기 |
| `UserStatus` | `ACTIVE`, `DORMANT`, `SUSPENDED`, `WITHDRAWN` | 계정 상태 표시 |
| `SocialLoginType` | `KAKAO`, `NAVER`, `GOOGLE`, `APPLE` | 소셜 로그인 UI |
| `ExpertAuthStatus` | `PENDING`, `APPROVED`, `REJECTED` | 전문가 인증 상태 |
| `ExpertGrade` | `EARLY_BIRD`, `STANDARD`, `PREMIUM` | 등급 뱃지 표시 |
| `BenefitType` | `PROFILE_AD`, `BUSINESS_AD`, `EARLY_BIRD_BADGE`, `FEE_DISCOUNT`, `PRIORITY_LISTING` | 혜택 UI |
| `ActivityMethod` | `OFFLINE`, `ONLINE`, `BOTH` | 활동 방식 필터 |
| `DeviceType` | `IOS`, `ANDROID`, `WEB` | FCM 토큰 등록 |

## API 엔드포인트

### UserController (`/v1/api/user`)

| Method | URL | 설명 | 인증 |
|--------|-----|------|------|
| GET | `/v1/api/user/me` | 내 정보 조회 | JWT |
| PUT | `/v1/api/user/me` | 내 프로필 수정 | JWT |
| GET | `/v1/api/user/expert/exists` | 전문가 프로필 등록 여부 확인 | JWT |
| POST | `/v1/api/user/expert` | 전문가 등록 | JWT |
| GET | `/v1/api/user/client/dashboard` | 의뢰인 대시보드 조회 | JWT |
| GET | `/v1/api/user/expert/dashboard` | 전문가 대시보드 조회 | JWT |
| GET | `/v1/api/user/expert/me` | 내 전문가 프로필 조회 | JWT |
| GET | `/v1/api/user/expert/earnings` | 수익 요약 조회 | JWT |
| GET | `/v1/api/user/expert/earnings/transactions` | 거래 내역 조회 (커서 페이지네이션) | JWT |
| PUT | `/v1/api/user/expert` | 전문가 프로필 수정 | JWT |
| GET | `/v1/api/user/expert/{id}` | 전문가 프로필 상세 조회 | 불필요 |
| PUT | `/v1/api/user/expert/availability` | 가능 시간/지역 수정 | JWT |
| GET | `/v1/api/user/expert/portfolios/{portfolioId}` | 포트폴리오 상세 조회 | 불필요 |
| POST | `/v1/api/user/expert/portfolios` | 포트폴리오 추가 | JWT |
| PUT | `/v1/api/user/expert/portfolios/{portfolioId}` | 포트폴리오 수정 | JWT |
| DELETE | `/v1/api/user/expert/portfolios/{portfolioId}` | 포트폴리오 삭제 | JWT |
| POST | `/v1/api/user/expert/certifications` | 자격증 추가 | JWT |
| PUT | `/v1/api/user/expert/certifications/{certificationId}` | 자격증 수정 | JWT |
| DELETE | `/v1/api/user/expert/certifications/{certificationId}` | 자격증 삭제 | JWT |
| PUT | `/v1/api/user/expert/bank-account` | 정산 계좌 등록/수정 | JWT |
| PATCH | `/v1/api/user/notification` | 알림 수신 설정 변경 | JWT |
| PUT | `/v1/api/user/fcm-token` | FCM 디바이스 토큰 등록/갱신 | JWT |
| DELETE | `/v1/api/user/fcm-token` | FCM 디바이스 토큰 삭제 (로그아웃) | JWT |

### ExpertController (`/v1/api/expert`)

| Method | URL | 설명 | 인증 |
|--------|-----|------|------|
| GET | `/v1/api/expert/popular` | 인기 전문가 조회 | 불필요 |
| GET | `/v1/api/expert/popular/subcategory/{subCategoryId}` | 중분류별 인기 전문가 조회 | 불필요 |
| GET | `/v1/api/expert` | 전문가 리스트 조회 (검색/필터) | 불필요 |
| GET | `/v1/api/expert/{expertProfileId}` | 전문가 상세 조회 | 불필요 |

## 인증 & 역할 기반 접근

JWT HttpOnly Cookie 기반 인증. 401 응답 시 refresh 시도 후 실패하면 auth store를 `unauthenticated`로 전환하여 `/login?next=` 리다이렉트.

| 역할 | 설명 | UI 분기 |
|------|------|---------|
| `CLIENT` | 의뢰인 전용 | 의뢰인 대시보드, 쿠폰 구매, 티켓 등록 |
| `EXPERT` | 전문가 전용 | 전문가 대시보드, 티켓 피드, 제안서 발송 |
| `BOTH` | 의뢰인+전문가 | 역할 전환 UI, 양쪽 메뉴 모두 접근 |
| `ADMIN` | 관리자 | 관리자 전용 페이지 |

## 비즈니스 규칙 (프론트엔드 관련)

| 규칙 | 제한 | 프론트 처리 |
|------|------|------------|
| 자격증 | 최대 5개 | 5개 도달 시 추가 버튼 비활성화 |
| 포트폴리오 | 최대 10개 | 10개 도달 시 추가 버튼 비활성화 |
| 포트폴리오 이미지 | 최대 7개/포트폴리오 | 이미지 추가 제한 |
| 전문가 카테고리 | 최대 3개 | 3개 선택 시 추가 비활성화 |
| 역할 전환 | CLIENT → BOTH (추가만 가능) | 전문가 등록 시 역할 자동 전환 |
| 정산 계좌 | 온라인 의뢰 수주 시 필수 | 계좌 미등록 시 온라인 의뢰 수락 차단 안내 |

## 전문가 인증 프로세스

```
가입 → 전문가 등록 신청
          ├─ 기본 정보 입력 (프로필, 전문 분야)
          ├─ 본인인증 (휴대폰)
          ├─ (선택) 자격증 등록 (자격증명, 발급기관)
          ├─ (온라인 의뢰 수주 시) 정산 계좌 등록
          ▼
     즉시 APPROVED (관리자 심사 없음)
          → 전문가 활동 바로 시작
```

## 전문가 등급 & 혜택

### 등급 분류

| 등급 | 조건 | 설명 |
|------|------|------|
| `EARLY_BIRD` | 전문가 100명 미만일 때 등록 | 초기 전문가 우대 등급 |
| `STANDARD` | 일반 등록 | 기본 등급 |
| `PREMIUM` | 추후 확장 (실적 기반) | 프리미엄 등급 |

### 혜택 유형

| 혜택 | 설명 | EARLY_BIRD 기본 제공 |
|------|------|---------------------|
| `PROFILE_AD` | 프로필 광고 (메인 노출) | 3개월 |
| `BUSINESS_AD` | 업장/서비스 광고 | 3개월 |
| `EARLY_BIRD_BADGE` | 얼리버드 뱃지 | 영구 |

## 회원가입 동의 항목

| # | 항목 | 필수 | 저장 필드 |
|---|------|------|-----------|
| 1 | 이용약관 동의 | 필수 | — |
| 2 | 개인정보 수집 및 이용 동의 | 필수 | — |
| 3 | 채팅 내역 리뷰 활용 동의 | 필수 | `chatReviewAgreed` |
| 4 | 알림 수신 동의 | 선택 | `notificationEnabled` (기본값: true) |
| 5 | 마케팅 수신 동의 | 선택 | `marketingConsent` |

## 프론트엔드 구현 가이드

### FSD 파일 구조

```
src/
├── entities/user/
│   ├── api/
│   │   ├── user.schema.ts          # zod v4 스키마 (Enum, 요청, 응답)
│   │   └── user.service.ts         # Service Layer (clientFetch + zod 검증)
│   └── model/
│       └── user.query-keys.ts      # TanStack Query 키 팩토리
│
├── features/
│   ├── auth/
│   │   ├── me/model/               # useMyProfileQuery
│   │   └── sign-in/model/          # useLoginMutation
│   ├── user/
│   │   ├── profile/                # 프로필 수정
│   │   └── dashboard/              # 대시보드
│   └── expert/
│       ├── register/               # 전문가 등록
│       ├── profile/                # 전문가 프로필 수정
│       ├── portfolio/              # 포트폴리오 CRUD
│       ├── certification/          # 자격증 CRUD
│       └── earnings/               # 수익/거래 내역
```

### Service Layer

| 함수 | HTTP | 설명 |
|------|------|------|
| `updateMyProfile(input)` | PUT `/v1/api/user/me` | 내 프로필 수정 |
| `updateFcmToken(input)` | PUT `/v1/api/user/fcm-token` | FCM 토큰 등록/갱신 |
| `deleteFcmToken(input)` | DELETE `/v1/api/user/fcm-token` | FCM 토큰 삭제 |
| `registerExpert(input)` | POST `/v1/api/user/expert` | 전문가 등록 |
| `updateExpertProfile(input)` | PUT `/v1/api/user/expert` | 전문가 프로필 수정 |
| `getExpertProfile(id)` | GET `/v1/api/user/expert/{id}` | 전문가 프로필 조회 |
| `getMyExpertProfile()` | GET `/v1/api/user/expert/me` | 내 전문가 프로필 |
| `checkExpertProfileExists()` | GET `/v1/api/user/expert/exists` | 전문가 등록 여부 |
| `getExpertEarnings()` | GET `/v1/api/user/expert/earnings` | 수익 요약 |
| `getExpertTransactions(params?)` | GET `.../earnings/transactions` | 거래 내역 (커서) |
| `getExpertDashboard()` | GET `/v1/api/user/expert/dashboard` | 전문가 대시보드 |
| `getClientDashboard()` | GET `/v1/api/user/client/dashboard` | 의뢰인 대시보드 |
| `addPortfolio(input)` | POST `.../portfolios` | 포트폴리오 추가 |
| `updatePortfolio(id, input)` | PUT `.../portfolios/{id}` | 포트폴리오 수정 |
| `deletePortfolio(id)` | DELETE `.../portfolios/{id}` | 포트폴리오 삭제 |
| `addCertification(input)` | POST `.../certifications` | 자격증 추가 |
| `updateCertification(id, input)` | PUT `.../certifications/{id}` | 자격증 수정 |
| `deleteCertification(id)` | DELETE `.../certifications/{id}` | 자격증 삭제 |
| `updateBankAccount(input)` | PUT `.../bank-account` | 정산 계좌 수정 |
| `updateAvailability(input)` | PUT `.../availability` | 가능 시간/지역 수정 |
| `updateNotificationSetting(input)` | PATCH `/v1/api/user/notification` | 알림 설정 |

### Query Keys

```typescript
export const userQueryKeys = {
  all: ["user"] as const,
  me: ["user", "me"] as const,
  expertProfile: (id: number) => ["user", "expert", id] as const,
  myExpertProfile: ["user", "expert", "me"] as const,
  expertExists: ["user", "expert", "exists"] as const,
  expertEarnings: ["user", "expert", "earnings"] as const,
  expertTransactions: (params?: { cursor?: string; size?: number }) =>
    ["user", "expert", "transactions", params] as const,
  expertDashboard: ["user", "expert", "dashboard"] as const,
  clientDashboard: ["user", "client", "dashboard"] as const,
}
```

### 캐시 무효화 전략

| 이벤트 | 무효화 대상 |
|---|---|
| 프로필 수정 | `userQueryKeys.me` |
| 전문가 등록 | `userQueryKeys.me`, `userQueryKeys.expertExists`, `userQueryKeys.myExpertProfile` |
| 전문가 프로필 수정 | `userQueryKeys.myExpertProfile` |
| 포트폴리오/자격증 CRUD | `userQueryKeys.myExpertProfile` |
| 계좌/가용성 수정 | `userQueryKeys.myExpertProfile` |
| 알림 설정 변경 | `userQueryKeys.me` |

## 기능 체크리스트

### 공통
- [x] 회원가입 / 로그인 (이메일 + 소셜)
- [ ] 본인인증 (휴대폰)
- [x] 프로필 관리
- [x] 알림 수신 설정 (ON/OFF 토글)
- [x] 채팅
- [ ] 신고

### 의뢰인
- [x] 쿠폰 구매 / 잔여 확인 / 사용 내역
- [ ] 전문가 검색 / 프로필 열람 / 찜하기
- [x] 티켓(의뢰) 작성
- [x] 제안서 비교 / 매칭 확정
- [ ] (온라인) 에스크로 결제
- [x] (오프라인) 완료 확인
- [x] 리뷰 작성

### 전문가
- [x] 전문가 등록 (프로필, 자격증)
- [x] 가능 시간 / 지역 설정
- [x] 티켓 피드 탐색 / 제안서 발송
- [x] (온라인) 결과물/서비스 전달
- [x] 리뷰 답변

## 알림

| 이벤트 | 수신자 | 메시지 |
|--------|--------|--------|
| 가입 완료 | 의뢰인 | "가입을 환영해요! 무료 쿠폰 1장을 드렸어요" |
| 전문가 승인 | 전문가 | "전문가 인증이 완료되었어요! 제안서를 보내보세요." |
| 전문가 반려 | 전문가 | "전문가 인증이 반려되었어요. 사유를 확인해주세요." |
