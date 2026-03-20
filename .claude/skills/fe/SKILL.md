---
name: fe
description: 프론트엔드 UI 구현 규칙. FSD 계층 분리, CSR/SSR 판단, 컴포넌트 분리, shared 유틸 활용 등 모든 페이지·UI 구현 시 참고한다. /fe 로 호출하거나 새 페이지·컴포넌트를 만들 때 반드시 읽는다.
---

# 프론트엔드 UI 구현 규칙

모든 페이지·UI는 **FSD(Feature Sliced Design) 계층 분리** 원칙에 따라 구현한다.

## CSR vs SSR 판단 기준

| 기준 | SSR | CSR |
|------|-----|-----|
| SEO 필요 + 장수명 콘텐츠 | ✅ 홈, 블로그, 상품 | |
| 공개 페이지지만 단수명 콘텐츠 | | ✅ 티켓 상세 (마감일 있음) |
| 인증 필요 페이지 | | ✅ 마이페이지, 채팅 |
| 실시간 인터랙션 | | ✅ 폼, 필터, 무한스크롤 |

**판단 순서:**
1. 구글봇이 크롤링해야 하는가?
2. 콘텐츠 수명이 긴가? (마감일·상태 전이가 있으면 단수명)
3. 둘 다 아니면 → **CSR**

## FSD 계층별 역할

```
src/
├── shared/           # 도메인 무관 공용
│   ├── lib/          # 유틸 함수 (format, utils)
│   ├── ui/           # 디자인 시스템 컴포넌트 (Button, Text, Badge …)
│   ├── hooks/        # 공용 커스텀 훅
│   └── api/http/     # HTTP 클라이언트 (clientFetch, serverFetch)
│
├── entities/         # 도메인 모델 (재사용, 독립)
│   └── <domain>/
│       ├── api/      # 스키마(zod) + 서비스(API 호출)
│       ├── model/    # Query Keys
│       └── lib/      # 도메인 상수·헬퍼
│
├── features/         # 유스케이스 단위
│   └── <domain>/<use-case>/
│       ├── model/    # Query/Mutation 훅
│       └── ui/       # UI 컴포넌트 (렌더링만)
│
└── app/              # Next.js 라우트 (조합만)
    └── <route>/
        ├── page.tsx           # 서버 컴포넌트 (params 전달)
        └── _components/       # 페이지 전용 조합 컴포넌트
```

## 컴포넌트 분리 원칙

### 1. app 레이어 = 조합만

`app/_components/`의 메인 컴포넌트는 **레이아웃 조합**만 담당한다. 비즈니스 로직·UI 렌더링은 features 계층에 위임한다.

```tsx
// ✅ app/_components/ticket-detail-content.tsx — 조합만
export function TicketDetailContent({ ticketId }: { ticketId: number }) {
  const { data: ticket, isLoading } = useTicketDetailQuery(ticketId)
  // … loading/error 처리 …
  return (
    <div>
      <TicketImageCarousel images={ticket.images ?? []} onBack={…} />
      <TicketHeader ticket={ticket} />
      <TicketDescription ticket={ticket} />
      <TicketInfo ticket={ticket} />
      <TicketDesktopSidebar ticket={ticket} />
      <TicketMobileBottomBar ticket={ticket} />
    </div>
  )
}
```

### 2. features/ui = 개별 컴포넌트 파일

하나의 시각적 섹션 = 하나의 파일. 파일 하나에 몰아넣지 않는다.

```
features/<domain>/<use-case>/ui/
├── <name>-header.tsx
├── <name>-info.tsx
├── <name>-description.tsx
├── <name>-image-carousel.tsx
├── <name>-desktop-sidebar.tsx
└── <name>-mobile-bottom-bar.tsx
```

**분리 기준:**
- 시각적으로 독립된 섹션 (헤더, 본문, 사이드바 등)
- 재사용 가능성이 있는 단위
- 스크롤 영역이 다른 단위 (sticky sidebar, fixed bottom bar)

### 3. 파일 내부 보조 컴포넌트는 허용

같은 파일 안에서만 쓰이는 작은 컴포넌트(예: `InfoRow`, `BackButton`)는 같은 파일 하단에 둔다. export하지 않는다.

```tsx
// ticket-desktop-sidebar.tsx 내부
function InfoRow({ label, value }: { label: string; value: string }) {
  return (…)
}
```

## 도메인 상수

도메인 enum → 한글 라벨 매핑, 상태별 variant 매핑 등은 **entities 계층**에 둔다.

```
entities/<domain>/lib/<domain>.constants.ts
```

```typescript
// entities/ticket/lib/ticket.constants.ts
export const STATUS_LABEL: Record<string, { text: string; variant: … }> = {
  OPEN: { text: "모집중", variant: "default" },
  // …
}

export const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "초급",
  // …
}
```

**금지:** features/ui 파일 상단에 상수 인라인 정의 → entities/lib로 분리

## shared 유틸 활용

### 유틸 추가 전 확인

새 유틸을 만들기 전에 `src/shared/lib/`에 이미 있는지 확인한다.

| 파일 | 함수 | 용도 |
|------|------|------|
| `format.ts` | `formatBudget(min, max)` | 금액 범위 포맷 |
| `format.ts` | `formatDate(dateString)` | `"2026.03.20"` 형식 |
| `format.ts` | `formatDateShort(dateString)` | `"2026-03-20"` 형식 |
| `format.ts` | `formatRelativeTime(dateString)` | `"3일 전"` 형식 |
| `format.ts` | `getDaysUntilDeadline(deadlineString)` | D-day 계산 |
| `utils.ts` | `cn(...inputs)` | tailwind 클래스 병합 |

### 유틸 추가 규칙

- 2곳 이상에서 쓰이거나 쓰일 가능성 → `shared/lib/`에 추가
- 1곳에서만 쓰이는 순수 헬퍼 → 해당 파일 하단에 로컬 함수로 정의
- 도메인 특화 헬퍼 → `entities/<domain>/lib/`에 추가

## 반응형 레이아웃 패턴

### 데스크탑 2컬럼 + 모바일 1컬럼

```tsx
<div className="mx-auto max-w-5xl lg:grid lg:grid-cols-[1fr_400px] lg:items-start lg:gap-8 lg:px-6 lg:py-8">
  {/* Left: 메인 콘텐츠 */}
  <div>…</div>

  {/* Right: 사이드바 (데스크탑만) */}
  <div className="hidden lg:block">
    <div className="sticky top-8">…</div>
  </div>
</div>
```

**주의:** `sticky`가 동작하려면 그리드 컨테이너에 `lg:items-start` 필수. 기본 `stretch`면 자식 높이가 늘어나 sticky 무효화.

### 모바일 하단 고정 바

```tsx
<div className="bg-background/80 border-border/50 fixed bottom-0 left-0 right-0 z-50 border-t px-4 pb-[env(safe-area-inset-bottom,0px)] pt-3 backdrop-blur-md lg:hidden">
  <div className="mx-auto max-w-3xl pb-3">
    <Button size="lg" className="w-full rounded-xl py-6">…</Button>
  </div>
</div>
```

- `pb-[env(safe-area-inset-bottom)]` — iOS 노치 대응
- `lg:hidden` — 데스크탑에서는 사이드바 CTA 사용
- 메인 콘텐츠에 `pb-24` 추가하여 하단 바에 가려지지 않도록

## 이미지 처리

API에서 `images` 배열이 내려오면 `displayOrder`로 정렬하여 사용한다.

```tsx
const sortedImages = [...images].sort((a, b) => a.displayOrder - b.displayOrder)
```

이미지가 없을 때는 빈 placeholder(`bg-muted`)를 보여준다. 하드코딩된 placeholder URL 사용 금지.

## 금지 사항

- 컴포넌트 파일 하나에 300줄 이상 몰아넣기 금지 → 섹션별 파일 분리
- app 레이어에서 비즈니스 로직 직접 구현 금지 → features 계층 위임
- 도메인 상수를 UI 파일에 인라인 정의 금지 → entities/lib 분리
- shared에 이미 있는 유틸을 컴포넌트 파일에 중복 구현 금지
- placeholder 이미지 URL 하드코딩 금지 → API 데이터 또는 빈 상태 UI
- `sticky` 사용 시 부모 `items-start` 누락 금지
