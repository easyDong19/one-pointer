# one-pointer (Web) Project Specification

> one-pointer-mobile (Flutter) subagent를 이 프로젝트에 맞게 수정하기 위한 참조 문서.

---

## 1. 런타임 & 패키지 매니저

| 항목 | 값 |
|------|-----|
| 패키지 매니저 | **pnpm** (lockfile v9.0) |
| Node 버전 | 별도 `.nvmrc`/`.node-version` 없음 |
| TypeScript | **^5** (`strict: true`) |

---

## 2. 프레임워크 & 핵심 의존성

| 패키지 | 버전 | 용도 |
|--------|------|------|
| next | **16.1.6** | App Router (RSC) |
| react / react-dom | **19.2.3** | React 19 |
| @tanstack/react-query | **^5.90.21** | 서버 상태 관리 |
| zustand | **^5.0.11** | 클라이언트 상태 관리 |
| zod | **^4.3.6** | 스키마 검증 (request/response) |
| react-hook-form | **^7.71.2** | 폼 관리 |
| @hookform/resolvers | **^5.2.2** | zod resolver |
| tailwindcss | **^4** (v4) | CSS (PostCSS 플러그인) |
| class-variance-authority | **^0.7.1** | variant 기반 className |
| clsx | **^2.1.1** | className 조합 |
| tailwind-merge | **^3.5.0** | Tailwind 클래스 충돌 해소 |
| radix-ui | **^1.4.3** | Headless UI 프리미티브 |
| lucide-react | **^0.575.0** | 아이콘 |
| shadcn | **^3.8.5** (devDep) | UI 컴포넌트 scaffolding |

---

## 3. 테스트 & 품질 도구

| 패키지 | 버전 | 용도 |
|--------|------|------|
| vitest | **^4.0.18** | 유닛/컴포넌트 테스트 |
| @testing-library/react | **^16.3.2** | React 테스트 유틸 |
| @vitest/browser-playwright | **4.0.18** | 브라우저 테스트 |
| msw | **^2.12.10** | API 모킹 |
| storybook | **^10.2.10** | 컴포넌트 문서/테스트 |
| playwright | **^1.58.2** | E2E 테스트 |
| @t3-oss/env-nextjs | **^0.13.10** | 환경변수 zod 검증 |

---

## 4. 코드 스타일 & 린트 규칙

### Prettier (`.prettierrc`)

```json
{
  "semi": false,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

- **세미콜론 없음**
- **쌍따옴표** 사용 (`singleQuote: false`)
- 후행 쉼표 전부 사용
- 줄 길이 100자
- Tailwind 클래스 자동 정렬

### ESLint (Flat Config, ESLint 9)

```
eslint-config-next/core-web-vitals   → Next.js 권장 규칙
eslint-config-next/typescript         → TS 규칙
eslint-config-prettier                → Prettier 충돌 비활성화
eslint-plugin-storybook               → Storybook 규칙
@tanstack/eslint-plugin-query         → TanStack Query 규칙
```

### TypeScript (`tsconfig.json`)

- `strict: true`
- `target: ES2017`, `module: esnext`, `moduleResolution: bundler`
- Path alias: `@/*` → `./src/*` (baseUrl: `./src`)

---

## 5. 아키텍처 — FSD + Service + Query Hook Layer

```
src/
├── app/                  # Next.js App Router (라우팅, 레이아웃, providers)
├── shared/
│   ├── api/http/*        # clientFetch (transport only, credentials: include)
│   ├── ui/               # Text, Button 등 공통 컴포넌트
│   └── config/           # env.ts (@t3-oss/env-nextjs)
├── entities/
│   └── <domain>/
│       ├── api/          # zod 스키마 + service 함수 (검증 필수)
│       └── model/        # query-keys.ts
└── features/
    └── <domain>/
        └── <use-case>/
            ├── model/    # useQuery/useMutation 훅
            └── ui/       # 컴포넌트
```

### 데이터 흐름

```
clientFetch (HTTP) → Service (zod validate) → Query Hook (TanStack Query) → UI (React)
```

### Layer 규칙

1. **Shared HTTP Layer** (`src/shared/api/http/*`)
   - transport만 담당 (fetch, headers, credentials, retry, ApiError)
   - 도메인 비즈니스 로직 금지
   - `credentials: "include"`, 401에서만 refresh, 동시 실패 시 lock 1개, 재시도 1회
   - Auth refresh endpoint: `/v1/api/auth/refresh`

2. **Entity Service Layer** (`src/entities/<domain>/api/*`)
   - endpoint 계약 + zod 스키마 검증
   - 패턴: validate request → `clientFetch<unknown>(...)` → validate response → return typed data
   - 검증 실패 시 `ApiError` throw

3. **Query Hook Layer** (`src/features/<domain>/<use-case>/model/*`)
   - Service 함수를 TanStack Query 훅으로 래핑
   - `useQuery`: 서버 상태 캐싱
   - `useMutation`: side effect (invalidate/remove query keys, auth state 동기화)
   - raw fetch 로직 금지

4. **UI Layer** (`src/features/*/ui/*`, `src/app/*`)
   - 훅만 소비, 렌더링과 인터랙션에 집중
   - 라우트 구성은 `src/app`

---

## 6. API 공통 규약

| 항목 | 값 |
|------|-----|
| Base URL | `/v1/api/` |
| 인증 | JWT HttpOnly Cookie |
| 응답 래퍼 | `{ success: boolean, message: string, data: T }` |
| 에러 응답 | `{ success: false, message: string, data: ErrorResponseCode (number) }` |
| 페이지네이션 | 커서 기반: `{ content: T[], nextCursor, hasNext }` / `?cursor=&size=20` |

### Auth 흐름

```
401 발생 → /v1/api/auth/refresh 시도 → 실패 시 auth store "unauthenticated" → /login?next= 리다이렉트
```

---

## 7. 도메인 Skills

비즈니스 로직 상세는 `.claude/skills/` 디렉토리 참고.

| Skill | 도메인 | 핵심 |
|-------|--------|------|
| auth-user | Auth + User | JWT 쿠키, 역할(CLIENT/EXPERT/BOTH/ADMIN), FCM 토큰 |
| ticket | Ticket + Proposal + Agreement | 의뢰 등록/피드/상태전이, 제안서, 합의서(온라인 전용) |
| coupon | Coupon | PortOne V2 결제, 쿠폰 잔량, 웰컴쿠폰 |
| chat | Chat | 폴링 기반 메시지, MessageType별 렌더링 |
| delivery | Delivery | 온라인 전용, 24h 자동승인, 수정횟수 제한 |
| review | Review | 채팅 스냅샷 리뷰, 48h 필터링, 별점/답변 |
| payment | Payment | 에스크로 결제 (isEscrow: true 필수), PortOne V2 |
| notification | Notification | FCM 푸시 + 알림센터, NotificationType별 라우팅 |
| typography-rules | Typography | Text 컴포넌트 타이포그래피 토큰 매핑 |
| vercel-react-best-practices | Performance | React/Next.js 성능 최적화 규칙 (67개 rules) |

### 전체 워크플로 (프론트 관점)

```
1. 회원가입/로그인 → JWT 토큰 획득 → FCM 토큰 등록
2. (의뢰인) 쿠폰 구매 → 티켓 등록 (쿠폰 RESERVED)
3. (전문가) 피드 탐색 → 제안서 발송
4. (의뢰인) 제안서 비교 → 수락 (매칭 확정, 쿠폰 CONSUMED)
5. 채팅 오픈 → 일정/조건 협의
6. [온라인] 합의서 → 에스크로 결제 → 서비스 진행
   [오프라인] 바로 서비스 진행 (당사자 직접 결제)
7. [온라인] 작업물 전달 → 승인 → 에스크로 정산
   [오프라인] 완료 확인 (48시간 자동)
8. 리뷰 자동 생성 → 48시간 필터링 → 별점 → 공개
```

---

## 8. Flutter → Next.js 매핑 참고

one-pointer-mobile (Flutter) subagent를 이 프로젝트용으로 수정할 때 참고.

| Flutter (mobile) | Next.js (web) |
|-------------------|---------------|
| Dart | **TypeScript 5 (strict)** |
| Flutter Widget | **React 19 (RSC + Client Components)** |
| Navigator / GoRouter | **Next.js App Router (`src/app`)** |
| Provider / Riverpod / Bloc | **Zustand (client) + TanStack Query v5 (server)** |
| Flutter Form / TextFormField | **react-hook-form + @hookform/resolvers + zod** |
| Widget 스타일링 | **Tailwind CSS v4 + CVA + Radix UI + shadcn** |
| Dio / http | **clientFetch (credentials: include) + zod validation** |
| Flutter test | **Vitest + Testing Library + Playwright + MSW + Storybook** |
| Dart formatter | **Prettier (no semi, double quotes, printWidth 100)** |
| dart analyze | **ESLint 9 Flat Config (next/core-web-vitals + typescript)** |
| Clean Architecture | **FSD (Feature-Sliced Design)** — 4-layer data flow |
| pub | **pnpm** |
| freezed / json_serializable | **zod (v4)** — 스키마 정의 + 런타임 검증 |
| flutter_secure_storage | **HttpOnly Cookie (JWT)** |
| firebase_messaging | **FCM (Web Push API)** |

---

## 9. npm scripts

```bash
pnpm dev              # 개발 서버
pnpm dev:https        # HTTPS 개발 서버 (mkcert)
pnpm build            # 프로덕션 빌드
pnpm lint             # ESLint
pnpm format           # Prettier 적용
pnpm format:check     # Prettier 검사
pnpm test             # Vitest
pnpm storybook        # Storybook (포트 6006)
pnpm build-storybook  # Storybook 빌드
```
