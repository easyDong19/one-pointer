---
name: fe-auth-user
description: 프론트엔드 인증(Auth) 및 사용자(User) 도메인 가이드. 회원가입, 로그인, JWT 관리, 내 정보, 전문가 등록/프로필, FCM 토큰 등 Auth·User 관련 프론트엔드 구현 시 참고한다.
---

# Auth & User 프론트엔드 가이드

## 개요

사용자 인증과 프로필 관리. 하나의 계정으로 의뢰인/전문가 역할 전환 가능.

## 사용자 역할

| 역할 | 값 | 설명 |
|------|-----|------|
| 의뢰인 | `CLIENT` | 티켓 등록, 제안서 비교, 매칭 |
| 전문가 | `EXPERT` | 제안서 발송, 레슨 진행 |
| 양쪽 | `BOTH` | 의뢰인 + 전문가 기능 모두 사용 |
| 관리자 | `ADMIN` | 관리자 페이지 접근 |

---

## TypeScript 타입 정의

```typescript
// ========== Enums ==========

type UserRole = 'CLIENT' | 'EXPERT' | 'BOTH' | 'ADMIN';
type UserStatus = 'ACTIVE' | 'DORMANT' | 'SUSPENDED' | 'WITHDRAWN';
type SocialLoginType = 'KAKAO' | 'NAVER' | 'GOOGLE' | 'APPLE';
type ExpertAuthStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type ExpertGrade = 'EARLY_BIRD' | 'STANDARD' | 'PREMIUM';
type ActivityMethod = 'OFFLINE' | 'ONLINE' | 'BOTH';
type DeviceType = 'IOS' | 'ANDROID' | 'WEB';
type BenefitType = 'PROFILE_AD' | 'BUSINESS_AD' | 'EARLY_BIRD_BADGE' | 'FEE_DISCOUNT' | 'PRIORITY_LISTING';
type BenefitStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED';

// ========== 공통 응답 래퍼 ==========

interface SuccessResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ========== Auth ==========

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    name: string;
    nickname: string;
    role: UserRole;
    status: UserStatus;
  };
}

interface UserSignupRequest {
  email: string;
  password: string;
  name: string;
  nickname: string;
  phone: string;
  marketingConsent: boolean;
  chatReviewAgreed: boolean; // 필수 true
}

interface LoginRequest {
  email: string;
  password: string;
}

// ========== User ==========

interface UserResponse {
  id: number;
  email: string;
  name: string;
  nickname: string;
  phone: string;
  profileImageUrl: string | null;
  role: UserRole;
  status: UserStatus;
}

// ========== Expert ==========

interface ExpertRegisterRequest {
  introduction: string;
  detailIntroduction: string;
  careerPeriod: string;
  activityMethod: ActivityMethod;
  certifications: CertificationInput[];
  portfolios: PortfolioInput[];
  availableTimes: AvailableTimeInput[];
  availableRegions: string[];
  subCategoryIds: number[];
  bankName?: string;       // 온라인 의뢰 수주 시 필수
  accountNumber?: string;
  accountHolder?: string;
}

interface CertificationInput {
  name: string;
  issuer: string;
  fileUrl: string;
}

interface PortfolioInput {
  type: string;
  imageUrls: string[];  // 최대 7장
  description: string;
}

interface AvailableTimeInput {
  dayOfWeek: string;     // MONDAY ~ SUNDAY
  timeSlot: string;      // "10:00-12:00"
}

interface ExpertProfileResponse {
  id: number;
  introduction: string;
  detailIntroduction: string;
  careerPeriod: string;
  activityMethod: ActivityMethod;
  authStatus: ExpertAuthStatus;
  grade: ExpertGrade;
  certifications: CertificationResponse[];
  portfolios: PortfolioResponse[];
  availableTimes: AvailableTimeResponse[];
  availableRegions: AvailableRegionResponse[];
  benefits: BenefitResponse[];
  categories: ExpertCategoryResponse[];
  averageRating: number | null;
  reviewCount: number;
  totalMatchCount: number;
  avgResponseTime: string | null;
}

interface CertificationResponse {
  id: number;
  name: string;
  issuer: string;
  fileUrl: string;
}

interface PortfolioResponse {
  id: number;
  type: string;
  description: string;
  images: PortfolioImageResponse[];
}

interface PortfolioImageResponse {
  id: number;
  imageUrl: string;
  displayOrder: number;
}

interface AvailableTimeResponse {
  id: number;
  dayOfWeek: string;
  timeSlot: string;
}

interface AvailableRegionResponse {
  id: number;
  region: string;
}

interface BenefitResponse {
  id: number;
  benefitType: BenefitType;
  status: BenefitStatus;
  startedAt: string;
  expiredAt: string | null;
}

interface ExpertCategoryResponse {
  id: number;
  subCategoryId: number;
  subCategoryName: string;
}

// ========== FCM ==========

interface UpdateFcmTokenRequest {
  fcmToken: string;
  deviceType: DeviceType;
}

interface DeleteFcmTokenRequest {
  fcmToken: string;
}

// ========== 알림 설정 ==========

interface UpdateNotificationRequest {
  notificationEnabled: boolean;
}

// ========== 정산 계좌 ==========

interface UpdateBankAccountRequest {
  bankCode: string;      // BankCode enum (예: "004" = KB국민)
  accountNumber: string;
  accountHolder: string;
}
```

---

## API 엔드포인트

### 인증 (Auth)

| Method | URL | 설명 | 인증 |
|--------|-----|------|------|
| POST | `/v1/api/auth/signup` | 회원가입 | X |
| POST | `/v1/api/auth/login` | 로그인 | X |

### 사용자 (User)

| Method | URL | 설명 | 인증 |
|--------|-----|------|------|
| GET | `/v1/api/user/me` | 내 정보 조회 | JWT |
| POST | `/v1/api/user/expert` | 전문가 등록 | JWT |
| PUT | `/v1/api/user/expert` | 전문가 프로필 수정 | JWT |
| GET | `/v1/api/user/expert/{id}` | 전문가 프로필 상세 조회 | JWT |
| POST | `/v1/api/user/expert/portfolios` | 포트폴리오 추가 | JWT |
| PUT | `/v1/api/user/expert/portfolios/{portfolioId}` | 포트폴리오 수정 | JWT |
| DELETE | `/v1/api/user/expert/portfolios/{portfolioId}` | 포트폴리오 삭제 | JWT |
| POST | `/v1/api/user/expert/certifications` | 자격증 추가 | JWT |
| PUT | `/v1/api/user/expert/certifications/{certificationId}` | 자격증 수정 | JWT |
| DELETE | `/v1/api/user/expert/certifications/{certificationId}` | 자격증 삭제 | JWT |
| PATCH | `/v1/api/user/notification` | 알림 수신 설정 변경 | JWT |
| PUT | `/v1/api/user/fcm-token` | FCM 토큰 등록/갱신 | JWT |
| DELETE | `/v1/api/user/fcm-token` | FCM 토큰 삭제 (로그아웃 시) | JWT |
| PUT | `/v1/api/user/expert/bank-account` | 정산 계좌 등록/수정 | JWT |

---

## 인증 흐름

### JWT 토큰 관리

```
로그인/회원가입 응답
├── Web: HttpOnly 쿠키 (access_token, refresh_token) 자동 설정
└── Mobile/SPA: 응답 body의 data.accessToken, data.refreshToken 사용
    → Authorization: Bearer {accessToken} 헤더로 전송
```

**중요**: 로그인/회원가입 시 응답에 `Set-Cookie`와 body 모두 토큰이 포함됨.
- **SSR/쿠키 방식**: 별도 토큰 저장 불필요 (쿠키 자동 전송)
- **CSR/SPA 방식**: `data.accessToken`을 메모리/스토리지에 저장 후 헤더 전송

### 회원가입 필수 동의 항목

| # | 항목 | 필수 | 설명 |
|---|------|------|------|
| 1 | 이용약관 동의 | O | 서버 미전송 (프론트 검증만) |
| 2 | 개인정보 수집 및 이용 동의 | O | 서버 미전송 (프론트 검증만) |
| 3 | 채팅 내역 리뷰 활용 동의 | O | `chatReviewAgreed: true` 필수 |
| 4 | 알림 수신 동의 | X | `notificationEnabled` (기본 true) |
| 5 | 마케팅 수신 동의 | X | `marketingConsent` |

---

## 에러 코드

| 코드 | 설명 | UI 처리 |
|------|------|---------|
| 40001 | 이메일 중복 | "이미 사용 중인 이메일입니다" |
| 40091 | 닉네임 중복 | "이미 사용 중인 닉네임입니다" |
| 40092 | 휴대폰 중복 | "이미 등록된 휴대폰 번호입니다" |
| 40402 | 이메일 없음 | "등록되지 않은 이메일입니다" |
| 40101 | 비밀번호 불일치 | "비밀번호가 일치하지 않습니다" |

---

## 프론트엔드 구현 가이드

### 페이지 구조 (추천)

```
/auth
├── /login                    # 로그인 페이지
├── /signup                   # 회원가입 페이지
│   └── 약관 동의 → 정보 입력 → 완료
└── /callback                 # 소셜 로그인 콜백

/mypage
├── /profile                  # 내 프로필 (의뢰인)
├── /expert                   # 전문가 프로필 관리
│   ├── /register             # 전문가 등록 신청
│   ├── /edit                 # 프로필 수정
│   ├── /portfolios           # 포트폴리오 관리
│   └── /certifications       # 자격증 관리
├── /settings                 # 설정 (알림, 계정)
└── /bank-account             # 정산 계좌 관리

/expert/{id}                  # 전문가 공개 프로필 (다른 사용자가 볼 때)
```

### 역할 기반 라우팅

```typescript
// middleware.ts 또는 레이아웃에서 역할 체크
const user = await getUser(); // GET /v1/api/user/me

// 전문가 전용 페이지 (EXPERT 또는 BOTH만 접근)
if (user.role === 'CLIENT') {
  redirect('/mypage/expert/register'); // 전문가 등록 유도
}

// 의뢰인 전용 페이지
// CLIENT, BOTH, ADMIN 모두 의뢰 가능
```

### 전문가 등록 흐름

```
1. 전문가 등록 폼 (다단계 추천)
   ├── Step 1: 기본 정보 (소개, 경력, 활동 방식)
   ├── Step 2: 전문 분야 선택 (카테고리)
   ├── Step 3: 자격증/포트폴리오 업로드 (선택)
   ├── Step 4: 가능 시간/지역 설정
   └── Step 5: 정산 계좌 (온라인 의뢰 수주 시 필수)

2. POST /v1/api/user/expert → authStatus: PENDING

3. 관리자 심사 결과 대기 (FCM 알림으로 통지)
   ├── APPROVED → 전문가 활동 시작
   └── REJECTED → 사유 안내 → 재신청 가능
```

### FCM 토큰 관리

```typescript
// 앱 시작 시 또는 로그인 직후
async function registerFcmToken() {
  const token = await getFcmToken(); // Firebase SDK
  await api.put('/v1/api/user/fcm-token', {
    fcmToken: token,
    deviceType: 'WEB' // 또는 'IOS', 'ANDROID'
  });
}

// 로그아웃 시
async function logout() {
  const token = getCurrentFcmToken();
  await api.delete('/v1/api/user/fcm-token', {
    data: { fcmToken: token }
  });
  // 이후 JWT 토큰/쿠키 클리어
}
```

### 전문가 등급 & 혜택 표시

| 등급 | 조건 | 뱃지 |
|------|------|------|
| `EARLY_BIRD` | 초기 100명 | 얼리버드 뱃지 (영구) |
| `STANDARD` | 일반 | 기본 |
| `PREMIUM` | 실적 기반 (추후) | 프리미엄 뱃지 |

- 전문가 프로필에 등급 뱃지 표시
- `benefits` 배열에서 `ACTIVE` 상태인 혜택 확인 → UI에 반영

### 이미지 업로드

전문가 프로필 이미지, 자격증 파일, 포트폴리오 이미지는 **S3 presigned URL** 방식 사용 (추정).
별도 이미지 업로드 API를 먼저 호출하여 URL을 받은 후, 해당 URL을 요청에 포함.

```
POST /v1/api/image/upload → { imageUrl: "https://s3..." }
→ 받은 URL을 자격증/포트폴리오 등록 시 fileUrl/imageUrls에 사용
```
