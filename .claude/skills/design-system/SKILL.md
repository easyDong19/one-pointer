---
name: design-system
description: 디자인 시스템 토큰 규칙. 색상·간격·radius·타이포그래피 토큰 사용법, 하드코딩 금지 원칙. /design-system 으로 호출하거나 tailwind 클래스 작성 시 반드시 읽는다.
---

# 디자인 시스템 토큰 규칙

모든 스타일 값은 `src/app/globals.css`에 정의된 토큰을 사용한다.
**임의의 hex 색상(`bg-[#fff]`)·픽셀 값(`w-[124px]`) 하드코딩 금지.**

## 색상 토큰

### 시맨틱 색상 (가장 우선 사용)

| 토큰 클래스 | 용도 |
|---|---|
| `bg-background` / `text-foreground` | 페이지 기본 배경/텍스트 |
| `bg-card` / `text-card-foreground` | 카드 배경/텍스트 |
| `bg-primary` / `text-primary-foreground` | 주요 액션 (보라 #6c5ce7) |
| `bg-primary-hover` | primary hover 상태 |
| `bg-primary-light` | primary 연한 배경 |
| `bg-secondary` / `text-secondary-foreground` | 보조 액션 |
| `bg-muted` / `text-muted-foreground` | 비활성·보조 텍스트 |
| `bg-accent` / `text-accent-foreground` | 강조 (teal) |
| `bg-destructive` / `text-destructive` | 에러·삭제 (빨강) |
| `bg-success` / `text-success-foreground` | 성공 (초록) |
| `bg-warning` / `text-warning-foreground` | 경고 (주황) |
| `border-border` | 기본 구분선 |
| `border-input` | 인풋 테두리 |
| `ring-ring` | 포커스 링 |

### Neutral 스케일

`text-neutral-{50~900}`, `bg-neutral-{50~900}`, `border-neutral-{50~900}`

| 토큰 | 값 |
|---|---|
| `neutral-50` | #f8fafc |
| `neutral-100` | #f1f5f9 |
| `neutral-200` | #e2e8f0 |
| `neutral-300` | #cbd5e1 |
| `neutral-400` | #94a3b8 |
| `neutral-500` | #64748b |
| `neutral-600` | #475569 |
| `neutral-700` | #334155 |
| `neutral-800` | #1e293b |
| `neutral-900` | #0f172a |

### 소셜 브랜드 색상

직접 hex 하드코딩 금지. CSS 변수 참조 방식 사용.

| 변수 | 대상 |
|---|---|
| `--color-kakao-bg` / `--color-kakao-fg` | 카카오 버튼 |
| `--color-google-bg` / `--color-google-fg` / `--color-google-border` | Google 버튼 |
| `--color-apple-bg` / `--color-apple-fg` | Apple 버튼 |

```tsx
// ✅ CSS 변수 참조
className="bg-(--color-kakao-bg) text-(--color-kakao-fg)"

// ❌ 하드코딩
className="bg-[#FEE500] text-[#191919]"
```

## 타이포그래피 토큰

**반드시 `Text` 컴포넌트(`@/shared/ui/text`)를 통해 사용한다.**
typography prop에 아래 토큰을 지정하면 `globals.css`의 `@utility` 클래스가 적용된다.

| typography prop | 폰트 크기 | 용도 |
|---|---|---|
| `h0-bold` | 2.5rem | 최상위 헤딩 |
| `h1-bold` | 2rem | 페이지 타이틀 |
| `h2-bold` | 1.75rem | 섹션 헤딩 |
| `h3-bold` | 1.5rem | 서브 헤딩 |
| `title-bold` | 1.375rem | 타이틀 |
| `subtitle1-bold` | 1.25rem | 카드 타이틀 |
| `subtitle2-bold` / `subtitle2-medium` | 1.125rem | 서브타이틀 |
| `body1-regular/medium/bold` | 1rem | 본문 |
| `body2-regular/medium/bold` | 0.9375rem | 본문 (주 사용) |
| `body3-regular/medium/bold` | 0.875rem | 버튼·보조 본문 |
| `caption1-medium/bold` | 0.8125rem | 캡션·에러 메시지 |
| `caption2-medium/bold` | 0.75rem | 작은 캡션 |
| `caption3-bold` | 0.6875rem | 최소 캡션 |

```tsx
// ✅ Text 컴포넌트 사용
<Text as="h1" typography="h1-bold">페이지 제목</Text>
<Text as="p" typography="body2-regular" className="text-muted-foreground">설명</Text>

// ❌ tailwind text-* 직접 사용
<p className="text-2xl font-bold">페이지 제목</p>
```

## Radius 토큰

globals.css에 정의된 radius 토큰을 사용한다.

| 클래스 | 값 |
|---|---|
| `rounded-sm` | 0.375rem |
| `rounded-md` | 0.5rem |
| `rounded-lg` | 0.625rem |
| `rounded-xl` | 0.875rem |
| `rounded-2xl` | 1.125rem |
| `rounded-3xl` | 1.375rem |
| `rounded-4xl` | 1.625rem |

## 간격(Spacing) 토큰

`op-` prefix 토큰이 정의되어 있다. tailwind 기본 숫자 spacing도 허용하나, 디자인 시스템 단위에 맞춰 `op-` 토큰 우선 사용을 권장한다.

| 토큰 | 값 | tailwind 클래스 예시 |
|---|---|---|
| `op-xs` | 0.25rem | `p-op-xs`, `gap-op-xs` |
| `op-sm` | 0.5rem | `p-op-sm`, `gap-op-sm` |
| `op-md` | 0.75rem | `p-op-md`, `gap-op-md` |
| `op-lg` | 1rem | `p-op-lg`, `gap-op-lg` |
| `op-xl` | 1.25rem | `p-op-xl`, `gap-op-xl` |
| `op-2xl` | 1.5rem | `p-op-2xl`, `gap-op-2xl` |
| `op-3xl` | 2rem | `p-op-3xl`, `gap-op-3xl` |
| `op-4xl` | 2.5rem | `p-op-4xl`, `gap-op-4xl` |
| `op-5xl` | 3rem | `p-op-5xl`, `gap-op-5xl` |

## 금지 사항

| 금지 | 대체 |
|---|---|
| `bg-[#6c5ce7]` | `bg-primary` |
| `text-[#475569]` | `text-muted-foreground` |
| `border-[#e2e8f0]` | `border-border` |
| `text-xl font-bold` (타이포 직접 조합) | `<Text typography="subtitle1-bold">` |
| 임의 hex 브랜드 색상 | `bg-(--color-kakao-bg)` 등 CSS 변수 참조 |
| `text-gray-500` (tailwind 기본 gray) | `text-neutral-500` (프로젝트 neutral 스케일) |
