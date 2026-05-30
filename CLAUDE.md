# CLAUDE.md

## 도메인 & 비즈니스 로직

기획서 및 도메인별 비즈니스 로직은 `.claude/skills/` 디렉토리에 정리되어 있다.
새로운 기능 구현이나 도메인 파악이 필요할 때 반드시 해당 디렉토리를 먼저 확인할 것.

## 명세서 & 플래너

모노레포 루트 `../docs/` 디렉토리에 명세서·플래너·디자인 가이드가 정리되어 있다. 작업 착수 전 관련 문서를 먼저 확인할 것.

- `../docs/api/` — API 스펙 (Zod v4 스키마 마크다운, 도메인별 `{##}-{domain}.md`)
- `../docs/plan/` — 기능별 웨이브 플래너 (예: `wave-13-ticket-edit-mode.md`, `web-roadmap.md`)
- `../docs/domain/` — 도메인별 상세 명세 (chat, expert, inquiry 등)
- `../docs/design/` — 디자인·레이아웃 정책 (예: `LAYOUT.md`)
- `../docs/app/`, `../docs/web/`, `../docs/components/`, `../docs/refactor/`, `../docs/bug-fix/`, `../docs/seo/`, `../docs/img_reference/` — 그 외 영역별 문서

## 타이포그래피

**프로젝트 전체 서체는 Pretendard 단일.** 다른 서체(monospace 포함) 도입 금지.

- 본문/헤더/메타/캡션 모두 Pretendard. 본문에 mono 톤이 필요해 보일 때도 쓰지 않는다 — 위계와 한글 가독성을 해친다.
- 숫자 정렬·표 같은 모노스페이스 효용이 필요한 곳은 **`tabular-nums`** 클래스로 처리. `font-mono` 는 사용하지 않는다.
- `globals.css` 의 `--font-mono` CSS 변수는 Pretendard 로 alias 되어 있어 실수로 `font-mono` 를 써도 시각적으로 깨지지 않지만, 코드상에서도 쓰지 않는 것이 원칙.
- 새 서체(serif/display/등) 도입은 디자인 정책 변경 사안이라 별도 합의 후에만.

## 레이아웃

`(main)` 하위 페이지는 반드시 `@/shared/ui/page-shell` 의 `PageShell` 을 루트로 사용한다.
tier (`shell` / `content` / `list` / `form`) 만 고르면 max-width · padding · pb-24 · md:pt-14
등이 자동 적용되며, 개별 페이지가 `mx-auto max-w-* px-*` 를 직접 선언하지 않는다.
세부 정책: `../docs/design/LAYOUT.md`.

## 모달 / 다이얼로그

**프로젝트 내 모든 모달·다이얼로그·confirm 은 `overlay-kit` 의 명령형 오프너 패턴으로 관리한다.**
부모 컴포넌트가 `open` state 를 들고 자식 다이얼로그에 `open / onOpenChange` 를 prop drilling 하는 방식은 금지.

### 이유
- 닫혀있을 때 다이얼로그 컴포넌트가 트리에 머물러 내부 state(폼 입력값, 선택 옵션 등) 가 잔존하는 버그를 원천 차단한다 — 매번 새 인스턴스로 마운트되므로 `useState(initialValue)` 가 항상 fresh 하게 평가된다.
- 부모가 `dialogOpen`, `editingItem` 등 다이얼로그 보조 state 를 들고 있을 필요가 없어진다.
- 결과(제출 데이터/취소 여부) 가 Promise 로 반환되어 흐름 제어가 명령형 코드처럼 단순해진다.

### 패턴

오프너 함수 위치: `features/<domain>/lib/open-<feature>-*.tsx`
다이얼로그 컴포넌트 위치: `features/<domain>/ui/*-dialog.tsx` 또는 라우트 `_components/`

```tsx
// open-foo-form.tsx
"use client"
import { overlay } from "overlay-kit"
import { FooFormDialog } from "../ui/foo-form-dialog"

export function openFooForm(initial?: Foo): Promise<FooFormData | null> {
  return new Promise((resolve) => {
    overlay.open(({ isOpen, close, unmount }) => (
      <FooFormDialog
        isOpen={isOpen}
        initial={initial}
        onSubmit={(data) => { resolve(data); close(); setTimeout(unmount, 300) }}
        onClose={() => { resolve(null); close(); setTimeout(unmount, 300) }}
      />
    ))
  })
}
```

다이얼로그 컴포넌트 props:
- `isOpen: boolean` — overlay-kit 의 닫힘 애니메이션 트리거용
- `onSubmit / onSelect / onConfirm` — 결과 통보 콜백
- `onClose` — 취소/배경 클릭/ESC 통보 콜백

내부 `<Dialog>` 의 `onOpenChange` 는 `(open) => !open && onClose()` 로 연결.
`close()` 호출 후 `setTimeout(unmount, 300)` 으로 closing 애니메이션 시간 확보.

### Mutation 책임
오프너는 **데이터만 반환**한다. mutation 호출, alert/toast 등 부수 효과는 **호출하는 부모**에서 처리.
이유: 다이얼로그를 mutation 무관한 dumb 컴포넌트로 유지해 재사용성·테스트성 확보.

### 공용 confirm
삭제 확인 등 단순 컨펌은 `@/shared/lib/open-confirm-dialog` 의 `openConfirm()` 사용. 별도 dialog 컴포넌트를 새로 만들지 않는다.

### 기존 사례 (참고)
- [`features/mypage/lib/open-expert-register-prompt.tsx`](src/features/mypage/lib/open-expert-register-prompt.tsx)
- [`features/region/select/lib/open-region-picker.tsx`](src/features/region/select/lib/open-region-picker.tsx)
- [`features/auth/guard/lib/open-login-prompt.tsx`](src/features/auth/guard/lib/open-login-prompt.tsx)

## 작업 완료 후 절차 (커밋/배포)

하나의 작업(기능·수정·리디자인 등)을 끝내면 **항상 사용자에게 "커밋 → push → PR → main 머지 → 최신화"를 진행할지 물어본다.** 동의 없이 자동으로 커밋/푸시/머지하지 않는다.

- 진행 동의 시 `ship` 스킬(`/ship`)의 절차를 따른다 (브랜치 생성 → 커밋 → push → `gh` PR → 충돌 없으면 머지 → `git pull` 최신화).
- 그 전에 항상 `tsc` / `eslint` 로 검증한다.
- **dev 서버는 직접 켜거나 localhost 로 접속해 확인하지 않는다.** 런타임 확인은 사용자가 직접 한다.
- 충돌(`CONFLICTING`)·CI 실패 등 예외는 임의 해결하지 말고 보고 후 지시를 받는다.
