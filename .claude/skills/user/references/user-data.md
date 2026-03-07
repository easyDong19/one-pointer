# User 도메인 데이터 상세

## 목차
1. [User 엔티티 — 공통 데이터](#1-user-엔티티--공통-데이터)
2. [User 엔티티 — 의뢰인 전용 필드](#2-user-엔티티--의뢰인-전용-필드)
3. [ExpertProfile 엔티티](#3-expertprofile-엔티티)
4. [ExpertCertification 엔티티](#4-expertcertification-엔티티)
5. [ExpertPortfolio 엔티티](#5-expertportfolio-엔티티)
6. [ExpertAvailableTime 엔티티](#6-expertavailabletime-엔티티)
7. [ExpertAvailableRegion 엔티티](#7-expertavailableregion-엔티티)

---

## 1. User 엔티티 — 공통 데이터

엔티티: `one_pointer.domain.user.entity.User`
테이블: `users` (인덱스: `idx_user_email` on email)

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `user_id` | Long (PK, IDENTITY) | 자동 | 사용자 고유 식별자 |
| `email` | `email` | String (unique) | ✅ | 로그인 ID |
| `password` | `password` | String | ⬜ | 암호화된 비밀번호. 소셜 로그인 시 null |
| `name` | `name` | String | ✅ | 실명 (본인인증용) |
| `nickname` | `nickname` | String | ✅ | 서비스 내 표시명 |
| `profileImageUrl` | `profile_image_url` | String | ⬜ | 프로필 이미지 URL |
| `socialLoginType` | `social_login_type` | `SocialLoginType` | ⬜ | 소셜 로그인 유형 — KAKAO / NAVER / GOOGLE / APPLE |
| `socialId` | `social_id` | String | ⬜ | 소셜 로그인 사용자 고유 ID |
| `role` | `role` | `UserRole` | ✅ | 사용자 역할 — CLIENT / EXPERT / BOTH (기본값: CLIENT) |
| `marketingConsent` | `marketing_consent` | Boolean | ⬜ | 마케팅 수신 동의 여부 (기본값: false) |
| `status` | `status` | `UserStatus` | 자동 | 계정 상태 — ACTIVE / DORMANT / SUSPENDED / WITHDRAWN (기본값: ACTIVE) |
| `notificationEnabled` | `notification_enabled` | Boolean | ✅ | 알림(푸시) 수신 허용 여부 (기본값: true) |
| `chatReviewAgreed` | `chat_review_agreed` | Boolean | ✅ | 채팅 내역 리뷰 활용 동의 여부 |
| `chatReviewAgreedAt` | `chat_review_agreed_at` | LocalDateTime | ⬜ | 채팅 리뷰 동의 시점 |
| `createDateTime` | `create_date_time` | LocalDateTime | 자동 | 가입일시 (BaseTimeEntity) |
| `modifiedDateTime` | `modified_date_time` | LocalDateTime | 자동 | 수정일시 (BaseTimeEntity) |

비즈니스 메서드:
- `upgradeToExpert()` — role을 BOTH로 변경
- `updateNotificationEnabled(Boolean enabled)` — 알림 수신 설정 변경
- `updateProfile(nickname, profileImageUrl, region, preferredMethod)` — 프로필 수정

---

## 2. User 엔티티 — 의뢰인 전용 필드

User 엔티티 내에 포함된 의뢰인 전용 경량 필드.

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `region` | `region` | String | ⬜ | 오프라인 의뢰 시 선호 지역 (시/구 단위) |
| `preferredMethod` | `preferred_method` | `ActivityMethod` | ⬜ | 선호 의뢰 방식 — OFFLINE / ONLINE / BOTH |

> 관심 카테고리는 별도 매핑 테이블로 추가 가능 (category skill 참고)

---

## 3. ExpertProfile 엔티티

엔티티: `one_pointer.domain.user.entity.ExpertProfile`
테이블: `expert_profile`
관계: User와 OneToOne (LAZY, user_id FK unique)

### 인증 정보

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `expert_profile_id` | Long (PK, IDENTITY) | 자동 | 전문가 프로필 고유 식별자 |
| `user` | `user_id` (FK) | User | ✅ | 연결된 사용자 (OneToOne, LAZY) |
| `identityVerified` | `identity_verified` | Boolean | ✅ | 본인인증 완료 여부 (기본값: false) |
| `businessRegistrationNumber` | `business_registration_number` | String | ⬜ | 사업자등록번호 (사업자인 경우) |
| `authStatus` | `auth_status` | `ExpertAuthStatus` | 자동 | 전문가 인증 상태 — PENDING / APPROVED / REJECTED (기본값: PENDING) |

### 프로필 정보

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `introduction` | `introduction` | String(100) | ✅ | 한 줄 소개 (예: "골프 10년차, 스윙 교정 전문") |
| `detailIntroduction` | `detail_introduction` | Text (@Lob) | ✅ | 상세 소개 — 경력, 강점, 레슨 스타일 등 |
| `careerPeriod` | `career_period` | String | ✅ | 경력 기간 |
| `activityMethod` | `activity_method` | `ActivityMethod` | ✅ | 활동 가능 방식 — OFFLINE / ONLINE / BOTH |

### 정산 계좌

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `bankName` | `bank_name` | String | ⬜ | 은행명 |
| `accountNumber` | `account_number` | String | ⬜ | 계좌번호 |
| `accountHolder` | `account_holder` | String | ⬜ | 예금주 |

### 등급

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `grade` | `grade` | `ExpertGrade` | ✅ | 전문가 등급 — EARLY_BIRD / STANDARD / PREMIUM (기본값: STANDARD) |

### 연관 엔티티 (OneToMany, cascade ALL, orphanRemoval)

| 엔티티 | 필드명 | 설명 |
|--------|--------|------|
| `ExpertBenefit` | `benefits` | 혜택 목록 |
| `ExpertCertification` | `certifications` | 자격증/증빙 목록 (최대 5개) |
| `ExpertPortfolio` | `portfolios` | 포트폴리오 목록 (최대 10개) |
| `ExpertAvailableTime` | `availableTimes` | 활동 가능 시간 목록 |
| `ExpertAvailableRegion` | `availableRegions` | 활동 가능 지역 목록 |

> 전문 분야(카테고리)는 `ExpertCategory` 매핑 엔티티로 구현됨 (category skill 참고)
> 희망 단가는 제안서 도메인에서 관리 예정

---

## 4. ExpertCertification 엔티티

엔티티: `one_pointer.domain.user.entity.ExpertCertification`
테이블: `expert_certification`
관계: ExpertProfile과 ManyToOne (LAZY)

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `expert_certification_id` | Long (PK, IDENTITY) | 자동 | 고유 식별자 |
| `expertProfile` | `expert_profile_id` (FK) | ExpertProfile | ✅ | 소속 전문가 프로필 |
| `name` | `name` | String | ✅ | 자격증명 (예: "생활스포츠지도사 2급") |
| `issuer` | `issuer` | String | ✅ | 발급기관 (예: "대한체육회") |

> 전문가 1인당 최대 5개의 자격증을 등록할 수 있다.

---

## 5. ExpertPortfolio 엔티티

엔티티: `one_pointer.domain.user.entity.ExpertPortfolio`
테이블: `expert_portfolio`
관계: ExpertProfile과 ManyToOne (LAZY)

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `expert_portfolio_id` | Long (PK, IDENTITY) | 자동 | 고유 식별자 |
| `expertProfile` | `expert_profile_id` (FK) | ExpertProfile | ✅ | 소속 전문가 프로필 |
| `type` | `type` | String | ✅ | 포트폴리오 유형 — IMAGE / VIDEO / LINK |
| `description` | `description` | String | ⬜ | 포트폴리오 설명 |
| `images` | — (OneToMany) | List\<PortfolioImage\> | — | 포트폴리오 이미지 목록 (최대 7개, displayOrder ASC 정렬) |

> 전문가 1인당 최대 10개의 포트폴리오를 등록할 수 있으며, 하나의 포트폴리오에 최대 7개의 이미지를 등록할 수 있다.

---

## 5-1. PortfolioImage 엔티티

엔티티: `one_pointer.domain.user.entity.PortfolioImage`
테이블: `portfolio_image`
관계: ExpertPortfolio와 ManyToOne (LAZY)

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `portfolio_image_id` | Long (PK, IDENTITY) | 자동 | 고유 식별자 |
| `expertPortfolio` | `expert_portfolio_id` (FK) | ExpertPortfolio | ✅ | 소속 포트폴리오 |
| `url` | `url` | String | ✅ | 이미지 URL |
| `displayOrder` | `display_order` | Integer | ✅ | 표시 순서 (1부터 시작) |

---

## 6. ExpertAvailableTime 엔티티

엔티티: `one_pointer.domain.user.entity.ExpertAvailableTime`
테이블: `expert_available_time`
관계: ExpertProfile과 ManyToOne (LAZY)

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `expert_available_time_id` | Long (PK, IDENTITY) | 자동 | 고유 식별자 |
| `expertProfile` | `expert_profile_id` (FK) | ExpertProfile | ✅ | 소속 전문가 프로필 |
| `dayOfWeek` | `day_of_week` | String | ✅ | 요일 — MON / TUE / WED / THU / FRI / SAT / SUN |
| `timeSlot` | `time_slot` | String | ✅ | 시간대 — AM / PM |

---

## 7. ExpertAvailableRegion 엔티티

엔티티: `one_pointer.domain.user.entity.ExpertAvailableRegion`
테이블: `expert_available_region`
관계: ExpertProfile과 ManyToOne (LAZY)

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `expert_available_region_id` | Long (PK, IDENTITY) | 자동 | 고유 식별자 |
| `expertProfile` | `expert_profile_id` (FK) | ExpertProfile | ✅ | 소속 전문가 프로필 |
| `region` | `region` | String | ✅ | 활동 가능 지역 (시/구 단위, 예: "서울 강남구") |

---

## 8. ExpertBenefit 엔티티

엔티티: `one_pointer.domain.user.entity.ExpertBenefit`
테이블: `expert_benefit`
관계: ExpertProfile과 ManyToOne (LAZY)

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `expert_benefit_id` | Long (PK, IDENTITY) | 자동 | 고유 식별자 |
| `expertProfile` | `expert_profile_id` (FK) | ExpertProfile | ✅ | 소속 전문가 프로필 |
| `benefitType` | `benefit_type` | `BenefitType` | ✅ | 혜택 유형 — PROFILE_AD / BUSINESS_AD / EARLY_BIRD_BADGE / FEE_DISCOUNT / PRIORITY_LISTING |
| `status` | `status` | `BenefitStatus` | ✅ | 혜택 상태 — ACTIVE / EXPIRED / REVOKED (기본값: ACTIVE) |
| `grantedAt` | `granted_at` | LocalDateTime | ✅ | 혜택 부여 시점 |
| `startAt` | `start_at` | LocalDateTime | ✅ | 혜택 시작 시점 |
| `expireAt` | `expire_at` | LocalDateTime | ⬜ | 혜택 만료 시점 (null이면 영구) |
| `metadata` | `metadata` | String | ⬜ | 부가 데이터 (JSON 형식, 확장용) |

비즈니스 메서드: `expire()` — 상태를 EXPIRED로 변경, `revoke()` — 상태를 REVOKED로 변경, `isActive()` — ACTIVE 여부 확인

---

## 9. ExpertCategory 엔티티

엔티티: `one_pointer.domain.user.entity.ExpertCategory`
테이블: `expert_category`
관계: ExpertProfile과 ManyToOne (LAZY)

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `expert_category_id` | Long (PK, IDENTITY) | 자동 | 고유 식별자 |
| `expertProfile` | `expert_profile_id` (FK) | ExpertProfile | ✅ | 소속 전문가 프로필 |
| `subCategoryId` | `sub_category_id` | Long | ✅ | 카테고리 도메인의 중분류 ID 참조 (최대 3개) |

---

## 10. UserFcmToken 엔티티

엔티티: `one_pointer.domain.user.entity.UserFcmToken`
테이블: `user_fcm_token`
관계: User와 ManyToOne (LAZY)
제약조건: (user_id, device_id) 유니크, fcm_token 인덱스

| 필드명 | 컬럼명 | 타입 | 필수 | 설명 |
|--------|--------|------|------|------|
| `id` | `user_fcm_token_id` | Long (PK, IDENTITY) | 자동 | 고유 식별자 |
| `user` | `user_id` (FK) | User | ✅ | 소속 사용자 |
| `fcmToken` | `fcm_token` | String | ✅ | Firebase Cloud Messaging 토큰 |
| `deviceId` | `device_id` | String | ✅ | 기기 고유 식별자 |
| `deviceType` | `device_type` | `DeviceType` | ✅ | 기기 유형 — IOS / ANDROID / WEB |

비즈니스 메서드: `updateToken(fcmToken)` — FCM 토큰 갱신
