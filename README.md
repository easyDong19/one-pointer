# one-pointer

> **"코드를 한 줄도 직접 짜지 않고, 바이브 코딩만으로 프로덕션급 프론트엔드를 어디까지 만들 수 있는가"** 를 검증한 실험 프로젝트.
> 목적은 서비스 운영이 아니라, **사람은 기획·설계·컨벤션·방향 제시만 하고 구현은 전적으로 AI에게 맡겼을 때 도달 가능한 코드 품질·아키텍처의 한계** 확인.

<p>
  <img alt="Vibe Coding" src="https://img.shields.io/badge/built_by-vibe_coding-8b5cf6" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs" />
  <img alt="React" src="https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white" />
  <img alt="TailwindCSS" src="https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white" />
</p>

- **소재** — 전문가·사용자를 연결하는 매칭·상담 플랫폼 (실시간 채팅 상담 · 결제 · 산출물 제출 · 리뷰 · 분쟁/환불)
- **결과물** — App Router(RSC) 기반 **약 557개 파일 / 19개 기능 도메인**을 Feature-Sliced Design 으로 구조화한 프론트엔드

---

## 🧪 프로젝트 목적 — 바이브 코딩 실험

이 저장소의 핵심은 **결과물 자체가 아니라 만든 방식**.

- **코드는 100% AI 생성** — 사람이 손으로 작성한 프로덕션 코드 0줄. 모든 구현은 코딩 에이전트(Claude Code)에 지시해 생성.
- **사람의 역할은 기획·설계·가드레일** — 무엇을 만들지(기획), 어떤 구조·컨벤션으로 만들지(아키텍처·규칙)를 정의하고, AI 출력을 방향 제시·리뷰로 수렴.
- **검증 가설** — "명확한 기획과 강한 컨벤션·명세를 갖추면, 손코딩 없이도 실서비스급 복잡도(실시간 통신·결제·인증·분쟁 처리)와 일관된 아키텍처에 도달 가능한가?"

### 실험을 가능하게 한 가드레일 (사람이 만든 부분)

품질이 흔들리지 않은 이유 = AI를 자유롭게 두지 않고 **강한 규칙·명세로 경계를 세운 것**. 그 규칙들은 이 저장소에 그대로 존재.

- **아키텍처 규칙** — Feature-Sliced Design 계층 분리, CSR/SSR 판단 기준 (`CLAUDE.md`, `.claude/skills/fe`)
- **패턴 강제** — 모든 모달은 overlay-kit 명령형 오프너로, 폼은 react-hook-form + Zod v4 로 통일 (`CLAUDE.md`, `.claude/skills/form`)
- **디자인 시스템 규칙** — 색상·간격·radius 토큰만 사용(하드코딩 금지), Pretendard 단일 서체 (`.claude/skills/design-system`)
- **도메인/명세 문서** — API 스펙(Zod 스키마), 기능별 웨이브 플래너, 도메인 상세 명세로 구현 전 맥락 고정

> 즉, **"AI가 잘 짜준 것"이 아니라 "AI가 잘 짜도록 설계·통제한 것"** — 그게 사람이 한 일.

아래 `✨ 기술적 하이라이트` 는 그렇게 나온 결과물 — 손코딩 없이 도달한 구조·품질이라는 점에 주목.

---

## ✨ 기술적 하이라이트

손코딩 없이 **기획·컨벤션·명세만으로 유도해 도달한 구현 결과**. 모든 항목은 저장소 코드로 확인 가능.

### 아키텍처 — Feature-Sliced Design 전면 적용

- 557개 파일을 **`app` / `features` / `entities` / `shared` 4계층**으로 분리 → 도메인 경계·의존성 방향 강제.
- `entities/<도메인>` — `api`(schema·service·server-service) / `model`(query-keys) / `lib` 구조로 **도메인 데이터 로직 캡슐화**.
- `features/<도메인>` — 위를 조합해 화면 기능 구현 (예: `features/chat` → `room` / `realtime` / `list` / `banner` 슬라이스).

### 타입 안전 데이터 레이어 — 커스텀 HTTP 클라이언트 직접 구현

- 외부 fetch 래퍼 없이 **`fetch` 기반 HTTP 클라이언트 직접 설계** (`shared/api/http`).
- **CSR용 `client-fetch` / SSR용 `server-fetch` 분리** — 서버 컴포넌트는 쿠키 포워딩, 클라이언트는 `credentials: include` 로 경로 이원화.
- 모든 응답 **Zod v4 스키마로 런타임 파싱** → 타입 추론·검증 일원화, 실패는 표준 `ApiError` 로 정규화.
- **401 시 refresh token 자동 재발급** — CSR·SSR 양쪽 경로에 구현 (`refresh-token.ts`).
- 환경 변수 **`@t3-oss/env-nextjs` + Zod** 타입/검증 → 누락 시 빌드 타임 실패.

### 서버 상태 / 클라이언트 상태 분리

- **TanStack Query** — 서버 상태(캐싱·무효화·리페치) 관리.
- **Zustand** — 클라이언트 UI 상태 관리.
- 캐시 키를 도메인별 `*.query-keys.ts` 로 중앙화 → 무효화 범위 명시적 통제.

### 실시간 채팅 — STOMP over WebSocket

- **`@stomp/stompjs`** 기반 실시간 메시징.
- WebSocket 엔드포인트를 별도 설정 없이 **`BASE_URL` origin 에서 `wss://{host}/ws` 로 자동 파생** → 환경별 설정 부담 제거.

### 결제 연동 — PortOne

- **`@portone/browser-sdk`** 결제 연동, 리다이렉트 결과(`payment/portone-result`) 처리 흐름 구성.

### 명령형 모달 패턴 — overlay-kit

- 프로젝트 내 모든 모달/다이얼로그/컨펌을 **`overlay-kit` 명령형 오프너 패턴**으로 통일.
- 부모가 `open` state 를 prop drilling 하는 방식 제거, **결과를 `Promise` 로 반환**해 흐름 제어 단순화.
- 닫힘 시 매번 새 인스턴스로 마운트 → 다이얼로그 내부 폼 state 잔존 버그 원천 차단.

### 폼 — react-hook-form + Zod v4

- `react-hook-form` + `@hookform/resolvers` + Zod v4 조합으로 유효성 검사·에러 표시, API 레이어와 **도메인 스키마 재사용**.

### 디자인 시스템 & 접근성

- **Radix UI + shadcn/ui + CVA + tailwind-merge** 재사용 컴포넌트, 색상·간격·radius 를 **디자인 토큰**으로 통일(하드코딩 금지).
- `next-themes` 다크모드, `Pretendard` 단일 서체 정책, `tabular-nums` 기반 숫자 정렬.

### 품질 — 테스트 & 비주얼 회귀

- **Vitest + Testing Library + Playwright 브라우저 러너 + MSW(API 목킹) + v8 커버리지** 로 테스트 환경 구성.
- **Storybook 10 + a11y 애드온 + Chromatic** 으로 컴포넌트 문서화·비주얼 회귀 테스트 병행.

### 보안 하드닝

- `next.config.ts` 에 **HSTS · X-Frame-Options · CSP `frame-ancestors` · X-Content-Type-Options · Referrer-Policy** 등 전역 보안 헤더를 적용했습니다.
- `mkcert` 기반 **로컬 HTTPS 개발 환경**으로 쿠키/보안 헤더 동작을 실제와 동일하게 검증합니다.

---

## 기술 스택

| 영역 | 스택 |
| --- | --- |
| Framework | Next.js 16 (App Router / RSC), React 19, TypeScript 5 |
| Styling / UI | Tailwind CSS 4, Radix UI, shadcn/ui, CVA, tailwind-merge, lucide-react, tw-animate-css |
| 데이터 | 커스텀 fetch HTTP 클라이언트, TanStack Query, Zustand |
| 폼 / 검증 | react-hook-form, Zod 4, @hookform/resolvers, @t3-oss/env-nextjs |
| 실시간 / 결제 | @stomp/stompjs (WebSocket), @portone/browser-sdk |
| UX | overlay-kit(모달), sonner(토스트), next-themes(다크모드), embla-carousel, react-day-picker, recharts, react-markdown |
| 테스트 | Vitest, Testing Library, Playwright, MSW, @vitest/coverage-v8 |
| 문서 / 품질 | Storybook 10, @storybook/addon-a11y, Chromatic, ESLint 9, Prettier 3 |

---

## 프로젝트 구조

```
src/
├─ app/         # Next.js App Router — 라우트·레이아웃 ((auth) / (main) 라우트 그룹)
├─ features/    # 기능 단위 슬라이스 (chat, payment, ticket, proposal, review, dispute ... 19개 도메인)
├─ entities/    # 도메인 엔티티 — api(schema/service) · model(query-keys) · lib (18개 도메인)
└─ shared/      # 공용 — api(http/ws), ui, config(env), hooks, lib
```

- `app/(auth)` — 로그인/회원가입 (Google·Kakao OAuth)
- `app/(main)` — 서비스 본문 (전문가, 채팅, 티켓, 제안, 결제, 리뷰, 마이페이지, 알림 등)

---

## 실행 방법

### 사전 준비

- Node.js 20+ / pnpm 9+

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

### 설치

```bash
pnpm install
```

### 환경 변수

프로젝트 루트에 `.env.development`(개발) 또는 `.env.production`(배포) 생성 후 설정.
타입/검증은 `src/shared/config/env.ts` 에서 수행.

| 변수 | 노출 | 필수 | 설명 |
| --- | --- | --- | --- |
| `BASE_URL` | 서버 | ✅ | API 베이스 URL (미설정 시 `http://localhost:3000`) |
| `NEXT_PUBLIC_PORTONE_STORE_ID` | 클라이언트 | ✅ | PortOne 상점 ID (공개값) |
| `NEXT_PUBLIC_PORTONE_CHANNEL_KEY` | 클라이언트 | ✅ | PortOne 채널 키 (공개값) |
| `NEXT_PUBLIC_PAYMENT_REDIRECT_URL` | 클라이언트 | ✅ | 결제 리다이렉트 URL |
| `NEXT_PUBLIC_BASE_URL` | 클라이언트 | – | 클라이언트 노출용 베이스 URL |
| `NEXT_PUBLIC_WS_URL` | 클라이언트 | – | 채팅 WebSocket URL override (미설정 시 `NEXT_PUBLIC_BASE_URL` origin 에서 `wss://{host}/ws` 로 자동 파생) |

> `NEXT_PUBLIC_*` 변수는 클라이언트 번들에 포함. PortOne store/channel 값은 설계상 공개되는 클라이언트 값.

### 개발 서버

```bash
pnpm dev            # http://localhost:3000
```

### HTTPS 개발 서버 (mkcert)

쿠키 인증·보안 헤더를 실제와 동일하게 확인할 때 사용.

```bash
brew install mkcert nss   # macOS
mkcert -install           # 최초 1회 로컬 신뢰 루트 설치
pnpm cert:https           # certs/ 에 인증서 발급
pnpm dev:https            # https://localhost:3000
```

백엔드 연동 시: CORS Origin 에 `https://localhost:3000` 추가, `credentials: true` 허용, 크로스사이트 쿠키면 `SameSite=None; Secure`.

### Storybook

```bash
pnpm storybook      # http://localhost:6006
```

---

## 스크립트

| 스크립트 | 설명 |
| --- | --- |
| `pnpm dev` | 개발 서버 |
| `pnpm dev:https` | 로컬 HTTPS 개발 서버 |
| `pnpm cert:https` | mkcert 로컬 인증서 발급 |
| `pnpm build` / `pnpm start` | 프로덕션 빌드 / 실행 |
| `pnpm lint` | ESLint 검사 |
| `pnpm format` / `pnpm format:check` | Prettier 정렬 / 검사 |
| `pnpm test` | Vitest |
| `pnpm storybook` / `pnpm build-storybook` | Storybook 개발 / 정적 빌드 |

### 테스트 참고

Vitest 는 Storybook 연동(`@storybook/addon-vitest`)과 Playwright 브라우저 환경을 함께 사용. 최초 1회 브라우저 설치가 필요하면:

```bash
pnpm exec playwright install chromium
```
