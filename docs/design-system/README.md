# Design System - Color

프로젝트 컬러 시스템은 `app/globals.css`의 CSS 변수 토큰을 기준으로 동작합니다.  
핵심 원칙은 "값(HEX) 직접 사용"이 아니라 "역할 토큰 사용"입니다.

- 값 변경 위치: `app/globals.css`
- 컴포넌트 적용 예시: `components/ui/button.tsx`
- 시각 확인: `stories/ColorPalette.stories.tsx`

## 1) 토큰 구조

### Surface (배경/표면)

- `--background`: 페이지 기본 배경
- `--card`: 카드/패널 배경
- `--popover`: 팝오버/드롭다운 배경
- `--muted`: 보조 영역 배경
- `--border`, `--input`, `--ring`: 경계/입력/포커스

### Foreground (전경: 텍스트/아이콘)

- `--foreground`: 페이지 기본 텍스트
- `--card-foreground`, `--popover-foreground`
- `--muted-foreground`
- 상태/브랜드 페어용 `--*-foreground`
  - `--primary-foreground`, `--secondary-foreground`, `--accent-foreground`
  - `--success-foreground`, `--warning-foreground`, `--destructive-foreground`

### Brand + Semantic

- Brand: `--primary`, `--primary-hover`, `--primary-light`, `--secondary`, `--accent`
- Semantic: `--success`, `--warning`, `--destructive`

### Neutral Scale

- `--neutral-50` ~ `--neutral-900`

## 2) 꼭 지킬 규칙

1. 배경 토큰과 전경 토큰은 페어로 사용합니다.  
   예: `bg-primary`를 쓰면 텍스트는 `text-primary-foreground`.
2. 일반 본문은 항상 `text-foreground`를 기본으로 둡니다.
3. 설명/보조 문구만 `text-muted-foreground`를 사용합니다.
4. 색으로 의미를 주는 컴포넌트(상태 배지, 경고 박스)는 semantic 토큰을 우선 사용합니다.

## 3) 컴포넌트별 권장 매핑

### Page / Layout

- 컨테이너: `bg-background text-foreground`
- 구분선: `border-border`

### Card / Panel

- 표면: `bg-card`
- 텍스트: `text-card-foreground`
- 보조 문구: `text-muted-foreground`

### Button

- 기본 CTA: `bg-primary text-primary-foreground hover:bg-primary-hover`
- 보조: `bg-secondary text-secondary-foreground`
- 아웃라인: `bg-background border-input` + hover에 `bg-accent text-accent-foreground`
- 성공/주의/위험: `success`, `warning`, `destructive` 토큰 사용

### Badge / Status Pill

- 완료: `bg-success text-success-foreground`
- 주의: `bg-warning text-warning-foreground`
- 에러: `bg-destructive text-destructive-foreground`
- 중립: `bg-muted text-muted-foreground`

### Input / Form

- 입력 배경: `bg-background`
- 경계: `border-input`
- 포커스: `focus-visible:ring-ring`
- 라벨/본문: `text-foreground`
- 설명/에러 보조 문구: `text-muted-foreground` 또는 semantic tone

## 4) Text 컴포넌트 색상 가이드

Text 컴포넌트를 만들 때 아래 variant를 권장합니다.

- `body`, `title`: `text-foreground`
- `caption`, `helper`: `text-muted-foreground`
- `link`: `text-primary` + hover `text-primary-hover`
- `onPrimary`: `text-primary-foreground`
- `onSecondary`: `text-secondary-foreground`
- `onAccent`: `text-accent-foreground`
- `onSuccess`: `text-success-foreground`
- `onWarning`: `text-warning-foreground`
- `onDestructive`: `text-destructive-foreground`

## 5) 접근성 메모

가독성 이슈를 줄이기 위해 foreground 페어를 맞춰야 합니다.  
예: `warning/success`는 배경 위 흰 텍스트 대신 전용 foreground를 사용하도록 조정되어 있습니다.

- `--success-foreground: #052E16`
- `--warning-foreground: #1F2937`

## 6) Storybook에서 확인하는 법

`Design/Color Palette` 스토리에서 다음을 확인할 수 있습니다.

- Brand + Semantic 색상
- Foreground Pair Tokens (배경/텍스트 페어 미리보기)
- Neutral Gray Scale

실행:

```bash
pnpm storybook
```
