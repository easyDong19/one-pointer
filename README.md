# one-pointer

Next.js 16(App Router) 기반 프론트엔드 프로젝트입니다.

## 기술 스택

- Framework: Next.js 16.1.6, React 19.2.3, TypeScript 5
- Styling/UI: Tailwind CSS 4, tw-animate-css, shadcn/ui, lucide-react
- Data & Form: @tanstack/react-query, ky, react-hook-form, zod, @hookform/resolvers
- Test: Vitest, Testing Library, Storybook addon-vitest, Playwright
- Lint/Format: ESLint 9, Prettier 3, prettier-plugin-tailwindcss
- Storybook: Storybook 10 (`@storybook/nextjs-vite`)

## 사전 준비

- Node.js LTS 권장 (20+)
- pnpm 9+

pnpm이 없다면:

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

## 의존성 설치

```bash
pnpm install
```

## 환경 변수 설정

프로젝트 루트에 `.env.development`(개발) 또는 `.env.production`(배포) 파일을 만들고 사용하세요.
`src/shared/config/env.ts`에서 타입/검증을 수행합니다.

현재 코드 기준 환경 변수:

- 필수: `BASE_URL` (서버 전용)
- 선택: `NEXT_PUBLIC_BASE_URL` (클라이언트 노출)

```bash
touch .env.development
```

`NEXT_PUBLIC_`로 시작하는 변수는 클라이언트 코드에서 접근 가능합니다.

## 실행 방법

개발 서버:

```bash
pnpm dev
```

브라우저에서 `http://localhost:3000` 접속

HTTPS 개발 서버 (mkcert):

```bash
# macOS(Homebrew)에서 mkcert 설치
brew install mkcert nss

# 최초 1회 (로컬 신뢰 루트 설치)
mkcert -install

# 인증서 발급 (프로젝트 certs/에 생성)
pnpm cert:https

# HTTPS 개발 서버 실행
pnpm dev:https
```

브라우저에서 `https://localhost:3000` 접속

백엔드 연동 시 체크사항:

- CORS Origin에 `https://localhost:3000` 추가
- `credentials: true` 허용 (쿠키 인증 사용 시)
- 크로스사이트 쿠키 정책이면 `SameSite=None; Secure` 설정 필요

스토리북:

```bash
pnpm storybook
```

브라우저에서 `http://localhost:6006` 접속

## 스크립트

- `pnpm dev`: Next.js 개발 서버
- `pnpm cert:https`: mkcert 로컬 인증서 생성 (`certs/localhost*.pem`)
- `pnpm dev:https`: 로컬 인증서로 HTTPS 개발 서버 실행
- `pnpm build`: 프로덕션 빌드
- `pnpm start`: 빌드 결과 실행
- `pnpm lint`: ESLint 검사
- `pnpm format`: Prettier 자동 정렬
- `pnpm format:check`: Prettier 검사만 수행
- `pnpm test`: Vitest 실행
- `pnpm storybook`: Storybook 개발 서버
- `pnpm build-storybook`: Storybook 정적 빌드

## 테스트 관련 참고

Vitest는 Storybook 연동(`@storybook/addon-vitest`)과 Playwright 브라우저 환경을 함께 사용합니다.

최초 1회 브라우저 설치가 필요하면:

```bash
pnpm exec playwright install chromium
```

## 프로젝트 구조

- `src/app/`: Next.js App Router 페이지/레이아웃
- `src/shared/`: 공용 UI/유틸/API/환경설정
- `src/entities/`: 도메인 엔티티 레이어
- `src/features/`: 기능 단위 레이어
- `__tests__/`: 단위 테스트
- `.storybook/`: Storybook 설정
- `stories/`: 스토리북 예제/문서 스토리

## 문서

- `docs/README.md`: 프로젝트 문서 인덱스
- `docs/design-system/README.md`: 컬러 디자인 시스템 가이드
- `docs/http-fetch/README.md`: fetch 기반 API 레이어 사용 가이드
