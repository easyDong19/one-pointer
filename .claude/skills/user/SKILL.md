---
name: user
description: 사용자(User) 도메인 기획. 의뢰인/전문가 사용자 모델, 회원가입, 전문가 등록/프로필, 등급/혜택 등. 회원가입 폼, 마이페이지, 전문가 프로필 화면, 설정 화면 등 User 관련 프론트엔드 작업 시 참고. /user 로 호출.
---

# User 도메인 (프론트엔드)

하나의 계정으로 의뢰인/전문가 역할 전환이 가능한 사용자 도메인.

## Enum/상태값

```typescript
type UserRole = 'CLIENT' | 'EXPERT' | 'BOTH'
type UserStatus = 'ACTIVE' | 'DORMANT' | 'SUSPENDED' | 'WITHDRAWN'
type SocialLoginType = 'KAKAO' | 'NAVER' | 'GOOGLE' | 'APPLE'
type ExpertAuthStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
type ExpertGrade = 'EARLY_BIRD' | 'STANDARD' | 'PREMIUM'
type ActivityMethod = 'OFFLINE' | 'ONLINE' | 'BOTH'
type BenefitType = 'PROFILE_AD' | 'BUSINESS_AD' | 'EARLY_BIRD_BADGE' | 'FEE_DISCOUNT' | 'PRIORITY_LISTING'
type BenefitStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED'
type DeviceType = 'IOS' | 'ANDROID' | 'WEB'
```

### 상태 전이

```
UserRole:     CLIENT → BOTH (역할 추가 방식, 삭제 불가)
UserStatus:   ACTIVE → DORMANT (장기 미접속) / SUSPENDED (신고) / WITHDRAWN (탈퇴)
AuthStatus:   PENDING → APPROVED (승인) / REJECTED (반려 → 재신청 가능)
BenefitStatus: ACTIVE → EXPIRED (기간 만료) / REVOKED (관리자 회수)
```

## 데이터 모델

```typescript
interface User {
  id: number
  email: string           // 로그인 ID, 중복 불가
  name: string            // 실명
  nickname: string        // 서비스 내 표시명
  phone: string           // 본인인증 및 알림
  profileImageUrl?: string // 미설정 시 기본 이미지
  socialLoginType?: SocialLoginType
  role: UserRole          // 기본: CLIENT
  status: UserStatus      // 기본: ACTIVE
  marketingConsent: boolean // 기본: false
  notificationEnabled: boolean // 기본: true
  chatReviewAgreed: boolean
  chatReviewAgreedAt?: string
  region?: string         // 의뢰인 선호 지역 (시/구 단위)
  preferredMethod?: ActivityMethod
}

interface ExpertProfile {
  id: number
  identityVerified: boolean  // 기본: false
  businessRegistrationNumber?: string
  authStatus: ExpertAuthStatus  // 기본: PENDING
  grade: ExpertGrade           // 기본: STANDARD
  introduction: string         // 한 줄 소개 (최대 100자)
  detailIntroduction: string   // 상세 소개
  careerPeriod: string         // 예: "5년", "10년 이상"
  activityMethod: ActivityMethod
  bankName?: string            // 온라인 수주 시 필수
  accountNumber?: string
  accountHolder?: string
  certifications: ExpertCertification[]   // 최대 5개
  portfolios: ExpertPortfolio[]           // 최대 10개
  availableTimes: ExpertAvailableTime[]
  availableRegions: ExpertAvailableRegion[]
  benefits: ExpertBenefit[]
}

interface ExpertCertification {
  id: number
  name: string       // 예: "생활스포츠지도사 2급"
  issuer: string     // 예: "대한체육회"
  fileUrl: string    // 증빙 파일
}

interface ExpertPortfolio {
  id: number
  type: 'IMAGE' | 'VIDEO' | 'LINK'
  description?: string
  images: PortfolioImage[]  // 최대 7개, displayOrder ASC
}

interface PortfolioImage {
  id: number
  url: string
  displayOrder: number  // 1부터
}

interface ExpertAvailableTime {
  dayOfWeek: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'
  timeSlot: 'AM' | 'PM'
}

interface ExpertAvailableRegion {
  region: string  // 시/구 단위, 예: "서울 강남구"
}

interface ExpertBenefit {
  benefitType: BenefitType
  status: BenefitStatus
  startAt: string
  expireAt?: string  // null이면 영구
}
```

## API 엔드포인트

| Method | URL | 설명 | 인증 |
|--------|-----|------|------|
| POST | `/v1/api/user/signup` | 회원가입 | X |
| GET | `/v1/api/user/me` | 내 정보 조회 | JWT |
| POST | `/v1/api/user/expert` | 전문가 등록 | JWT |
| GET | `/v1/api/user/expert/{id}` | 전문가 프로필 상세 | JWT |
| POST | `/v1/api/user/expert/portfolios` | 포트폴리오 추가 | JWT |
| PUT | `/v1/api/user/expert/portfolios/{id}` | 포트폴리오 수정 | JWT |
| DELETE | `/v1/api/user/expert/portfolios/{id}` | 포트폴리오 삭제 | JWT |
| POST | `/v1/api/user/expert/certifications` | 자격증 추가 | JWT |
| PUT | `/v1/api/user/expert/certifications/{id}` | 자격증 수정 | JWT |
| DELETE | `/v1/api/user/expert/certifications/{id}` | 자격증 삭제 | JWT |
| PATCH | `/v1/api/user/notification` | 알림 수신 설정 변경 | JWT |
| PUT | `/v1/api/user/fcm-token` | FCM 토큰 등록/갱신 | JWT |
| DELETE | `/v1/api/user/fcm-token` | FCM 토큰 삭제 (로그아웃) | JWT |

### 응답 포맷

```typescript
// 모든 API 공통
interface SuccessResponse<T> {
  success: boolean
  message: string
  data: T          // 성공 시 데이터, 에러 시 에러 코드 문자열
}
```

## 회원가입 동의 항목

| # | 항목 | 필수 | 저장 필드 |
|---|------|:----:|-----------|
| 1 | 이용약관 동의 | ✅ | — |
| 2 | 개인정보 수집 및 이용 동의 | ✅ | — |
| 3 | 채팅 내역 리뷰 활용 동의 | ✅ | `chatReviewAgreed` |
| 4 | 알림 수신 동의 | ⬜ | `notificationEnabled` (기본: true) |
| 5 | 마케팅 수신 동의 | ⬜ | `marketingConsent` |

## 전문가 등록 플로우

```
가입 → 전문가 등록 신청
  ├─ 기본 정보 (프로필, 전문 분야 최대 3개)
  ├─ 본인인증 (휴대폰)
  ├─ (선택) 자격증/증빙 업로드
  ├─ (온라인 수주 시) 정산 계좌 등록
  ▼
관리자 심사 (초기 간소화 — 본인인증만)
  ├─ 승인 (APPROVED) → 전문가 활동 시작
  └─ 반려 (REJECTED) → 사유 안내 → 재신청 가능
```

## 전문가 등급 & 혜택

| 등급 | 조건 | EARLY_BIRD 혜택 |
|------|------|-----------------|
| `EARLY_BIRD` | 전문가 100명 미만 시 등록 | 프로필 광고 3개월 + 업장 광고 3개월 + 뱃지 영구 |
| `STANDARD` | 100명 이상 시 등록 | 없음 |
| `PREMIUM` | 추후 확장 (실적 기반) | — |

## UI 제약사항

- 자격증: 최대 **5개**
- 포트폴리오: 최대 **10개**, 이미지 최대 **7개**/포트폴리오
- 전문 분야(카테고리): 최대 **3개**
- 한 줄 소개: 최대 **100자**
- 프로필 이미지 미설정 시 **기본 이미지** 표시
- 알림 비활성화 시 FCM 푸시 전송 skip

## 악용 방지 (프론트 UX 고려사항)

| 위험 | 대응 |
|------|------|
| 중복 계정 | 이메일 + 휴대폰 중복 검사, 본인인증 |
| 허위 전문가 | 관리자 심사, 자격증 증빙 업로드 |
| 허위 프로필/이미지 | 신고 시스템 |
| 탈퇴 후 재가입 악용 | 탈퇴 후 일정 기간 재가입 제한 |

## 알림

| 이벤트 | 수신자 | 메시지 |
|--------|--------|--------|
| 가입 완료 | 의뢰인 | "가입을 환영해요! 무료 쿠폰 1장을 드렸어요" |
| 전문가 승인 | 전문가 | "전문가 인증이 완료되었어요! 제안서를 보내보세요." |
| 전문가 반려 | 전문가 | "전문가 인증이 반려되었어요. 사유를 확인해주세요." |

## 기능 체크리스트

### 공통
- [ ] 회원가입 / 로그인 (이메일 + 소셜)
- [ ] 본인인증 (휴대폰)
- [ ] 프로필 관리
- [ ] 알림 수신 설정 (ON/OFF 토글)
- [ ] 채팅
- [ ] 신고

### 의뢰인
- [ ] 쿠폰 구매 / 잔여 확인 / 사용 내역
- [ ] 전문가 검색 / 프로필 열람 / 찜하기
- [ ] 티켓(의뢰) 작성
- [ ] 제안서 비교 / 매칭 확정
- [ ] (온라인) 에스크로 결제
- [ ] (온라인/오프라인) 완료 확인
- [ ] 리뷰 작성 (별점)

### 전문가
- [ ] 전문가 등록 (프로필, 자격증, 포트폴리오)
- [ ] 가능 시간 / 지역 설정
- [ ] 티켓 피드 탐색 / 제안서 발송
- [ ] 제안서 템플릿 저장
- [ ] (온라인) 결과물/서비스 전달
- [ ] 리뷰 답변
- [ ] 내 통계 (매칭률, 평점, 뱃지)
